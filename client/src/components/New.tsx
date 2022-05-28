import React, { createRef, useRef, PureComponent, FunctionComponent, useEffect, useState } from 'react';
import { Log } from '../Types'
import { useDispatch, useSelector } from 'react-redux'
import { EntityState } from '@reduxjs/toolkit'

import { fetchLogs, selectLogs, logsSelectors, makeSelectByTimestamp, select24h, makeSelectRange } from '../services/logs'
import store, { useAppDispatch } from '../services/store'
import { Draggable, EndMarker } from './Draggable'
import { CLI } from './CLI-new'

import { BiBody, BiCctv, BiShapePolygon, BiCycling, BiDna, BiEqualizer } from 'react-icons/bi'

// we'll wrap our picker around the timebar for now.
export const TimeBarContainer: FunctionComponent = () => {

  const now = Date.now()
  const day = new Date( now - 86400000 )

  const [ start, setStart ] = useState(new Date(now))
  const [ end, setEnd ] = useState( new Date(day) )

  const setDay = (e : React.MouseEvent<HTMLButtonElement> ) => { 
    setStart( day ) 
  }
  const setWeek = (e : React.MouseEvent<HTMLButtonElement> ) => {
    setStart( new Date( now - 604800000 ) )
  }
  const setMonth = (e : React.MouseEvent<HTMLButtonElement> ) => {
    setStart( new Date( now - 2629800000 ) )
  }

  return ( 
  <div className='timebar-wrapper'>
    <div className='timebar-buttons'>
      <button onClick={ setDay }>DAY</button>
      <button onClick={ setWeek }>WEEK</button>
      <button onClick={ setMonth }>MONTH</button>
    </div>
      <TimeBar startTime={start} endTime={end} /> 
    </div>
  )
}

interface TimeBarProps {
  startTime: Date
  endTime: Date
}

