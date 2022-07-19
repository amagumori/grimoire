import React, { createRef, useMemo, useRef, PureComponent, FunctionComponent, useEffect, useState } from 'react';
import { Log } from '../Types'
import { useDispatch, useSelector } from 'react-redux'
import { EntityState, EntityId } from '@reduxjs/toolkit'

import { fetchLogs, selectLogs, logsSelectors, makeSelectByTimestamp, select24h, selectRange, makeSelectRange } from '../services/logs'
import store, { useAppDispatch } from '../services/store'
import { Draggable, EndMarker } from './Draggable'
import { CLI } from './CLI'

import { getSunrise, getSunset } from 'sunrise-sunset-js'

import { BiBody, BiCctv, BiShapePolygon, BiCycling, BiDna, BiEqualizer } from 'react-icons/bi'

const myLatitude = 45.5208891606035
const myLongitude = -122.63695355201227

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
        <TimebarCase start={Date.now() - (86400000*365) } end={Date.now()} clientWidth={clientWidth} setLogHook={setCurrentLogId} />
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

  // 3 months
  // the default length of time represented by the bar of -clientWidth-.
  const defaultZoomSpan = 2629800000 * 3

  //const [ zoomSpan, setZoomSpan ] = useState(defaultZoomSpan)

  // use a float to store zoomFactor to scale our pixToMsRatio
  const [ zoomFactor, setZoomFactor ] = useState(1.0);
    
  const [ width, setWidth ] = useState(clientWidth)

  const span = end - start

  const [ caseStart, setCaseStart ] = useState( 0)
  const [ caseEnd, setCaseEnd ] = useState( 0 ) 

  const msToPixRatio = width / span
  const pixToMsRatio = (span / width == Infinity) ? 0 : ( span / width )

  const [ offset, setOffset ] = useState(0)
  const [ zoom, setZoom ] = useState(1)
  const [ shiftPressed, setShiftPressed ] = useState(false)

    
  const myStart = Math.min( start, (  start - ( ( width / clientWidth ) * span * pixToMsRatio ) / 2 ) ) 
  const myEnd = Math.max( end, (  end + ( ( width / clientWidth ) * span * pixToMsRatio ) / 2 ) )
     

  const handleWheel = ( e: WheelEvent ) => {
    e.preventDefault()
    if ( e.shiftKey ) {
      console.info('yes')
      setZoomFactor( (prev) => prev * 1.111 );
      if ( e.deltaY >= 0 ) {
        setWidth( (prev) => (prev + e.deltaY * zoomFactor))
      } else {
        setWidth( (prev) => (prev + e.deltaY * (1/zoomFactor)) )
      }
      //setWidth( (prev) => (prev + e.deltaY * zoomFactor) > 0 ? ( prev+e.deltaY * zoomFactor ) : 0 ) 
      setCaseStart( (prev) => prev - ( offset * pixToMsRatio ) )
      setCaseEnd( (prev) => prev + ( offset * pixToMsRatio ) )
    } else {
      // think in terms of time.  offset in time then convert to a pix value.
      setOffset( (prev) => prev + ( e.deltaY + 0.00001 ) )
      setCaseStart( (prev) => prev - ( offset * pixToMsRatio ) )
      setCaseEnd( (prev) => prev + ( offset * pixToMsRatio ) )
    }
  }    

  useEffect( () => {
    setWidth( clientWidth )
    document.addEventListener( 'wheel', handleWheel, true )
    return () => {
      document.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const logsInRange = selectRange(store.getState())(start, end) 

  function strip( num: any ) {
    return ( parseFloat(num).toPrecision(12))
  }

  // position the entries with very, very high precision decimal pct value
  const entries = logsInRange.map( (log) => {
    let pctOffset = ( (log.timestamp - start) / span ) * 100
    let off = strip(pctOffset)
    let pctWidth = ( log.timeSpent / span ) * 100
    let wi = strip(pctWidth)
    let css = {
      left: `${off}%`,
      width: `${wi}%`
    }
    return ( <div className="timebar-entry" key={log.id} style={css} onClick={ ( e ) => setLogHook(log.id) } ></div> )
  })
  
  let css = {
    width: width,
    transform: `translateX(${offset}px)`
  }

  const caseStartTimestamp = start - ( offset * pixToMsRatio )
  const caseEndTimestamp = end + ( offset * pixToMsRatio ) 
  const caseSpan = caseEndTimestamp - caseStartTimestamp 

  const numTicks = 8
  const ticks = [ ...Array(numTicks)].map( (e, i) => {
    let offset = (i/numTicks) * ( caseEnd - caseStart ) 
    return ( 
      <div className="tick-mark" style={ { left: `${(i/numTicks) * 100}%` } }>
        { new Date( caseStart + offset ).toLocaleDateString([], { day: 'numeric', month: 'numeric' }) }
      </div>
    )

  })

    /*
  let tickPeriod = caseSpan / 8
  let tickTime = new Date( caseStartTimestamp ) 
  let tickFormat = 'date'
  let ticks = []

  for ( let i=0; i < 8; i++ ) {
    let offset = tickPeriod * i;
    tickTime.setTime( tickTime.getTime() + offset );
    
    if ( tickFormat == 'time' ) {
      ticks.push( (<div className="tick-mark">{ tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }</div> ) );
    } else if ( tickFormat == 'date' ) {
      ticks.push( (<div className="tick-mark">{ tickTime.toLocaleDateString([], { day: 'numeric', month: 'numeric' }) }</div> ) );
    } else {
      console.log('whoops')
    }
  }
  */


  const sunriseColor = "#d9b7b8"
  const noonColor = "#b8d3de"
  const sunsetColor = "#a53b34"
  const nightColor = "#605d65"

  let startDate = new Date( Math.trunc(caseStartTimestamp) ).toLocaleString('en-US')
  let endDate = new Date( Math.trunc(caseEndTimestamp) ).toLocaleString('en-US')

  return (
    <div className="timebar-wrapper">
      <div className="timebar-case" style={css}>{entries}</div>

      <div className="sector-button">{ startDate }</div>
      <div className="sector-button">{ endDate }</div>

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
  //
  let date = new Date(+log.timestamp)
  return (
    <div key={ log.id } className="entry-view">
      <div className="entry-header">
        <div className="date-box"> { date.toDateString().substring(4, 7) + " " + date.getDate() } </div>
        <div className="sector-button">{ date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric' }) }</div>
        <div className="sector-button">{ log.sector }</div>
      </div> 
      <div className="entry-time">{ Math.trunc( log.timeSpent / 60000 ) } min</div>
      <div className="entry-description">{log.description}</div>
    </div>
  )
   
}
