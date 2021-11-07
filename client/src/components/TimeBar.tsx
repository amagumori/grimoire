import React, { FunctionComponent, useEffect, useState } from 'react';
import { Log } from '../Types'
import { useDispatch, useSelector } from 'react-redux'
import { EntityState } from '@reduxjs/toolkit'

import { fetchLogs, selectLogs, logsSelectors } from '../services/logs'
import store from '../services/store'

interface TimeBarProps {
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

  const dayInSeconds = 86400
  const twentyFourHoursAgo = Date.now() - dayInSeconds

  const theLogs = logsSelectors.selectAll(store.getState())

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
      let unloggedTimeDifference = nextStamp - ( currStamp + log.timeSpent)
      console.log('unloggedTimeDifference: ' + unloggedTimeDifference)
      //let unloggedTimeDifference = nextLog.timestamp - ( log.timestamp + log.timeSpent )
      unloggedWidth = unloggedTimeDifference / dayInSeconds
      unloggedWidth *= 100
      console.log('unlogged width: ' + unloggedWidth)
    } else { 
    // 1440min / day
    //
    // when doing this "rendering all logs" version - need to calculate exact pixel width off actual pixel width of the timebar.
    // use index to peek next log and get time difference to generate unlogged div.
    let percentageWidth = log.timeSpent as number / dayInSeconds
    percentageWidth *= 100

    console.log('percentageWidth: ' + percentageWidth)

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
  })
      
  return (
    // "divs" goes in the timeabr
    <div className="timebar">
      {divs}
    </div>
  )
}
