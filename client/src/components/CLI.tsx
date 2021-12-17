import React, { FunctionComponent, useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux'
//import { toggleCLI } from '../services/cli'

interface CLIProps {
  //hidden: boolean
}

export const CLI: FunctionComponent<CLIProps> = ( props ) => {

  const [logStatus, toggleLog] = useState(false)

  //var inputValue = ""
  let logBtn

  const [hidden, toggleCli] = useState(false);
  const [inputValue, setInputValue] = useState("")
  const dispatch = useDispatch()

  const inputRef = useRef<HTMLInputElement>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    if ( inputValue == "log" ) {
      console.log("now it should clear")
      toggleLog(true)
      toggleCli(true)
      setInputValue("")
    }

    console.log("val: " + inputValue)

  }

  useEffect( () => {
    let onKeyup = ( e: KeyboardEvent ) => {
        //console.log('pressed ' + e.key); 
        // spacebar
        if (e.key == ' ' || ( e.key >= "a" && e.key <= "z" )) {
          console.log('alpha or space hit')
          toggleCli(state => false)
          if ( null !== inputRef.current ) {
            inputRef.current.focus()
          }
          //dispatch( toggleCLI() )
        }
        // for now - esc to hide cli, any alpha or space key to open
        if (e.key == 'Escape') {
          toggleCli(state => !state)
        }
        // semicolon
        if (e.key == ';' ) {
          toggleCli(state => !state)
        }
      }
    window.addEventListener('keyup', onKeyup);
  }, []) // empty array should mean only on component mount / unmount

  if ( logStatus == true ) {
    logBtn = <div className="log-button">LOG</div>
    //logIcn = <i class=
  }
  return(
    <div className="cli-wrapper breathe">
      {logBtn}
      <input value={inputValue} className={ hidden == true ? "cli-input hidden" : "cli-input" } onChange={onChange}></input>
    </div>
  )
}


export default CLI

