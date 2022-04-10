import React, { createRef, useRef, PureComponent, FunctionComponent, useEffect, useState } from 'react';
import { Log } from '../Types'
import { useDispatch, useSelector } from 'react-redux'
import { EntityState } from '@reduxjs/toolkit'

import { fetchLogs, selectLogs, logsSelectors, select24h } from '../services/logs'
import store from '../services/store'
import { Draggable, EndMarker } from './Draggable'
import { CLI } from './CLI-new'

import { BiBody, BiCctv, BiShapePolygon, BiCycling, BiDna, BiEqualizer } from 'react-icons/bi'

interface TimeBarProps {
  startTime: Date
  endTime: Date
}

export const TimeBar: FunctionComponent<TimeBarProps> = ( props ) => {
  const dispatch = useDispatch()
  const timebarRef: React.RefObject<HTMLDivElement> = useRef(null)

  const theLogs = useSelector( logsSelectors.selectAll )
  const last24  = useSelector( select24h )

  const [ loaded, setLoaded ] = useState(false)
  const [ currentLogId, setCurrentLogId ] = useState(0)
  const [ entryViewHidden, toggleEntryView ] = useState(true)
  const [ clientWidth, setClientWidth ] = useState(0)
  const [ clientOffset, setClientOffset ] = useState(0)
  const [ endMarkerPos, setEndMarker ] = useState(0)
  const [ endMarkerHidden, toggleEndMarker ] = useState(true)
  const [ playheadPos, setPlayheadPos ] = useState(0)

  const [ logFormActive, setLogFormActive ] = useState(false)

  const now = new Date( Date.now() )
  const timespan = props.endTime.getTime() - props.startTime.getTime()
  const ratio = clientWidth / timespan
  // worst one-liner in history?
  const timeStamp  = new Date( props.startTime.getTime() + ( ratio * ( playheadPos - clientOffset ) ) )
  const time  = timeStamp.toLocaleString('en-US')

  const nowOffset = ( now.getTime() - props.startTime.getTime() ) * ratio

  const updateTimeSpent = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    let val
    if ( !val ) val = 0
    val = parseInt( e.target.value ) * 60000
    val *= ratio
    setEndMarker( Math.trunc(val) ) 
  }

  const toggleMarker = ( e: React.FocusEvent<HTMLInputElement> ) => {
    toggleEndMarker(false)
  }

  const toggleLogFormActive = ( e: React.FocusEvent ) => {
    setLogFormActive(!logFormActive)
  }

    /*
  const toggleLogFormActiveInput = ( e: React.FocusEvent<HTMLInputElement> ) => {
    setLogFormActive(!logFormActive)
  }
     */


  useEffect( () => {
    dispatch( fetchLogs() )
    setLoaded(true)
    if ( timebarRef.current != null ) {
      setClientWidth( timebarRef.current.offsetWidth )
      setClientOffset( timebarRef.current.offsetLeft )
    }
  }, [dispatch])

  let logsToShow = theLogs.filter( (log) => {
    // take this out to see if it will compare stored Date objects as "real" ones
    let ts = new Date( log.timestamp ).getTime()
    return ts > props.startTime.getTime() && ts < props.endTime.getTime()
  })

  let offset = 0
  const timeRatio = (time: number) => { return ( time / timespan ) * 100 }
  const entries = theLogs.map( (log: Log, index: number, logs: Array<Log> ) => {
    let nextLog = logs[index+1]
    let prevLog = logs[index-1]
    let currTimestamp = new Date(log.timestamp).getTime()

    if ( nextLog != undefined && prevLog != undefined ) {
      let prevTimestamp = new Date(prevLog.timestamp).getTime()
      let unloggedTimeMs = currTimestamp - ( prevTimestamp + prevLog.timeSpent )
      let unloggedPercentage = timeRatio(unloggedTimeMs)
      let prevLoggedWidth = timeRatio(prevLog.timeSpent)
      let loggedPercentage = timeRatio(log.timeSpent)

      offset += loggedPercentage + unloggedPercentage

      let css = {
        width: loggedPercentage,
        left: offset,
        backgroundColor: `rgba(0, 255, 255, ${255 * ( log.timeSpent / 3600000 )})`
      }

      // quick hack until figure out a better way to use serial ids that are only backend side
      return ( <TimeBarEntry id={log.id ? log.id : -1} selectLogHook={setCurrentLogId} css={css} /> )

    } else {
      let loggedPercentage = ( log.timeSpent / timespan ) * 100
      let css = {
        width: loggedPercentage,
        left: offset,
        backgroundColor: `rgba(0, 255, 180, ${log.timeSpent})`
      }

      return ( <TimeBarEntry id={log.id ? log.id : -1} selectLogHook={setCurrentLogId} css={css} /> )
    }
  })
    //<CLI hidden={ logFormActive } toggleLogFormActive={ toggleLogFormActive } playheadPos={ offset } endPlayheadPos={ endMarkerPos } updateTimeSpent={ updateTimeSpent } toggleEndMarker={ toggleMarker } ></CLI>
 
  return (
    <div className="timebar-wrapper">
      <div>CURRENT LOG ID: { currentLogId }</div>
      <CLI timestamp={ timeStamp } toggleSpanMarker={toggleMarker} updateTimeSpent={updateTimeSpent} />
      <div className="timebar" ref={timebarRef} >

        {entries}

        <Draggable hidden={false} classString="gg-pin-alt playhead" setPlayheadPos={ setPlayheadPos } parentWidth={ clientWidth } parentX={ clientOffset } nowOffset={ nowOffset } />
        <TimeSpan hidden={endMarkerHidden} offset={ playheadPos } width={ endMarkerPos } /> 
      <EndMarker hidden={endMarkerHidden} offset={ playheadPos + endMarkerPos } />
      </div>
      <div className="clock"> { time } </div>

      <EntryView logId={currentLogId} hidden={entryViewHidden} />
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
      display: "inline",
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
