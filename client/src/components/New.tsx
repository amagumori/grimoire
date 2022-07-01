import React, { createRef, useMemo, useRef, PureComponent, FunctionComponent, useEffect, useState } from 'react';
import { Log } from '../Types'
import { useDispatch, useSelector } from 'react-redux'
import { EntityState, EntityId } from '@reduxjs/toolkit'

import { fetchLogs, selectLogs, logsSelectors, makeSelectByTimestamp, select24h, selectRange, makeSelectRange } from '../services/logs'
import store, { useAppDispatch } from '../services/store'
import { Draggable, EndMarker } from './Draggable'
import { CLI } from './CLI-new'

import { getSunrise, getSunset } from 'sunrise-sunset-js'

import { BiBody, BiCctv, BiShapePolygon, BiCycling, BiDna, BiEqualizer } from 'react-icons/bi'

interface TimeBarProps {
  initialStart: number, 
  initialEnd: number
}

export const TimeBar: FunctionComponent<TimeBarProps> = ( { initialStart, initialEnd } ) => {
  const dispatch = useAppDispatch()
  const timebarRef: React.RefObject<HTMLDivElement> = useRef(null)

  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)

  const [viewStart, setViewStart] = useState(0)
  const [viewEnd, setViewEnd] = useState(0)

  
  const [ loaded, setLoaded ] = useState(false)
  const [ currentLogId, setCurrentLogId ] = useState(0)
  const [ entryViewHidden, toggleEntryView ] = useState(true)
  const [ clientWidth, setClientWidth ] = useState(0)
  const [ clientOffset, setClientOffset ] = useState(0)
  const [ endMarkerPos, setEndMarker ] = useState(0)
  const [ spanMarkerHidden, toggleSpanMarker] = useState(true)
  const [ playheadPos, setPlayheadPos ] = useState(0)

  const [ zoomFactor, setZoomFactor ] = useState(0)

  const [ logFormActive, setLogFormActive ] = useState(false)

  const [ offset, setOffset ] = useState(0)

  const timespan = endTime - startTime
  const msToPixRatio = clientWidth / timespan
  const pixToMsRatio = timespan / clientWidth

  // worst one-liner in history?
  const playheadTimestamp = Math.trunc( startTime + ( pixToMsRatio * ( playheadPos - clientOffset ) ) )

  const nowOffset = ( Date.now() - startTime ) * msToPixRatio

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

  return (
    <div className="timebar-wrapper">
      <CLI updateTimespan={ updateTimeSpent } toggleSpanMarker={ toggleSpanMarker } timestamp={ playheadTimestamp}></CLI>
      <div className="timebar" ref={timebarRef} >
        <Draggable hidden={false} classString="gg-pin-alt playhead" setPlayheadPos={ setPlayheadPos } parentWidth={ clientWidth } parentX={ clientOffset } nowOffset={ playheadPos } />
        <TimeSpan hidden={spanMarkerHidden} offset={ playheadPos } width={ endMarkerPos } /> 
        <EndMarker hidden={spanMarkerHidden} offset={ playheadPos + endMarkerPos } />
        <TimebarCase start={Date.now() - (86400000*14) } end={Date.now()} clientWidth={clientWidth} setLogHook={setCurrentLogId} />
      </div>
  
      <EntryView id={currentLogId} hidden={false} />
    </div>
  )
}

// sizeratio between case and container
// client width
// current offset
// current zoom level i e pix to ms ratio
// 

interface CaseProps {
  start: number,
    end: number,
  clientWidth: number,
  setLogHook: Function
}

const TimebarCase: FunctionComponent<CaseProps> = ( { start, end, clientWidth, setLogHook } ) => {

  const [ width, setWidth ] = useState(clientWidth)

  const span = end - start
  const zoomFactor = 0.5;
  const msToPixRatio = width / span 
  const pixToMsRatio = span / width 

  const [ offset, setOffset ] = useState(0)
  const [ zoom, setZoom ] = useState(1)
  const [ shiftPressed, setShiftPressed ] = useState(false)

  const myStart = Math.min( start, (  start - ( ( width / clientWidth ) * span * pixToMsRatio ) / 2 ) ) 
  const myEnd = Math.max( end, (  end + ( ( width / clientWidth ) * span * pixToMsRatio ) / 2 ) ) 
  //const myEnd = end + ( ( zoom * zoomFactor ) * pixToMsRatio )

  const handleWheel = ( e: WheelEvent ) => {
    e.preventDefault()
    if ( e.shiftKey ) {
      console.info('yes')
      setWidth( (prev) => (prev + e.deltaY * zoomFactor) > 0 ? ( prev+e.deltaY * zoomFactor ) : 0 ) 
    } else {
      setOffset( (prev) => prev + e.deltaY )
    }
  }    

  useEffect( () => {
    setWidth( clientWidth )
    document.addEventListener( 'wheel', handleWheel, true )
    return () => {
      document.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const logsInRange = selectRange(store.getState())(myStart, myEnd)
 
  const entries = logsInRange.map( (log) => {
    let offset = (log.timestamp - start) * msToPixRatio
    let width = log.timeSpent * msToPixRatio
    let css = {
      left: offset,
      width: width
    }
    return ( <div className="timebar-entry" key={log.id} style={css} onClick={ ( e ) => setLogHook(log.id) } ></div> )
  })
  
  let css = {
    width: width,
    transform: `translateX(${offset}px)`
  }


  let tickTime = new Date( start - ( offset * pixToMsRatio ) )
  let tickEnd = new Date(tickTime.getTime() + ( clientWidth * pixToMsRatio ) )

  let tickSpan = tickEnd.getTime() - tickTime.getTime()
  let tickPeriod = tickSpan / 7

  let ticks = []

  for ( let i=0; i < 7; i++ ) {
    let offset = tickPeriod * i;
    tickTime.setTime( tickTime.getTime() + offset );
    ticks.push( (<div className="tick-mark">{ tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }</div> ) );
    //console.log( tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) );
  }

  return (
    <div className="timebar-wrapper">
      <div className="timebar-case" style={css}>{entries}</div>
      <div className="tick-line">
        { ticks }
      </div>
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


// use zoomLevel ( timespan ) and offset / playheadPos / timestamp 
// could do optional prop of scrollDelta, attach event handler in parent, pass as prop, only update translate IF scrollDelta != 0
// use mutableRefObject<number> and pass as prop?
// or could attach eventhandler in each and every one.

interface EntryViewProps {
  id: number
  hidden: boolean
}

const EntryView: FunctionComponent<EntryViewProps> = ( { id, hidden } ) => {

  /* do "drag-auto-select" later
  const sel = makeSelectByTimestamp( timestamp )
  const log = useSelector( sel )
   */
  const log = logsSelectors.selectById( store.getState(), id )

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

  // this is just insane.  js at its absolute finest.  these are literally typed as numbers.  everywhere.
  /*
  let start = new Date(parseInt(log.timestamp))
  let end = new Date( (parseInt(log.timestamp) + parseInt(log.timeSpent) ) )
  */

  //<span className="entry-time">{ start.getHours() }:{start.getMinutes()} - { end.getHours() }:{ end.getMinutes() }</span>
  return (
    <div key={ log.id } className="entry-view">
      <div className="entry-sector">{ logIcon }</div>
      <div className="entry-time">{ new Date(+log.timestamp).toLocaleString('en-US') }</div>
      <div className="entry-time">{ log.timeSpent }</div>
      <div className="entry-description">{log.description}</div>
    </div>
  )
   
}
