import React, { createRef, useMemo, useRef, PureComponent, FunctionComponent, useEffect, useState } from 'react';
import { Log } from '../Types'
import { useDispatch, useSelector } from 'react-redux'
import { EntityState, EntityId } from '@reduxjs/toolkit'

import { fetchLogs, selectLogs, logsSelectors, makeSelectByTimestamp, select24h, selectRange, makeSelectRange } from '../services/logs'
import store, { useAppDispatch } from '../services/store'
import { Draggable, EndMarker } from './Draggable'
import { CLI } from './CLI-new'

import { BiBody, BiCctv, BiShapePolygon, BiCycling, BiDna, BiEqualizer } from 'react-icons/bi'

// we'll wrap our picker around the timebar for now.
/*
export const TimeBarContainer: FunctionComponent = () => {

  const wrapperRef: React.RefObject<HTMLDivElement> = useRef(null)

  const [playheadPos, setPlayheadPos ] = useState(0)
  const [clientWidth, setClientWidth] = useState(0)
  const [ clientOffset, setClientOffset ] = useState(0)

  const [ zPressed, setZPressed] = useState(false)

  const now = Date.now()
  const day = new Date( now - 86400000 ).getTime()

  const [ start, setStart ] = useState( day ) 
  const [ end, setEnd ] = useState( now )

  const wheelZoomFactor = 10000

    /*
  const handleZ = ( e: KeyboardEvent ) => {
    e.preventDefault()
    if ( e.key == 'Z') {
      setZPressed(true)
    }
  }

  const handleZUp = ( e: KeyboardEvent ) => {
    e.preventDefault()
    if ( e.key == 'Z') {
      setZPressed(false)
    }
  }
     */

    /*
  const handleWheel = ( e: WheelEvent ) => {
    e.preventDefault()
    setPlayheadPos( (pos) => pos + (e.deltaY * 0.1) )
    //    let offsetFromCenter = (clientWidth / 2 ) - (playheadPos - clientOffset)
    let pos = playheadPos - clientOffset
    let center = clientWidth * 0.5
    let offsetFromCenter = pos - center
    let offsetFactor = offsetFromCenter / center

    if ( zPressed ) {
      // zoom
      setStart( ( prev ) => prev - ( e.deltaY * wheelZoomFactor ) )
      setEnd ( (prev) => prev + ( e.deltaY * wheelZoomFactor ) )
    } else {
      // scroll side to side
      setStart( (prev) => prev + (e.deltaY * wheelZoomFactor ) )
      setEnd( (prev) => prev + (e.deltaY * wheelZoomFactor ) )
    }
      /*
    setStart( ( prev ) => prev - ( e.deltaY * wheelZoomFactor ) )
    setEnd ( (prev) => prev + ( e.deltaY * wheelZoomFactor ) )
       
  }    

  
  const setDay = (e : React.MouseEvent<HTMLButtonElement> ) => { 
    setStart( day ) 
  }
  const setWeek = (e : React.MouseEvent<HTMLButtonElement> ) => {
    setStart( now - 604800000 )
  }
  const setMonth = (e : React.MouseEvent<HTMLButtonElement> ) => {
    setStart( now - 2629800000 )
  }

    
    useEffect( () => {
    if ( wrapperRef.current != null ) {
      setClientWidth( wrapperRef.current.offsetWidth )
      setClientOffset( wrapperRef.current.offsetLeft )
    }
    document.addEventListener( 'wheel', handleWheel, true )
    //document.addEventListener( 'keydown', handleZ, true)
    //document.addEventListener( 'keyup',  handleZUp, true)
    return () => {
      document.removeEventListener('wheel', handleWheel)
      //document.removeEventListener('keydown', handleZ)
      //document.removeEventListener('keyup', handleZUp)
    }
  }, [] )
     

  return ( 
    <div className='timebar-wrapper' ref={wrapperRef} >
      <div className='timebar-buttons'>
        <button onClick={ setDay }>DAY</button>
        <button onClick={ setWeek }>WEEK</button>
        <button onClick={ setMonth }>MONTH</button>
      </div>
      <TimeBar startTime={ start } endTime={ end } playheadPos={playheadPos} setPlayheadPos={setPlayheadPos} /> 
    </div>
  )
  // start wrapping passed state mutators within useCallback to memoize
}
     */

interface TimeBarProps {
  initialStart: number, 
  initialEnd: number
}

