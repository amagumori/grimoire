import React, { createRef, useRef, PureComponent, FunctionComponent, useEffect, useState } from 'react';
import { Log } from '../Types'
import { useDispatch, useSelector } from 'react-redux'
import { EntityState } from '@reduxjs/toolkit'

import { fetchLogs, selectLogs, logsSelectors, select24h } from '../services/logs'
import store from '../services/store'
import { Draggable, EndMarker } from './Draggable'
import { CLI } from './CLI'

import { BiBody, BiCctv, BiShapePolygon, BiCycling, BiDna, BiEqualizer } from 'react-icons/bi'

interface TimeBarProps {
  startTime: Date
  endTime: Date
}

export const TimeBar: FunctionComponent<TimeBarProps> = ( props ) => {

  const timebarRef: React.RefObject<HTMLDivElement>  = useRef(null)
 
  const dispatch = useDispatch()

  const logCount = useSelector( logsSelectors.selectTotal )
  const theLogs  = useSelector( logsSelectors.selectAll ) 

  const last24Logs = useSelector( select24h ) 

  // accepts a locale string
  
  const [latestLogTimestamp, setLatestTimestamp] = useState<Date>()

  const [currentLogId, setCurrentLogId] = useState(0)
  const [entryShown, setEntryShown] = useState(false)

  const [time, updateTime] = useState<string>("");
  const [loaded, setLoaded] = useState(false)
  const [logs, updateLogs] = useState(0)

  const [width, setWidth] = useState(0)
  const [offset, setOffset] = useState(0)
  const [endPlayheadPos, setEndPlayhead] = useState(0)
  const [playheadPos, setPlayheadPos] = useState(0)
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
  
  let push = 0
  const divs24h = theLogs.map( (log: any, index: number, logs: any ) => {
    let unloggedWidthPercentage = 0
    let nextLog = logs[index+1]
    let prevLog = logs[index-1]

    if ( nextLog != undefined && prevLog != undefined ) {

      let timeSpentMs = log.timeSpent * 60000
      let prevTimeSpent = prevLog.timeSpent * 60000

      if ( log.timestamp > props.startTime ) {

        let nextStamp = nextLog.timestamp.getTime()
        let currStamp = log.timestamp.getTime()
        let prevStamp = prevLog.timestamp.getTime()

        let playheadTime = Date.parse( time ) 

        if ( currStamp < playheadTime && ( currStamp + timeSpentMs ) > playheadTime ) {
          setCurrentLogId( log.id );
        }

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
          return ( <TimeBarEntry id={log.id} selectLogHook={setCurrentLogId} css={logCSS} /> )
        //}

      } else {

        let loggedWidthPercentage = ( ( log.timeSpent * 60000 ) / timespan ) * 100

        let logCSS = { 
          width: loggedWidthPercentage, 
          left: push,
          backgroundColor: `rgba(0, ${log.timeSpent}, ${log.timeSpent}, 1)`
        }

        //if ( log.timestamp > props.startTime && log.timestamp < props.endTime ) {
          return ( <TimeBarEntry id={log.id} selectLogHook={setCurrentLogId} css={logCSS} /> )
        //}
      }
    }
  })

  return (
    <div className="timebar-wrapper">
      <div>CURRENT LOG ID: { currentLogId }</div>
      <CLI logs={store.getState().logs} currentTime={ time } playheadPos={ offset } endPlayheadPos={ endPlayheadPos } playheadUpdate={ playheadUpdater } togglePlayhead={ setPlayheadVisible } ></CLI>
      <div className="timebar" ref={timebarRef} >
        {divs24h}

        <Draggable hidden={false} className="gg-pin-alt playhead" updateTime={ updateTime } setPlayheadPos={ setPlayheadPos } parentOffset={ 0 } parentWidth={ width } parentX={ offset } timespan={ timespan } />
        <TimeSpan hidden={playheadHidden} offset={ playheadPos } width={ endPlayheadPos } /> 
        <EndMarker hidden={playheadHidden} offset={ playheadPos + endPlayheadPos } />
      </div>
      <div className="clock"> { time } </div>

      <EntryView logId={currentLogId} hidden={entryShown} />
    </div>
  )

}

interface TimeSpanProps {
  hidden: boolean
  offset: number
  width: number 
}

const TimeSpan: FunctionComponent<TimeSpanProps> = ( { hidden, offset, width } ) => {
  return (
    <div style={{
      position: "absolute",
        width: width,
        height: "12px",
      left: offset,
      background: "#00ee99"
    }}>
    </div>
  )
}


interface EntryProps {
  id:  number
  selectLogHook: Function
  css: React.CSSProperties
}

const TimeBarEntry: FunctionComponent<EntryProps> = ( props ) => {

  const baseCSS = props.css
  let setLogId = props.selectLogHook

  let baseColor = props.css.backgroundColor

  const [css, setCSS] = useState<React.CSSProperties>()
    
  const onMouseEnter = ( e: React.MouseEvent<HTMLDivElement> ) => {
    let color = { background: 'red' } 
    let newCSS = { ...baseCSS, ...color }
    setCSS( { ...color, ...baseCSS } )
  }

  const onMouseLeave = ( e: React.MouseEvent<HTMLDivElement> ) => {
    let newColor = { background: baseColor }
    let newCSS = { ...baseCSS, newColor }
    setCSS( { ...baseCSS, ...newColor } )
  }

  const onClick = ( e: React.MouseEvent<HTMLDivElement> ) => {
    setLogId( props.id )
  }

  return (
    <div key={ props.id } className="timebar-entry" style={ css } onClick={ onClick } onMouseOver={onMouseEnter} onMouseLeave={onMouseLeave}>
    </div>
  )
}
interface EntryViewProps {
  logId: number
  hidden: boolean
}

const EntryView: FunctionComponent<EntryViewProps> = ( props ) => {

  const [ hidden, toggleHidden ] = useState(false)

  const log = logsSelectors.selectById( store.getState(), props.logId )

  let logIcon = ( <div className="placeholder" /> )

  if ( log != undefined ) {
    switch ( log.sector ) {
      case 1:
        logIcon = ( <BiCctv /> )
        break;
      case 2:
        logIcon = ( <BiShapePolygon /> )
        break;
      case 3:
        logIcon = ( <BiEqualizer /> )
        break;
      default:
        break;
    }
  }

  if ( !log ) {
    return null
  }

  // this is just insane
  let start = new Date(log.timestamp)
  let end = new Date( start.getTime() + ( log.timeSpent * 60000 ) )

  return (
    <div>
    { hidden ? 
    <div key={ props.logId} className="entry-view">
      <div className="entry-time">{ start.getHours() }:{start.getMinutes()} - { end.getHours() }:{ end.getMinutes()} </div>
      <div className="sector">{ logIcon }</div>
      <div className="entry-description">{log.description}</div>
    </div> 
    : 
    <div key={ props.logId } className="entry-view">
      <div className="sector">{ logIcon } <span className="entry-time">{ start.getHours() }:{start.getMinutes()} - { end.getHours() }:{ end.getMinutes()}</span></div>
      <div className="entry-description">{log.description}</div>
    </div> 
    }
    </div>
  )
   
}
