import React, { FunctionComponent, useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux'
import { toggleCLI } from '../services/cli'

interface CLIProps {
  hidden: boolean
}

export const CLI: FunctionComponent<CLIProps> = ( props ) => {

  const [hidden, toggleCli] = useState(false);

  const dispatch = useDispatch()

  const inputRef = useRef<HTMLInputElement>(null)

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

  return(
    <div className={ hidden == true ? "cli-wrapper hidden" : "cli-wrapper" }>
      <input className="cli-input" ref={inputRef}></input>
    </div>
  )
}


export default CLI

