import React, { FunctionComponent, useEffect, useState } from 'react';
import { Log } from '../Types'
import { useDispatch, useSelector } from 'react-redux'
import { EntityState } from '@reduxjs/toolkit'

import { fetchLogs, selectLogs, logsSelectors } from '../services/logs'
import store from '../services/store'

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

export const TimeBar: FunctionComponent<TimeBarProps> = ( props ) => {

  const dispatch = useDispatch()

  const [logs, updateLogs] = useState(0)

  const useLogsSelector = useSelector(selectLogs)

  useEffect( () => {
    dispatch(fetchLogs())
  }, [dispatch, logs])

  const dayInMs = 86400 * 1000
  const twentyFourHoursAgo = Date.now() - dayInMs

  const startDate = new Date( "2021-11-20T00:00:00+0000" )

  const today = new Date().getTime() 
  //const yesterday = new Date(today.getDate() - 1)
  const yesterday = today - dayInMs
  const now = Date.now()

  const dateDiff  = now - startDate.getTime()

  const theLogs = logsSelectors.selectAll(store.getState())

  let push = 0

  const todayDivs = theLogs.map( ( log: any, index: number, logs: any ) => {
    let unloggedWidthPercentage = 0
    let nextLog = logs[index+1]
    let prevLog = logs[index-1]
    if ( nextLog != undefined && prevLog != undefined ) {
      let nextStamp = Date.parse(nextLog.timestamp)
      let currStamp = Date.parse(log.timestamp)
      let prevStamp = Date.parse(prevLog.timestamp)
      let timeSpentMs = log.timeSpent * 1000 * 60   // timeSpent is in MINUTES!!!
      let prevTimeSpent = prevLog.timeSpent * 1000 * 60

      if ( currStamp > yesterday ) {

        //let unloggedTimeMs = nextStamp - ( currStamp + ( timeSpentMs ) )
        let unloggedTimeMs = currStamp - ( prevStamp + prevTimeSpent )
        unloggedWidthPercentage = (unloggedTimeMs / dayInMs) * 100 
        let prevLoggedWidth = ( prevTimeSpent / dayInMs ) * 100
        let loggedWidthPercentage = (timeSpentMs / dayInMs) * 100 

        

        push = loggedWidthPercentage + unloggedWidthPercentage

        let logWidth = { width: `${loggedWidthPercentage}%` }
        let logPush  = { left: `${push}%` }

        let logCSS = { width: `${loggedWidthPercentage}%`, left: `${push}%` }
  //let unloggedWidth = { width: `${unloggedWidthPercentage}%` }
        console.log('day in ms: ' + dayInMs)
        console.log('unlogged time: ' + unloggedTimeMs )
        console.log('unlogged width \%: ' + unloggedWidthPercentage)
        console.log('logged width \%: ' + loggedWidthPercentage)

        return (
          <div key={log.id} className="timebar-entry" style={ logCSS }></div>
          //<div className="timebar-unlogged" style={ unloggedWidth }></div>
        )
      }
    } else {
      let loggedWidthPercentage = ( ( log.timeSpent * 1000 ) / dayInMs) * 100 
      let logCSS = { width: `${loggedWidthPercentage}%` }

      return (
          <div key={log.id} className="timebar-entry" style={ logCSS }></div>
          //<div className="timebar-unlogged" style={ unloggedWidth }></div>
        )
    }
        
 
  })

  return (
    // "divs" goes in the timeabr
    <div className="test-timebar-container">
      <div className="timebar">
        {todayDivs}
      </div>
    </div>
  )

 console.log("selected logs: " + theLogs)
   /*
  const logsArray = theLogs.reduce( (logsArray: any, log: any ) => {
    logsArray[log.id] = log
    return logsArray
  }, {})
  */
  const divs = theLogs.map( (log: any, index: number, logs: any) => {
    let nextLog = logs[index+1]
    let unloggedWidth = 0
    if ( nextLog ) {
      // i'm starting to feel the need for MASSIVE PRECISION, OVERFLOW, AND OTHER ISSUES
      console.log('nextlog is true.')
      let nextStamp = Date.parse(nextLog.timestamp)
      let currStamp = Date.parse(log.timestamp)
      let timeSpentMs = log.timeSpent * 1000
      // timeSpent - minutes!
      let unloggedTimeDifference = nextStamp - ( currStamp + ( timeSpentMs ) )
      //console.log('unloggedTimeDifference: ' + unloggedTimeDifference)
      unloggedWidth = unloggedTimeDifference / dateDiff 
      unloggedWidth *= 100
      //console.log('unlogged width: ' + unloggedWidth)
     
    // 1440min / day
    //
    // when doing this "rendering all logs" version - need to calculate exact pixel width off actual pixel width of the timebar.
    // use index to peek next log and get time difference to generate unlogged div.
      let percentageWidth = timeSpentMs / dateDiff
      percentageWidth *= 100

      //console.log('percentageWidth: ' + percentageWidth)

    let logWidth = { width: `${percentageWidth}%` }
    let unlogWidth = { width: `${unloggedWidth}%` }

    return (
      <div>
        <div key={log.id} className="timebar-entry" style={ logWidth }></div>
        { 
          unloggedWidth > 0 &&
          <div className="timebar-unlogged" style={ unlogWidth }></div>
        } 
      </div>
    )

    }
    // so this does eerything but the last one
  })
      
}
