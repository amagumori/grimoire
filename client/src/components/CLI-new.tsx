import React, { FunctionComponent, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useAppDispatch } from '../services/store'
import { Hint } from './Hint'
import { Log, Task, Sector } from '../Types'
import { EntityState } from '@reduxjs/toolkit'
import store from '../services/store'
import '../css/breathe.css'
import { HiTerminal,  HiCode } from 'react-icons/hi'
import { IoColorPaletteSharp } from 'react-icons/io5'
import { createLog, selectLogs, logsSelectors } from '../services/logs'
import { createTask } from '../services/tasks'


interface CLIProps {
  updateTimespan: React.ChangeEventHandler<HTMLInputElement>
  toggleSpanMarker: Function
  timestamp: Date
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

export const CLI: FunctionComponent<CLIProps> = ( { updateTimespan, toggleSpanMarker, timestamp } ) => {

  const dispatch = useDispatch()

  const actionRef = useRef<HTMLInputElement | HTMLDivElement>(null)

  const [ formState, setFormState ] = useState("")
  const [ active, setActive ] = useState(false)

  let logIcon: any
  let logButton

  useEffect( () => {
    let onKeyup = ( e: KeyboardEvent ) => {
      if ( e.key === 'Escape' ) {
        setActive(false)
      }
      if ( e.key == ' ' || ( e.key >= 'a' && e.key <= 'z' ) ) {
        setActive(true)
        if ( actionRef.current !== null ) {
          actionRef.current.focus()
        }
      }
    }
    // yes, we are registering a global event listener here for now.
    // as i see it rn, the default mode of interacting with the app w keyboard
    // will always be through this CLI component.
    window.addEventListener('keyup', onKeyup)
  }, [] )

  const form = ( formState: string ) => {
    if ( formState === 'log' ) {
      return (
        <div className="new-cli-wrapper breathe">
          <ActionInput ref={actionRef} active={false} formState={formState} setFormState={setFormState} />
          <LogForm  toggleSpanMarker={toggleSpanMarker} 
                    formState={formState}
                    updateTimespan={updateTimespan} 
                    timestamp={timestamp} />
        </div> 
      )
    }
    if ( formState === 'task' ) {
      return (
        <div className="new-cli-wrapper breathe">
          <ActionInput ref={actionRef} active={false} formState={formState} setFormState={setFormState} />
          <TaskForm />
        </div> 
      )
    }
      /*
    if ( formState === 'project' ) {
      return (
        <div className="new-cli-wrapper breathe">
          <ActionInput active={false} formState={formState} setFormState={setFormState} />
          <ProjectForm />
        </div> 
      )
    }
       */
  }

  // 100% NOT how to do this
  const activeForm = form(formState)

  return (
    <div className="new-cli-wrapper breathe">
      <ActionInput ref={actionRef} active={false} setFormState={setFormState} formState={formState} />
      {logIcon}
      {activeForm}
    </div>
  )

}

interface LogFormProps {
  updateTimespan: React.ChangeEventHandler<HTMLInputElement>
  toggleSpanMarker: Function
  timestamp: Date,
  formState: string 
}

const LogForm: FunctionComponent<LogFormProps> = ( { toggleSpanMarker, updateTimespan, formState, timestamp } ) => {

  const dispatch = useDispatch()

  const [ textAreaActive, setTextAreaActive ] = useState(false)
  const [sector, setSector] = useState('')
  const [description, setDesc] = useState('')
  const [timeSpent, setTimeSpent] = useState(0)

  const onSubmit = ( e: React.SyntheticEvent ) => {
    let log: Log = {
      description: description,
      sector: sector as Sector,
      timestamp: timestamp,
      timeSpent: timeSpent
    }
    dispatch( createLog( log ) )
  }

  const toggleOn = ( e: React.FocusEvent<HTMLInputElement> ) => {
    toggleSpanMarker(true)
  }

  const toggleOff = ( e: React.FocusEvent<HTMLInputElement> ) => {
    toggleSpanMarker(false)
  }


  return (
    <form onSubmit={ onSubmit }>
      <SectorInput sectorValue={sector} setSector={setSector} />
      <div className={ formState == 'timespent' ? 'time-spent-wrapper' : 'hidden' } >
        <input className="time-spent" onChange={updateTimespan} value={timeSpent} onFocus={toggleOn} onBlur={toggleOff}></input>
      </div>
      { textAreaActive === true ? <textarea className="log-description" /> : null }
    </form>
  )

}

interface TaskFormProps {
}

const TaskForm: FunctionComponent = ( {} ) => {
  const dispatch = useDispatch()

  const [description, setDesc] = useState('')

  const descChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    setDesc(e.target.value) 
  }

  const onSubmit = ( e: React.SyntheticEvent ) => {
    let task: Task = {
      description: description
    }
    dispatch( createTask( task ) )      
  }

  return (
    <form onSubmit={ onSubmit }>
      <input className="task-description" onChange={descChange} value={description}></input>
    </form>
  )
}

  /* 
interface ProjectFormProps {
}

const ProjectForm: FunctionComponent = ( {} ) => {
  const onSubmit = ( e: React.SyntheticEvent ) => {

  }


}
   */

interface ActionProps {
  active: boolean
  formState: string 
  setFormState: Function
  ref: React.RefObject<HTMLInputElement | HTMLDivElement>
}

const ActionInput: FunctionComponent<ActionProps> = ( { active, setFormState, formState, ref } ) => {

  const [actionState, setActionState] = useState("")
  const [inputValue, setInputValue] = useState("")

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    switch( inputValue ) {
      case "log": {
        setFormState("log")
        setInputValue("")
        break
      }
      case "task": {
        setFormState("task")
        setInputValue("")
        break
      }
      case "project": {
        setFormState("project")
        setInputValue("")
        break
      }
      default: {
        break
      }
    }
  }

  if ( !active ) return null;

  if ( actionState === 'log' ) {
    return (
      <div ref={ref} className="log-button">LOG</div>
    )
  } 
  if ( actionState === 'task' ) {
    return (
      <div ref={ref} className="log-button">TASK</div>
    )
  } 
  if ( actionState === 'project' ) {
    return (
      <div ref={ref} className="log-button">PROJECT</div>
    )
  }

  return (
    <input className="cli-input" ref={ref} value={formState} onChange={onChange}></input>
  )
}

interface SectorProps {
  //active: boolean
  sectorValue: string 
  setSector: Function 
}

const SectorInput: FunctionComponent<SectorProps> = ( { sectorValue, setSector } ) => {

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
        setFormState("timespent")
      }
      if ( e.key === 'Backspace' ) {
        setSector(Sector.none)
      }
    }
  }

  if ( !active ) return null;

  if ( sectorValid ) {
    switch ( sectorValue ) {
      case "programming":
        return ( <HiTerminal className="input-icon" /> )
        break;
      case "visual":
        return ( <IoColorPaletteSharp /> )
        break;
      case "none":
        break;
      default:
        break;
    }
  }

  return (
    <div className="sector-input-wrapper">
      <Hint options={sectorHints} allowTabFill onFill={handleFill} >
        <input className="cli-input" value={inputValue} onChange={onChange}></input>
      </Hint>
    </div>
  )

}