export const TimeBar: FunctionComponent<TimeBarProps> = ( props ) => {
  const dispatch = useAppDispatch()
  const timebarRef: React.RefObject<HTMLDivElement> = useRef(null)

  const selectRange = makeSelectRange( props.startTime.getTime(), props.endTime.getTime() )

  const theLogs = useSelector( selectRange );

  const [ loaded, setLoaded ] = useState(false)
  const [ currentLogId, setCurrentLogId ] = useState(0)
  const [ entryViewHidden, toggleEntryView ] = useState(true)
  const [ clientWidth, setClientWidth ] = useState(0)
  const [ clientOffset, setClientOffset ] = useState(0)
  const [ endMarkerPos, setEndMarker ] = useState(0)
  const [ spanMarkerHidden, toggleSpanMarker] = useState(true)
  const [ playheadPos, setPlayheadPos ] = useState(0)

  const [ logFormActive, setLogFormActive ] = useState(false)

  const now = new Date( Date.now() )
  const timespan = props.endTime.getTime() - props.startTime.getTime()
  const msToPixRatio = clientWidth / timespan

  const pixToMsRatio = timespan / clientWidth
  // worst one-liner in history?
  const playheadTimestamp = Math.trunc( props.startTime.getTime() + ( pixToMsRatio * ( playheadPos - clientOffset ) ) )
  const selectByTimestamp = makeSelectByTimestamp( playheadTimestamp )

  const nowOffset = ( now.getTime() - props.startTime.getTime() ) * msToPixRatio

  const updateTimeSpent = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    let val
    if ( !val ) val = 0
    val = parseInt( e.target.value ) * 60000
    val *= msToPixRatio 
    setEndMarker( Math.trunc(val) ) 
  }

  useEffect( () => {
    dispatch( fetchLogs() )
    setLoaded(true)
    if ( timebarRef.current != null ) {
      setClientWidth( timebarRef.current.offsetWidth )
      setClientOffset( timebarRef.current.offsetLeft )
    }
  }, [dispatch])

  let d = new Date(playheadTimestamp).toLocaleString('en-US')

  let offset = 0
  const timeRatio = (time: number) => { return ( time / timespan ) }

  const entries = theLogs.map( (log: Log, index: number, logs: Array<Log> ) => {
    let currentTs = new Date( log.timestamp ).getTime()
    let offset = timeRatio( currentTs - props.startTime.getTime() )
    offset *= clientWidth
    //let perc = timeRatio( log.timeSpent )   // should be ms as with everything now.
    let perc = `${timeRatio(log.timeSpent) * 100 }%`
    let rand0 = Math.random()
    let rand1 = Math.random()
    let css = {
      width: perc,
      left: offset,
      backgroundColor: `rgba(${rand1 * 255}, ${rand0 * 255}, ${rand1 * 255}, ${rand0 * 255} )`
    }
    return ( <TimeBarEntry id={log.id ? log.id : -1 } selectLogHook={setCurrentLogId} css={css} /> )
  })

  return (
    <div className="timebar-wrapper">
      <div>CURRENT LOG ID: { currentLogId }</div>
      <CLI updateTimespan={ updateTimeSpent } toggleSpanMarker={ toggleSpanMarker } timestamp={ playheadTimestamp}></CLI>
      <div className="timebar" ref={timebarRef} >

        {entries}

        <Draggable hidden={false} classString="gg-pin-alt playhead" setPlayheadPos={ setPlayheadPos } parentWidth={ clientWidth } parentX={ clientOffset } nowOffset={ nowOffset } />
        <TimeSpan hidden={spanMarkerHidden} offset={ playheadPos } width={ endMarkerPos } /> 
      <EndMarker hidden={spanMarkerHidden} offset={ playheadPos + endMarkerPos } />
      </div>
      <div className="clock"> { d } </div>
      <div className="clock"> { pixToMsRatio } </div>
      <div className="clock"> { playheadPos } </div>
      <div className="clock"> { msToPixRatio } </div>
      <div className="clock"> { timespan } </div>

      <EntryView timestamp={playheadTimestamp} hidden={false} />
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
    <div className="timespan breathe" style={{
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

const TimeBarEntry: FunctionComponent<EntryProps> = ( { id, selectLogHook, css } ) => {

  //const baseCSS = props.css

  //let baseColor = props.css.backgroundColor

  //const [css, setCSS] = useState<React.CSSProperties>()

    /*
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
     */

  const onClick = ( e: React.MouseEvent<HTMLDivElement> ) => {
    selectLogHook( id )
  }

  // style
  return (
    <div key={ id } className="timebar-entry" style={css} onClick={ onClick }>
    </div>
  )
}
interface EntryViewProps {
  timestamp: number
  hidden: boolean
}

const EntryView: FunctionComponent<EntryViewProps> = ( { timestamp, hidden } ) => {

  const sel = makeSelectByTimestamp( timestamp )
  const log = useSelector( sel )

  let logIcon = ( <div className="placeholder" /> )

  if ( log != undefined ) {
    switch ( log.sector ) {
      case "visual":
        logIcon = ( <BiCctv /> )
        break;
      case "programming":
        logIcon = ( <BiShapePolygon /> )
        break;
      case "music":
        logIcon = ( <BiEqualizer /> )
        break;
      default:
        break;
    }
  }

  if ( !log ) {
    return null
  }

  if ( hidden ) return null

  // this is just insane
  let start = new Date(log.timestamp)
  let end = new Date( start.getTime() + ( log.timeSpent ) )

  //<span className="entry-time">{ start.getHours() }:{start.getMinutes()} - { end.getHours() }:{ end.getMinutes() }</span>
  return (
    <div key={ log.id } className="entry-view">
      <div className="sector">{ logIcon }</div>
      <div className="entry-time">{ start.toLocaleString('en-US') }</div>
      <div className="entry-time">{ end.toLocaleString('en-US') }</div>
      <div className="entry-description">{log.description}</div>
    </div>
  )
   
}
