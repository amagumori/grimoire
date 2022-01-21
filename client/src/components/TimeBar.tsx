import React, { createRef, useRef, PureComponent, FunctionComponent, useEffect, useState } from 'react';
import { Log } from '../Types'
import { useDispatch, useSelector } from 'react-redux'
import { EntityState } from '@reduxjs/toolkit'

import { fetchLogs, selectLogs, logsSelectors } from '../services/logs'
import store from '../services/store'
import Draggable from './Draggable'

interface TimeBarProps {
  startTime: Date
  endTime: Date

  logs: EntityState<Log>
}

// so the real thing i want to implement is going to be tricky.  an infinitely scrollable time bar of a fixed width.
// the element widths should be calculated as a function of clientwidth, maybe.
// 
// the naive thing is just to literally render ALL divs.  i.e. render every single fucking log in the timebar.
// honestly i think this is fine.  a year of entries, a couple thousand divs?  
// what's the worst that could happen?
// LOL
//
// so - render a flexbox with a div for every log, and then set scrollLeft to show the correct time range ( past 24h etc ) 
//
// i think what makes most sense is granular control over the timebar time span.
// 24h / week / month / ytd / all ?

// this is so dumb
//type MaybeLog = Log | undefined
//const peek: LogPeek = ( next: Log | undefined ) => return next ?? undefined

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
  const [logs, updateLogs] = useState(0)
  const [position, move] = useState( { x: 0, y: 0 } )
  const [loaded, setLoaded] = useState(false)

  const useLogsSelector = useSelector(selectLogs)

  const [width, setWidth] = useState(0)
  const [offset, setOffset] = useState(0)

  useEffect( () => {
    dispatch(fetchLogs())
    setLoaded(true)
    if ( timebarRef.current != null ) { 
      setWidth(timebarRef.current.offsetWidth)
      setOffset(timebarRef.current.offsetLeft)
    }
  }, [dispatch, logs])

  const timespan = props.endTime.getTime() - props.startTime.getTime()

  console.log('timespan: ' + timespan)

  const theLogs = logsSelectors.selectAll(store.getState())

  let push = 0
  
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

        //let unloggedTimeMs = nextStamp - ( currStamp + ( timeSpentMs ) )
        let unloggedTimeMs = currStamp - ( prevStamp + prevTimeSpent )
        unloggedWidthPercentage = (unloggedTimeMs / timespan ) * 100 
        let prevLoggedWidth = ( prevTimeSpent / timespan ) * 100
        let loggedWidthPercentage = (timeSpentMs / timespan ) * 100 

        push = loggedWidthPercentage + unloggedWidthPercentage

        let logWidth = { width: `${loggedWidthPercentage}%` }
        let logPush  = { left: `${push}%` }

        let logCSS = { width: `${loggedWidthPercentage}%`, left: `${push}%`, "background-color": `rgba(255, 255, 255, ${colorValue}` }
  //let unloggedWidth = { width: `${unloggedWidthPercentage}%` }
        console.log('timespan in ms: ' + timespan )
        console.log('unlogged time: ' + unloggedTimeMs )
        console.log('unlogged width \%: ' + unloggedWidthPercentage)
        console.log('logged width \%: ' + loggedWidthPercentage)

        return (
          <div key={log.id} className="timebar-entry" style={ logCSS }></div>
          //<div className="timebar-unlogged" style={ unloggedWidth }></div>
        )
      }
    } else {
      let loggedWidthPercentage = ( ( log.timeSpent * 1000 * 60 ) / timespan ) * 100 
      let logCSS = { width: `${loggedWidthPercentage}%`, "background-color": `rgba(255,${colorValue}, 255, ${colorValue}` }

      return (
          <div key={log.id} className="timebar-entry" style={ logCSS }></div>
          //<div className="timebar-unlogged" style={ unloggedWidth }></div>
        )
    }
        
 
  })

  return (
    // "divs" goes in the timeabr
    <div className="test-timebar-container">
      
      <div className="timebar" ref={timebarRef} >
        {divs}
          { loaded ? 
          <Draggable updateTime={ updateTime } parentWidth={ width } parentX={ offset } timespan={ timespan } />
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
  */
      
}

