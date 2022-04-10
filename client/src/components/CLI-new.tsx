import React, { FunctionComponent, useEffect, useState, useRef } from 'react';
import { Log, Sector } from '../Types'
import { useDispatch } from 'react-redux'
import { HiTerminal,  HiCode } from 'react-icons/hi'
import { IoColorPaletteSharp } from 'react-icons/io5'
import { Hint } from './Hint'

import { createLog } from '../services/logs'


interface CLIProps {
  timestamp: Date
  updateTimeSpent: React.ChangeEventHandler<HTMLInputElement>
  toggleSpanMarker: React.FocusEventHandler<HTMLInputElement>
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

  const dispatch = useDispatch()

  //const actionRef = useRef<MutableRefObject<HTMLInputElement | undefined>>()
  //const actionRef = useRef<HTMLInputElement>(null)

  const [ formState, setFormState ] = useState("")
  const [ active, setActive ] = useState(false)
  //const [ timeSpent, updateTimeSpent ] = useState(0)

  let logIcon: any
  let logButton

  useEffect( () => {
    let onKeyup = ( e: KeyboardEvent ) => {
      if ( e.key === 'Escape' ) {
        setActive(false)
      }
      if ( e.key == ' ' || ( e.key >= 'a' && e.key <= 'z' ) ) {
        setActive(true)
          /*
        if ( null !== actionRef.current ) {
          actionRef.current.focus()
        }
           */
      }
    }
    // yes, we are registering a global event listener here for now.
    // as i see it rn, the default mode of interacting with the app w keyboard
    // will always be through this CLI component.
    window.addEventListener('keyup', onKeyup)
  }, [] )

  const form = (formState: string) => {
    if ( formState === 'log' ) {
      return (
        <div className="new-cli-wrapper breathe">
          <ActionInput active={false} setFormState={setFormState} />
          <LogForm toggleEndMarker={props.toggleSpanMarker} timestamp={props.timestamp} updateTimeSpent={props.updateTimeSpent} />
        </div> 
      )
    }
    if ( formState === 'task' ) {
      //<TaskForm />
      return (
        <div className="new-cli-wrapper breathe">
          <ActionInput setFormState={setFormState} active={false} />
        </div> 
      )
    }
    if ( formState === 'project' ) {
      // <ProjectForm />
      return (
        <div className="new-cli-wrapper breathe">
          <ActionInput setFormState={setFormState} active={false} />
        </div> 
      )
    }
  }

  if ( !form ) return ( <div></div> )

  return (
    <div>
      {form}
    </div>
  )

}

interface LogFormProps {
  toggleEndMarker: React.FocusEventHandler<HTMLInputElement>
  updateTimeSpent: React.ChangeEventHandler<HTMLInputElement>
  timestamp: Date
}

const LogForm: FunctionComponent<LogFormProps> = ( { toggleEndMarker, updateTimeSpent, timestamp } ) => {

  const dispatch = useDispatch()

  const [ timeSpent, setTimeSpent ] = useState(0)
  const [ textAreaActive, setTextAreaActive ] = useState(false)
  const [sector, setSector] = useState<Sector>(Sector.none)
  const [description, setDesc] = useState('')

  const onSubmit = ( e: React.SyntheticEvent ) => {
    let log: Log = {
      description: description,
      sector: sector,
      timestamp: timestamp,
      timeSpent: timeSpent
    }
    dispatch( createLog( log ) )
  }

  return (
    <form onSubmit={ onSubmit }>
      <SectorInput active={ false } sectorValue={sector} setSector={setSector} />
      <div className="time-spent-wrapper">
        <input className="time-spent" onChange={updateTimeSpent} value={timeSpent} onFocus={toggleEndMarker} onBlur={toggleEndMarker}></input>
      </div>
      { textAreaActive === true ? <textarea className="log-description" /> : null }
    </form>
  )

}

  /*
interface TaskFormProps {
}

const TaskForm: FunctionComponent = ( ) => {
  const [description, setDesc] = useState('')

  const descChange = desc => setDesc(desc)

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
   */

  /*
interface ProjectFormProps {
}

const ProjectForm: FunctionComponent = (  ) => {
  const onSubmit = ( e: React.SyntheticEvent ) => {

  }


}
   */

interface ActionProps {
  active: boolean
  setFormState: Function 
}

const ActionInput: FunctionComponent<ActionProps> = ( { active, setFormState } ) => {

  const [actionState, setActionState] = useState("")
  const [inputValue, setInputValue] = useState("")

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

  if ( !active ) return null;

  if ( actionState === 'log' ) {
    return (
      <div className="log-button">LOG</div>
    )
  } 
  if ( actionState === 'task' ) {
    return (
      <div className="log-button">TASK</div>
    )
  } 
  if ( actionState === 'project' ) {
    return (
      <div className="log-button">PROJECT</div>
    )
  }

  return (
    <input className="cli-input" onChange={onChange}></input>
  )
}

interface SectorProps {
  active: boolean
  sectorValue: Sector
  setSector: Function 
}

const SectorInput: FunctionComponent<SectorProps> = ( { active, sectorValue, setSector } ) => {

  const [sectorIsValid, setSectorValid] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const handleFill = ( word: String | Object | undefined ) => {
    switch ( word ) {
      case "programming":
        setSector(Sector.programming)
        setSectorValid(true)
        break;
      case "visual":
        setSector(Sector.visual)
        setSectorValid(true)
        break;
      default:
        setSector(Sector.none)
        break;
    }
  }

  const onChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    setInputValue(e.target.value)
  }

  const onKeyup = ( e: React.KeyboardEvent ) => {
    if ( sectorIsValid === true ) {
      /*
      if ( e.key === 'Space' || e.key === 'Tab' || e.key === 'ArrowRight' ) {
        setFormState("timespent")
      }
       */
      if ( e.key === 'Backspace' ) {
        setSector(Sector.none)
      }
    }
  }

  if ( !active ) return null;

  if ( sectorIsValid ) {
    switch ( sectorValue ) {
      case Sector.programming:
        return ( <HiTerminal className="input-icon" /> )
        break;
      case Sector.visual:
        return ( <IoColorPaletteSharp /> )
        break;
      case Sector.none:
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


