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
  logs: EntityState<Log>
  updateOffset: Function
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

  //  const sortedLogs = useSelector(selectLogs).selectAll(store.getState())
  //
  const sortedLogs = logsSelectors.selectAll( store.getState() ) 

  //console.log(sortedLogs)

  sortedLogs.sort( (a, b) => {
    console.log('a: ' + a.timestamp)
    console.log('b: ' + b.timestamp)
    if ( a.timestamp > b.timestamp ) return 1
    if ( a.timestamp < b.timestamp ) return -1
    return 0
  })

  const [logActive, toggleLog] = useState(false)
  const [sector, setSector] = useState("")
  const [sectorDisabled, toggleSector] = useState(false)
  const [timeSpentDisabled, toggleTimeSpent] = useState(true)
  const [timeSpent, setTimeSpent] = useState(0)
  const [hidden, toggleCli] = useState(false);
  const [inputValue, setInputValue] = useState("")
  const [hintDict, setHintDict] = useState(sectorHints)
  const [hintsDisabled, toggleHints]  = useState(false)
  const dispatch = useDispatch()

  let logIcon: any
  let logBtn

    /*
  let lastLogDate = sortedLogs[0].timestamp

  let month = lastLogDate.getMonth().toString()
  let day = lastLogDate.getDay().toString()

  let str = month + "/" + day 

  let monthDate = ` ${lastLogDate.getMonth()} / ${lastLogDate.getDay()} `

  let time = lastLogDate.toLocaleTimeString('en-US')
     */
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

  const onTimeSubmit = ( e: React.KeyboardEvent ) => {

    if (e.key == ' ' || e.key == 'Enter' || e.key == "Space" ) {
      let value = timeSpent * 60000
      props.updateOffset(value)

    }

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
  

  

  let firstInput = <input ref={inputRef} className={ hidden == true ? "cli-input hidden" : "cli-input" } onChange={onChange}></input>

  let currentInput = firstInput 


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
        
        /*
        if ( e.key == 'Backspace' ) {
          console.log("input value: " + inputValue)
          console.log("key: " + e.key)
          console.log("we reached here")
          if ( inputValue == "" && e.key == "Backspace" ) {
            toggleSectorSet(false);
          }
        }
         */
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
    //console.log('reached')
      let css = { "font-size": "14px" }
      logIcon = ( <HiTerminal className="input-icon" /> )
      if ( null !== timeSpentRef.current ) {
        timeSpentRef.current.focus()
      }
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


  return(
    <div className="new-cli-wrapper breathe">
      {logBtn}
      {logIcon}
      {currentInput}
      <div className={ timeSpentDisabled == true ? "time-spent-wrapper hidden" : "time-spent-wrapper" } >
        time spent:
        <input className="time-spent" ref={timeSpentRef} onChange={ onTimeChange } onKeyUp={ onTimeSubmit }></input>
      </div>
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

