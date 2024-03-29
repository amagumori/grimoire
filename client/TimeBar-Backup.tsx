/*

import React, { createRef, useRef, PureComponent, FunctionComponent, useEffect, useState } from 'react';
import { Log } from '../Types'
import { useDispatch, useSelector } from 'react-redux'
import { EntityState } from '@reduxjs/toolkit'

import { fetchLogs, selectLogs, logsSelectors, allLogs } from '../services/logs'
import store from '../services/store'
import Draggable from './Draggable'
import { CLI } from './CLI'

interface TimeBarProps {
  startTime: Date
  endTime: Date

  //logs: EntityState<Log>
}

const throttleUpdates = ( f: Function ) => {
  // just fighting the type system to get this to run first
  let token: any = null, lastArgs: any = null;
  const invoke = () => {
    f(...lastArgs)
    token = null
  }
  const res = (...args: any ) => {
    lastArgs = args
    if ( !token ) {
      token = requestAnimationFrame(invoke)
    }
  }
  res.cancel = () => token && cancelAnimationFrame(token)
  return res
}

export const TimeBar: FunctionComponent<TimeBarProps> = ( props ) => {

  const timebarRef: React.RefObject<HTMLDivElement>  = useRef(null)
 
  const dispatch = useDispatch()

  // accepts a locale string
  const [time, updateTime] = useState<string>("");
  const [position, move] = useState( { x: 0, y: 0 } )
  const [loaded, setLoaded] = useState(false)
  const [logs, updateLogs] = useState(0)
  //  const useLogsSelector = useSelector(selectLogs)
 
  const newLogs = useSelector(selectLogs)

  const [width, setWidth] = useState(0)
  const [offset, setOffset] = useState(0)
  const [endPlayheadPos, setEndPlayhead] = useState(0)
  const [timeOffset, setTimeOffset] = useState(0) // ms

  const timespan = props.endTime.getTime() - props.startTime.getTime()

  var ratio = 0

    /*
  useEffect( () => {
    dispatch(fetchLogs())
    setLoaded(true)
    if ( timebarRef.current != null ) { 
      setWidth(timebarRef.current.offsetWidth)
      setOffset(timebarRef.current.offsetLeft)
    }
  }, [dispatch, logs])
  

  useEffect( () => {
    dispatch(fetchLogs())
    setLoaded(true)
    if ( timebarRef.current != null ) { 
      setWidth(timebarRef.current.offsetWidth)
      setOffset(timebarRef.current.offsetLeft)
    }
  }, [dispatch, logs])


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
  
  const divs24h = newLogs.map( (log: any, index: number, logs: any ) => {
    let unloggedWidthPercentage = 0
    let nextLog = logs[index+1]
    let prevLog = logs[index-1]

    let colorValue = Math.floor( Math.random() * 255 )

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
          backgroundColor: `rgba(255, 255, 255, ${colorValue}`
        }

        if ( log.timestamp > props.startTime && log.timestamp < props.endTime ) {
          return ( <TimeBarEntry id={log.id} log={log} css={logCSS} /> )
        }

      } else {

        let loggedWidthPercentage = ( ( log.timeSpent * 60000 ) / timespan ) * 100

        let logCSS = { 
          width: loggedWidthPercentage, 
          left: push,
          backgroundColor: `rgba(0, 255, 255, ${colorValue}`
        }

        if ( log.timestamp > props.startTime && log.timestamp < props.endTime ) {
          return ( <TimeBarEntry id={log.id} log={log} css={logCSS} /> )
        }
      }
    }
  })

  // now this is just ugly.
  const divs = theLogs.map( ( log: any, index: number, logs: any ) => {
    let unloggedWidthPercentage = 0
    let nextLog = logs[index+1]
    let prevLog = logs[index-1]

    let colorValue = Math.floor( Math.random() * 255 )

    if ( nextLog != undefined && prevLog != undefined ) {
      let nextStamp = Date.parse(nextLog.timestamp)
      let currStamp = Date.parse(log.timestamp)
      let prevStamp = Date.parse(prevLog.timestamp)

      let timeSpentMs = log.timeSpent * 1000 * 60   // timeSpent is in MINUTES!!!
      let prevTimeSpent = prevLog.timeSpent * 1000 * 60

      if ( currStamp > props.startTime.getTime() ) {

        let unloggedTimeMs = currStamp - ( prevStamp + prevTimeSpent )
        unloggedWidthPercentage = (unloggedTimeMs / timespan ) * 100 
        let prevLoggedWidth = ( prevTimeSpent / timespan ) * 100
        let loggedWidthPercentage = (timeSpentMs / timespan ) * 100 

        push = loggedWidthPercentage + unloggedWidthPercentage

        let logWidth = { width: `${loggedWidthPercentage}%` }
        let logPush  = { left: `${push}%` }

        let logCSS = { width: `${loggedWidthPercentage}%`, left: `${push}%`, "background-color": `rgba(255, 255, 255, ${colorValue}` }

        //let unloggedWidth = { width: `${unloggedWidthPercentage}%` }

        return (
          <div key={log.id} className="timebar-entry" style={ logCSS }></div>
          //<div className="timebar-unlogged" style={ unloggedWidth }></div>
        )
      }
    } else {
      let loggedWidthPercentage = ( ( log.timeSpent * 1000 * 60 ) / timespan ) * 100 
      let logCSS = { width: `${loggedWidthPercentage}%`, "background-color": `rgba(0,${colorValue}, 255, ${colorValue}` }

      return (
          <div key={log.id} className="timebar-entry" style={ logCSS }></div>
          //<div className="timebar-unlogged" style={ unloggedWidth }></div>
        )
    }
        
 
  })

  const startArrow = "gg-pin-alt"
  const endArrow = "gg-arrow-down hidden"

  return (
    <div className="timebar-wrapper">
      <CLI logs={store.getState().logs} playheadPos={ offset } endPlayheadPos={ endPlayheadPos } playheadUpdate={ playheadUpdater } ></CLI>
      <div className="timebar" ref={timebarRef} >
        {divs24h}
          { loaded ?
          <Draggable classString={ startArrow } updateTime={ updateTime } parentOffset={ 0 } parentWidth={ width } parentX={ offset } timespan={ timespan } />
        : "loading" }

        { loaded ? 
        <Draggable classString={ endArrow } updateTime={ updateTime } parentOffset={ endPlayheadPos } parentWidth={ width } parentX={ offset } timespan={ timespan } />
        : "loading" } 
      </div>
      <div className="clock"> { time } </div>
    </div>
  )

 console.log("selected logs: " + theLogs)
   /*
  const logsArray = theLogs.reduce( (logsArray: any, log: any ) => {
    logsArray[log.id] = log
    return logsArray
  }, {})
// close comment here
      
}

interface EntryProps {
  id:  number
  log: Log
  css: React.CSSProperties
}

const TimeBarEntry: FunctionComponent<EntryProps> = ( props ) => {

  return (
    <div key={ props.id } className="timebar-entry" style={ props.css }></div>
  )
}

    */
