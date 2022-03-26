import React, { FunctionComponent, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Hint } from './Hint'
import { Log } from '../Types'
import { EntityState } from '@reduxjs/toolkit'
import store from '../services/store'
import '../css/breathe.css'
import { HiTerminal,  HiCode } from 'react-icons/hi'
import { IoColorPaletteSharp } from 'react-icons/io5'
import { selectLogs, logsSelectors } from '../services/logs'

interface CLIProps {
  hidden: boolean
  playheadPos: number
  endPlayheadPos: number
  updateTimeSpent: React.ChangeEventHandler<HTMLInputElement>
  toggleEndMarker: React.FocusEventHandler<HTMLInputElement>
  toggleLogFormActive: React.FocusEventHandler
}

const sectorHints = [
  "programming",
  "prg",
  "visual",
  "vis",
  "music",
  "mus",
  "engineering",
  "eng"
]


export const CLI: FunctionComponent<CLIProps> = ( props ) => {
  
  const inputRef = useRef<HTMLInputElement>(null)
  const timeSpentRef = useRef<HTMLInputElement>(null)

  const updateFunc = props.updateTimeSpent
  const toggleActive = props.toggleLogFormActive

  //  const sortedLogs = useSelector(selectLogs).selectAll(store.getState())
  //
  const sortedLogs = logsSelectors.selectAll( store.getState() ) 


  const [logActive, toggleLog] = useState(false)
  const [sector, setSector] = useState("")
  const [sectorDisabled, toggleSector] = useState(false)
  const [timeSpentDisabled, toggleTimeSpent] = useState(true)
  const [timeSpent, setTimeSpent] = useState(0)
  const [hidden, toggleCli] = useState(false);
  const [inputValue, setInputValue] = useState("")
  const [hintDict, setHintDict] = useState(sectorHints)
  const [hintsDisabled, toggleHints]  = useState(false)

  const [focusState, setFocusState] = useState("")

  const dispatch = useDispatch()

  let logIcon: any
  let logBtn

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    if ( inputValue == "log" ) {
      toggleLog(true)
      setInputValue("")
    }

  }

  const onTimeChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    setTimeSpent( parseInt( e.target.value ) )
  }

  const onSubmit = ( e: React.SyntheticEvent ) => {

  }

  const handleFill = ( word: String | Object | undefined ) => {
    switch ( word ) {
      case "programming":
        setSector("programming")
        toggleSector(true)
        toggleTimeSpent(false)
        break;
      case "visual":
        setSector("visual")
        setInputValue("")
        toggleSector(true)
        toggleTimeSpent(false)
        break;
      default:
        setSector("none")
        toggleSector(false)
        break;
    }
  }
  

  

  //let firstInput = <input ref={inputRef} className={ hidden == true ? "cli-input hidden" : "cli-input" } onChange={onChange}></input>

  //let currentInput = firstInput 

  useEffect( () => {

    let onKeyup = ( e: KeyboardEvent ) => {
        //console.log('pressed ' + e.key); 
        // spacebar
        if (e.key == ' ' || ( e.key >= "a" && e.key <= "z" )) {
          toggleCli(state => false)
          if ( null !== inputRef.current ) {
            inputRef.current.focus()
          }
        }
        // for now - esc to hide cli, any alpha or space key to open
        if (e.key == 'Escape') {
          console.log('esc')
          toggleCli(true)
        }
        // semicolon
        if (e.key == ';' ) {
          console.log('semi')
          toggleCli(true)
        }
        
      }
    window.addEventListener('keyup', onKeyup);
  }, []) // empty array should mean only on component mount / unmount

  if ( logActive == true ) {
    logBtn = <div className="log-button">LOG</div>
      currentInput = (
        <div className={ sectorDisabled == true ? "sector-input-wrapper hidden" : "sector-input-wrapper" } >
          <Hint options={sectorHints} disableHint={hintsDisabled} allowTabFill onFill={handleFill} >
            <input className={ sectorDisabled == true ? "hidden cli-input" : "cli-input" } value={inputValue} onChange={onChange} ref={inputRef}></input>
          </Hint>
        </div>
    )
  }

  switch ( sector ) {
    case "programming":
      let css = { "font-size": "14px" }
      logIcon = ( <HiTerminal className="input-icon" /> )
      break;
    case "visual":
      console.log('peached')
      logIcon = ( <IoColorPaletteSharp /> )
      break;
    case "none": 
      logIcon = (<div className="placeholder"></div> )
      break;
    default:
      break;
  }

  if ( hidden ) return null

  return(
    <div className="new-cli-wrapper breathe">
      <form onSubmit={ onSubmit } onBlur={toggleActive} onFocus={toggleActive} >
        {logBtn}
        {logIcon}
        {currentInput}
        <div className={ timeSpentDisabled == true ? "time-spent-wrapper hidden" : "time-spent-wrapper" } >
          time spent:
          <input className="time-spent" ref={timeSpentRef} onChange={ props.updateTimeSpent } onFocus={props.toggleEndMarker} ></input>
        </div>
      </form>
    </div>
  )
}

interface ActionProps {
  hidden: boolean
  setFocusState: function
}

const ActionInput: FunctionComponent<ActionProps> = ( { hidden, setFocusState } ) => {

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    switch( inputValue ) {
      case "log": {
        setActionState("log")
        setInputValue("")
        break
      }
      case "task": {
        setActionState("task")
        setInputValue("")
        break
      }
      case "project": {
        setActionState("project")
        setInputValue("")
        break
      }
      default: {
        break
      }
    }
  }

  if ( hidden ) return null;

  return (
    <input onFocus={setFocusState("action")} onBlur={setFocusState("")} className="cli-input" onChange={onChange}></input>
  )
}

interface SectorProps {
  hidden: boolean
  setFocusState: function
  setSector: function
}

const SectorInput: FunctionComponent<SectorProps> = ( { hidden, setFocusState, setSector } ) => {

  const [sectorIsValid, setSectorValid] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const handleFill = ( word: String | Object | undefined ) => {
    switch ( word ) {
      case "programming":
        setSector("programming")
        setSectorValid(true)
        break;
      case "visual":
        setSector("visual")
        setSectorValid(true)
        break;
      default:
        setSector("none")
        break;
    }
  }

  const onChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    setInputValue(e.target.value)
  }

  const onKeyup = ( e: React.KeyboardEvent ) => {
    if ( sectorValid === true ) {
      if ( e.key === 'Space' || e.key === 'Tab' || e.key === ArrowRight ) {
        setFocusState("timespent")
      }
    }
  }

  if ( hidden ) return null;
  return (
    <div className="sector-input-wrapper">
      <Hint options={sectorHints} allowTabFill onFill={handleFill} >
        <input className="cli-input" value={inputValue} onChange={onChange} ref={inputRef}></input>
      </Hint>
    </div>
  )

}


interface DateProps {
  monthDate: String,
  time: String
}

const DateView: FunctionComponent<DateProps> = ( props ) => {

  return (
    <div className="date-view">
      <div className="month-date">
        {props.monthDate}
      </div>
      <div className="time">
        {props.time}
      </div>
    </div>
  )
}



export default CLI

