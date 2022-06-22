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

  const wrapperRef: React.RefObject<HTMLDivElement> = useRef(null)

  const [playheadPos, setPlayheadPos ] = useState(0)
  const [clientWidth, setClientWidth] = useState(0)
  const [ clientOffset, setClientOffset ] = useState(0)

  const [ shiftPressed, setShiftPressed ] = useState(false)

  const now = Date.now()
  const day = new Date( now - 86400000 ).getTime()

  const [ start, setStart ] = useState( day ) 
  const [ end, setEnd ] = useState( now )

  const wheelZoomFactor = 1000000

  const handleShift = ( e: KeyboardEvent ) => {
    e.preventDefault()
    if ( e.key == 'Shift') {
      setShiftPressed(true)
    }
  }

  const handleShiftUp = ( e: KeyboardEvent ) => {
    e.preventDefault()
    if ( e.key == 'Shift') {
      setShiftPressed(false)
    }
  }

  const handleWheel = ( e: WheelEvent ) => {
    //setPlayheadPos( playheadPos + 20 )
    //    let offsetFromCenter = (clientWidth / 2 ) - (playheadPos - clientOffset)
    let pos = playheadPos - clientOffset
    let center = clientWidth * 0.5
    let offsetFromCenter = pos - center
    let offsetFactor = offsetFromCenter / center

    console.info( e )

    if ( shiftPressed ) {
      // zoom
      setStart( ( prev ) => prev - ( e.deltaY * wheelZoomFactor ) )
      setEnd ( (prev) => prev + ( e.deltaY * wheelZoomFactor ) )
    } else {
      // scroll side to side
      setStart( (prev) => prev + (e.deltaY * wheelZoomFactor ) )
      setEnd( (prev) => prev - (e.deltaY * wheelZoomFactor ) )
    }
      /*
    setStart( ( prev ) => prev - ( e.deltaY * wheelZoomFactor ) )
    setEnd ( (prev) => prev + ( e.deltaY * wheelZoomFactor ) )
       */
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
    document.addEventListener( 'keydown', handleShift, true)
    document.addEventListener( 'keyup',  handleShiftUp, true)
    return () => {
      document.removeEventListener('wheel', handleWheel)
      document.removeEventListener('keydown', handleShift)
      document.removeEventListener('keyup', handleShiftUp)
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

interface TimeBarProps {
  startTime: number, 
    endTime: number,
    playheadPos: number,
    setPlayheadPos: Function
}

export const TimeBar: FunctionComponent<TimeBarProps> = ( { startTime, endTime, playheadPos, setPlayheadPos } ) => {
  const dispatch = useAppDispatch()
  const timebarRef: React.RefObject<HTMLDivElement> = useRef(null)

    /*
  const selectRange = makeSelectRange( startTime, endTime )

  const theLogs = useSelector( selectRange );
     */

  const theLogs = useSelector( logsSelectors.selectAll )

  const [ loaded, setLoaded ] = useState(false)
  const [ currentLogId, setCurrentLogId ] = useState(0)
  const [ entryViewHidden, toggleEntryView ] = useState(true)
  const [ clientWidth, setClientWidth ] = useState(0)
  const [ clientOffset, setClientOffset ] = useState(0)
  const [ endMarkerPos, setEndMarker ] = useState(0)
  const [ spanMarkerHidden, toggleSpanMarker] = useState(true)
  //const [ playheadPos, setPlayheadPos ] = useState(0)

  const [ logFormActive, setLogFormActive ] = useState(false)

  const now = new Date( Date.now() )


  var startBound = startTime
  var endBound = endTime


  const timespan = endTime - startTime
  var loadSpan = endBound - startBound

  const tickTimespan = timespan / 6;
  var tickTime = new Date(startTime);

  const msToPixRatio = clientWidth / timespan
  const pixToMsRatio = timespan / clientWidth

  // worst one-liner in history?
  const playheadTimestamp = Math.trunc( startTime + ( pixToMsRatio * ( playheadPos - clientOffset ) ) )
  const selectByTimestamp = makeSelectByTimestamp( playheadTimestamp )

  const nowOffset = ( now.getTime() - startTime ) * msToPixRatio

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

  const newTimeRatio = ( time: number ) => { return ( time / loadSpan ) } 

  // we'd have "pushweight" of how much to push the start and end based on the playhead offset
  // so then timespan += 10%
  // then start reduces by 4% and end increases by 6%..?

    /*
  const filteredEntries = theLogs.filter( (log) => {
    return log.timestamp > startBound && log.timestamp < endBound
  })
     */

  const activeLogs = theLogs.filter( (log) => {
    return log.timestamp > startBound && log.timestamp < endBound 
  })

  const entries = activeLogs.map( (log: Log, index: number, logs: Array<Log> ) => {

    /*
    let offset = timeRatio( log.timestamp - startBound )
    offset *= clientWidth
    let perc = `${timeRatio(log.timeSpent) * 100 }%`

    let rand0 = Math.random()
    let rand1 = Math.random()
    let css = {
      width: perc,
      left: offset,
      backgroundColor: `rgba(${rand1 * 255}, ${rand0 * 255}, ${rand1 * 255}, ${rand0 * 255} )`
    }
     */
    let offset = timeRatio( log.timestamp - startBound) * clientWidth
    let perc = `${timeRatio(log.timeSpent) * 100 }%`
    return ( <TimeBarEntry id={log.id ? log.id : -1 } offset={offset} width={perc} clientWidth={clientWidth} /> )
  })

  let ticks = []

  for ( let i=0; i < 6; i++ ) {
    let offset = tickTimespan * i;
    tickTime.setTime( tickTime.getTime() + offset );
    ticks.push( (<div className="tick-mark">{ tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }</div> ) );
  }

  return (
    <div className="timebar-wrapper">
      <div>CURRENT timestamp: {playheadTimestamp}</div>
      <CLI updateTimespan={ updateTimeSpent } toggleSpanMarker={ toggleSpanMarker } timestamp={ playheadTimestamp}></CLI>
      <div className="timebar" ref={timebarRef} >

        {entries}

        <Draggable hidden={false} classString="gg-pin-alt playhead" setPlayheadPos={ setPlayheadPos } parentWidth={ clientWidth } parentX={ clientOffset } nowOffset={ nowOffset } />
        <TimeSpan hidden={spanMarkerHidden} offset={ playheadPos } width={ endMarkerPos } /> 
      <EndMarker hidden={spanMarkerHidden} offset={ playheadPos + endMarkerPos } />
      </div>
      <div className="tick-line">
        {ticks}
      </div>
      <EntryView id={currentLogId} hidden={false} />
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
  offset: number,
  width: string,
  clientWidth: number,
    //css: React.CSSProperties
}

const TimeBarEntry: FunctionComponent<EntryProps> = ( { id, offset, width, clientWidth} ) => {

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

  const log = logsSelectors.selectById( store.getState(), id );
  if ( log == undefined || log.id == undefined ) return null


    /*
  const onClick = ( e: React.MouseEvent<HTMLDivElement> ) => {
  }
     */

  let bgString = `rgb(0, ${log.timeSpent / 10000}, 180)`
  // style
  return (
    <div key={ log.id ? log.id : -1 } className="timebar-entry" style={ { width: width, left: offset, backgroundColor: bgString }} >
    </div>
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
