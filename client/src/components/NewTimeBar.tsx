import React, { createRef, useRef, PureComponent, FunctionComponent, useEffect, useState } from 'react';
import { Log } from '../Types'
import { useDispatch, useSelector } from 'react-redux'
import { EntityState } from '@reduxjs/toolkit'

import { fetchLogs, selectLogs, logsSelectors } from '../services/logs'
import store from '../services/store'
import Draggable from './Draggable'
import { CLI } from './CLI'

interface TimeBarProps {
  startTime: Date
  endTime: Date
}

export const TimeBar: FunctionComponent<TimeBarProps> = ( props ) => {

  const timebarRef: React.RefObject<HTMLDivElement>  = useRef(null)
 
  const dispatch = useDispatch()

  // accepts a locale string
  
  const [latestLogTimestamp, setLatestTimestamp] = useState<Date>()

  const [time, updateTime] = useState<string>("");
  const [loaded, setLoaded] = useState(false)
  const [logs, updateLogs] = useState(0)

  const [width, setWidth] = useState(0)
  const [offset, setOffset] = useState(0)
  const [endPlayheadPos, setEndPlayhead] = useState(0)
  const [playheadHidden, togglePlayhead] = useState(true)
  const [timeOffset, setTimeOffset] = useState(0) // ms

  const timespan = props.endTime.getTime() - props.startTime.getTime()

  var ratio = 0

  useEffect( () => {
    dispatch(fetchLogs())
    setLoaded(true)
    if ( timebarRef.current != null ) { 
      setWidth(timebarRef.current.offsetWidth)
      setOffset(timebarRef.current.offsetLeft)
    }
  }, [dispatch, logs])

  const totalEntities = logsSelectors.selectTotal(store.getState())
  const lastLog = logsSelectors.selectById(store.getState(), totalEntities - 1)

  const theLogs = logsSelectors.selectAll(store.getState())

  let push = 0

  const playheadUpdater = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    let val = parseInt( e.target.value ) * 60000
    let deltaT = 0;
    if ( val > 0 ) {
      ratio = width / timespan
      deltaT = val * ratio
      console.log("deltaT: " + deltaT)
    }
    setEndPlayhead( Math.trunc(deltaT) )
  }

  const setPlayheadVisible = ( e: React.FocusEvent<HTMLInputElement> ) => {
      togglePlayhead(false)
  }
  
  const divs24h = theLogs.map( (log: any, index: number, logs: any ) => {
    let unloggedWidthPercentage = 0
    let nextLog = logs[index+1]
    let prevLog = logs[index-1]

    if ( nextLog != undefined && prevLog != undefined ) {

      let timeSpentMs = log.timeSpent * 60000
      let prevTimeSpent = prevLog.timeSpent * 60000

      if ( log.timestamp > props.startTime ) {

        let nextStamp = Date.parse(nextLog.timestamp)
        let currStamp = Date.parse(log.timestamp)
        let prevStamp = Date.parse(prevLog.timestamp)

        let unloggedTimeMs = currStamp - ( prevStamp + prevTimeSpent )
        unloggedWidthPercentage = (unloggedTimeMs / timespan ) * 100 
        let prevLoggedWidth = ( prevTimeSpent / timespan ) * 100
        let loggedWidthPercentage = (timeSpentMs / timespan ) * 100 

        push = loggedWidthPercentage + unloggedWidthPercentage
        
        let logCSS = { 
          width: loggedWidthPercentage, 
          left: push,
          backgroundColor: `rgba(255, 255, 255, ${log.timeSpent} )`
        }

        //if ( log.timestamp > props.startTime && log.timestamp < props.endTime ) {
          return ( <TimeBarEntry id={log.id} log={log} css={logCSS} /> )
        //}

      } else {

        let loggedWidthPercentage = ( ( log.timeSpent * 60000 ) / timespan ) * 100

        let logCSS = { 
          width: loggedWidthPercentage, 
          left: push,
          backgroundColor: `rgba(0, ${log.timeSpent}, ${log.timeSpent}, 1)`
        }

        //if ( log.timestamp > props.startTime && log.timestamp < props.endTime ) {
          return ( <TimeBarEntry id={log.id} log={log} css={logCSS} /> )
        //}
      }
    }
  })

  const startArrow = "gg-pin-alt playhead"
  const endArrow = "gg-arrow-down"
  const endArrowHidden = "gg-arrow-down hidden"

  return (
    <div className="timebar-wrapper">
      <CLI logs={store.getState().logs} playheadPos={ offset } endPlayheadPos={ endPlayheadPos } playheadUpdate={ playheadUpdater } togglePlayhead={ setPlayheadVisible } ></CLI>
      <div className="timebar" ref={timebarRef} >
        {divs24h}
          { loaded ?
          <Draggable classString={ startArrow } updateTime={ updateTime } parentOffset={ 0 } parentWidth={ width } parentX={ offset } timespan={ timespan } />
        : "loading" }

        { playheadHidden ? 
        <Draggable classString={ endArrow } updateTime={ updateTime } parentOffset={ endPlayheadPos } parentWidth={ width } parentX={ offset } timespan={ timespan } />
        : <Draggable classString={ endArrowHidden } updateTime={ updateTime } parentOffset={ endPlayheadPos } parentWidth={ width } parentX={ offset } timespan={ timespan } />
        }
      </div>
      <div className="clock"> { time } </div>
    </div>
  )

}

interface EntryProps {
  id:  number
  log: Log
  css: React.CSSProperties
}

const TimeBarEntry: FunctionComponent<EntryProps> = ( props ) => {

  return (
    <div key={ props.id } className="timebar-entry" style={ props.css }>
    </div>
  )
}

