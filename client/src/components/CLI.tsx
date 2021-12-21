import React, { FunctionComponent, useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux'
import { Hint } from './Hint'
import { Log } from '../Types'
import { EntityState } from '@reduxjs/toolkit'
import '../css/breathe.css'
import { HiTerminal,  HiCode } from 'react-icons/hi'
import { IoColorPaletteSharp } from 'react-icons/io5'
//import { toggleCLI } from '../services/cli'

interface CLIProps {
  logs: EntityState<Log>
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

  const lastLogDate =

  const [logActive, toggleLog] = useState(false)
  const [sector, setSector] = useState("")
  const [hidden, toggleCli] = useState(false);
  const [inputValue, setInputValue] = useState("")
  const [hintDict, setHintDict] = useState(sectorHints)
  const [hintsDisabled, toggleHints]  = useState(false)
  const dispatch = useDispatch()

  let logIcon: any
  let logBtn

  let month = props.lastLogDate.getMonth().toString()
  let day = props.lastLogDate.getDay().toString()

  let str = month + "/" + day 

  let monthDate = ` ${props.lastLogDate.getMonth()} / ${props.lastLogDate.getDay()} `

  let time = props.lastLogDate.toLocaleTimeString('en-US')

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    if ( inputValue == "log" ) {
      toggleLog(true)
      setInputValue("")
    }

  }

  const handleFill = ( word: String | Object | undefined ) => {
    switch ( word ) {
      case "programming":
        setSector("programming")
        setInputValue("")
        break;
      case "visual":
        setSector("visual")
        setInputValue("")
        break;
      default:
        setSector("none")
        break;
    }
  }
  

  const inputRef = useRef<HTMLInputElement>(null)
  let firstInput = <input value={inputValue} ref={inputRef} className={ hidden == true ? "cli-input hidden" : "cli-input" } onChange={onChange}></input>

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

        // delete icon on empty input and delete pressed
      if ( e.key == 'Backspace' ) {
          console.log("input value: " + inputValue)
          console.log("key: " + e.key)
        console.log("we reached here")
          if ( inputValue == "" && e.key == "Backspace" ) {
            setSector("none")
          }
        }




      }
    window.addEventListener('keyup', onKeyup);
  }, []) // empty array should mean only on component mount / unmount

  if ( logActive == true ) {
    logBtn = <div className="log-button">LOG</div>
    currentInput = (
      <Hint options={sectorHints} disableHint={hintsDisabled} allowTabFill onFill={handleFill} >
        <input className="cli-input" ref={inputRef}></input>
      </Hint>
    )
  }

  switch ( sector ) {
    case "programming":
      console.log('reached')
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


  return(
    <div className="cli-wrapper breathe">
      {logBtn}
      {logIcon}
      {currentInput}
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