export const TimeBar: FunctionComponent<TimeBarProps> = ( { initialStart, initialEnd } ) => {
  const dispatch = useAppDispatch()
  const timebarRef: React.RefObject<HTMLDivElement> = useRef(null)

  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
 
  //const ids = useSelector( logsSelectors.selectIds)

  const logsInRange = selectRange(store.getState())(startTime, endTime)

  const theLogs = useSelector( selectRange );

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

  const timespan = endTime - startTime
  const msToPixRatio = clientWidth / timespan
  const pixToMsRatio = timespan / clientWidth

  const tickTimespan = timespan / 6;
  var tickTime = new Date(startTime);

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
    setStartTime(initialStart)
    setEndTime(initialEnd)
    setLoaded(true)
    if ( timebarRef.current != null ) {
      setClientWidth( timebarRef.current.offsetWidth )
      setClientOffset( timebarRef.current.offsetLeft )
    }
  }, [dispatch])

    /*
  let ticks = []

  for ( let i=0; i < 6; i++ ) {
    let offset = tickTimespan * i;
    tickTime.setTime( tickTime.getTime() + offset );
    ticks.push( (<div className="tick-mark">{ tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }</div> ) );
  }
     */

  return (
    <div className="timebar-wrapper">
      <CLI updateTimespan={ updateTimeSpent } toggleSpanMarker={ toggleSpanMarker } timestamp={ playheadTimestamp}></CLI>
      <div className="timebar" ref={timebarRef} >
        <Draggable hidden={false} classString="gg-pin-alt playhead" setPlayheadPos={ setPlayheadPos } parentWidth={ clientWidth } parentX={ clientOffset } nowOffset={ playheadPos } />
        <TimeSpan hidden={spanMarkerHidden} offset={ playheadPos } width={ endMarkerPos } /> 
        <EndMarker hidden={spanMarkerHidden} offset={ playheadPos + endMarkerPos } />
        <TimebarWrapper setStart={setStartTime} setEnd={setEndTime} startTime={startTime} endTime={endTime} clientWidth={clientWidth} clientOffset={clientOffset} />
      </div>
  
      <EntryView id={0} hidden={false} />
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


interface WrapperProps {
  startTime: number,
    endTime: number,
    setStart: Function,
    setEnd: Function,
  clientWidth: number,
  clientOffset: number
}

const TimebarWrapper: FunctionComponent<WrapperProps> = ( { startTime, endTime, setStart, setEnd, clientWidth, clientOffset } ) => {

  const reference = useRef<HTMLDivElement>(null)

  const msToPixRatio = clientWidth / (endTime - startTime)
  const pixToMsRatio = (endTime - startTime) / clientWidth 

  const [offset, setOffset] = useState(0)
  const [zoom, setZoom] = useState(0)

  const [caseWidth, setCaseWidth] = useState(0)
  const [caseOffset, setCaseOffset] = useState(0)

  console.info( 'pix: ' + (offset * pixToMsRatio) )
  console.info('my offset: ' + offset)

  const handleWheel = ( e: WheelEvent ) => {
    e.preventDefault()
    setOffset( (prev) => prev + e.deltaY )
    // i wish i figured out a lot earlier that floats will overflow to NaN way before integers because not using int divide.  ugh.
    setStart( (prev: number) => prev + offset )
    setEnd( (prev: number) => prev + offset )
  }    

  const span = endTime - startTime
  const start = startTime - ( span * 3 )
  const end = endTime + ( span * 3 )
  
  let mySpan = end - start

  let spanDiff = mySpan - span

  const myWidth = clientWidth + ( spanDiff * msToPixRatio )
  const myOffset = - ( caseWidth - clientWidth ) / 2 

  let css = {
    width: myWidth,
    left: myOffset,
    transform: `translateX(${offset}px)`
  }

  useEffect( () => {
    document.addEventListener( 'wheel', handleWheel, true )
    return () => {
      document.removeEventListener('wheel', handleWheel)
    }
  }, [] )

  const logsInRange = selectRange(store.getState())(start, end)

  const entries = logsInRange.map( (log) => {
    let offset = (log.timestamp - start) * msToPixRatio
    let width = log.timeSpent * msToPixRatio
    let css = {
      left: offset,
      width: width
    }
    return ( <div className="timebar-entry" style={css} ></div> )
  })
  
  let ticks = []
  
  const tickTimespan = span / 6;
  var tickTime = new Date(startTime);

  for ( let i=0; i < 6; i++ ) {
    let offset = tickTimespan * i;
    tickTime.setTime( tickTime.getTime() + offset );
    ticks.push( (<div className="tick-mark">{ tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }</div> ) );
  }


  return (
    <div className="timebar-wrapper">
      <div className="timebar-case" style={css} ref={reference} >
        { entries } 
      </div>
      <div className="tick-line">
        { ticks }
      </div>
    </div>
  )
    }


  /*
const useAnimationFrame = ( callback: Function ) => {
  const reqRef = useRef()
  const prevTs = useRef()

  const animate = (time: any) => {
    if ( prevTs.current != undefined ) {
      const dt = time - prevTs.current
      callback(dt)
    }
    prevTs.current = time
    reqRef.current = requestAnimationFrame( animate )
  }

  useEffect( () => {
    reqRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(reqRef.current)
  }, [])
}
   */

// use zoomLevel ( timespan ) and offset / playheadPos / timestamp 
// could do optional prop of scrollDelta, attach event handler in parent, pass as prop, only update translate IF scrollDelta != 0
// use mutableRefObject<number> and pass as prop?
// or could attach eventhandler in each and every one.

interface EntryProps {
  id: EntityId,
  start: number,
  end: number,
  clientWidth: number
}


const TimeBarEntry: FunctionComponent<EntryProps> = ( { id, start, end, clientWidth } ) => {

  const msToPixRatio = clientWidth / (end - start)
  const newTimeRatio = ( time: number ) => { return ( time / ( end - start )) } 
  const log = logsSelectors.selectById( store.getState(), id )

  let w = newTimeRatio(log!.timeSpent!) * 100
  // cheapest silliest optimization ever.
  if ( w < 0.15 ) return null
  let off = newTimeRatio(log!.timestamp! - start ) * clientWidth

  let css = {
    width: `${w}%`,
    left: off,
    backgroundColor: `rgba( 0, ${Math.random() * 255}, ${log!.timeSpent! * 255}, 180 )`
  }

  if ( log!.timestamp! > end || log!.timestamp! < start ) return null

  if ( log == undefined || log.id == undefined ) return null

  const onClick = ( e: React.MouseEvent<HTMLDivElement> ) => {
  }

  return (
    <div key={ log.id ? log.id : -1 } className="timebar-entry" style={css} />
  )
}

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
      <div className="sector">{ logIcon }</div>
      <div className="entry-time">{ new Date(+log.timestamp).toLocaleString('en-US') }</div>
      <div className="entry-time">{ log.timeSpent }</div>
      <div className="entry-description">{log.description}</div>
    </div>
  )
   
}
