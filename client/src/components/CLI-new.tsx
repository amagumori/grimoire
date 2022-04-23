import React, { forwardRef, ForwardRefExoticComponent, FunctionComponent, useEffect, useState, useRef } from 'react';
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
  timestamp: Date
  updateTimespan: React.ChangeEventHandler<HTMLInputElement>
    //toggleSpanMarker: React.FocusEventHandler<HTMLInputElement>
  toggleSpanMarker: Function
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
  
export const CLI: FunctionComponent<CLIProps> = ( { timestamp, updateTimespan, toggleSpanMarker }) => {

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
          <LogForm  toggleSpanMarker={toggleSpanMarker} 
                    formState={formState}
                    updateTimespan={updateTimespan} 
                    timestamp={timestamp} />
        )
    }
    if ( formState === 'task' ) {
      //<TaskForm />
      return (
        <div className="new-cli-wrapper breathe">
          <ActionInputTwo active={active} formState={formState} setFormState={setFormState} />
          <TaskForm />
        </div> 
      )
    }
      /*
    if ( formState === 'project' ) {
      // <ProjectForm />
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
      <ActionInputTwo active={active} formState={formState} setFormState={setFormState} />
      {logIcon}
      {activeForm}
    </div>
  )

}

interface ActionProps {
  active: boolean
  formState: string 
  setFormState: Function
}

//const ActionInputTwo: FunctionComponent<ActionInputProps> = ( props: ActionInputProps & { ref: React.Ref<HTMLInputElement> } ) => {
//

const ActionInputTwo: React.FC<ActionProps> = ( { active, formState, setFormState } ) => { 

  const actionInputRef = React.createRef<HTMLInputElement>()
  const [inputValue, setInputValue] = useState("")

  if ( active ) {
    // focus

  }

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
        // set form state
        break
      }
    }
  }

  interface ActionFieldProps {
    test: string
  }

  const ActionField = React.forwardRef<HTMLInputElement, ActionFieldProps>( ( { test } : ActionFieldProps, fwdRef: React.ForwardedRef<HTMLInputElement> ): JSX.Element => {
    return (
      <input className="cli-input" autoFocus ref={fwdRef} value={inputValue} onChange={onChange}></input>
    )
  }
  )

  if ( !active ) return null;

  
  if ( formState === 'log' ) {
    return (
      <div className="log-button">LOG</div>
    )
  } 
  if ( formState === 'task' ) {
    return (
      <div className="log-button">TASK</div>
    )
  } 
  if ( formState === 'project' ) {
    return (
      <div className="log-button">PROJECT</div>
    )
  }
   

  return ( <ActionField test={ "test" } ref={actionInputRef} /> )
}


interface LogFormProps {
  updateTimespan: React.ChangeEventHandler<HTMLInputElement>
  toggleSpanMarker: Function
  timestamp: Date,
  formState: string 
}

const LogForm: FunctionComponent<LogFormProps> = ( { formState, toggleSpanMarker, updateTimespan, timestamp } ) => {

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

  const toggleOn = ( e: React.FocusEvent<HTMLInputElement> ) => {
    toggleSpanMarker(true)
  }

  const toggleOff = ( e: React.FocusEvent<HTMLInputElement> ) => {
    toggleSpanMarker(false)
  }

  if ( formState === 'log' ) {
  
    return (
      <form className="log-form" onSubmit={ onSubmit }>
        <SectorInput active={true} sectorValue={sector} setSector={setSector} />
        <TimespanInput formState={formState} updateTimespan={updateTimespan} />
        { textAreaActive === true ? <textarea className="log-description" /> : null }
      </form>
    )

  } else return null;
}

//          <input autoFocus className="time-spent" onChange={updateTimespan} value={timeSpent} onFocus={toggleOn} onBlur={toggleOff}></input>


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

interface TimespanInputProps {
  formState: string
  updateTimespan: React.ChangeEventHandler<HTMLInputElement>
}

const TimespanInput: React.FC<TimespanInputProps> = ( { formState, updateTimespan } ) => { 

  const timespanInputRef = React.createRef<HTMLInputElement>()

  // lol

  if ( formState != 'timespan' ) return null

  if ( formState == 'timespan' ) {
    timespanInputRef.current && timespanInputRef.current.focus() 
  }

  const InputField = React.forwardRef<HTMLInputElement>(( fwdRef: React.ForwardedRef<HTMLInputElement>) : JSX.Element => {
    return ( <input className="time-spent" onChange={updateTimespan} ></input> )
  })

  return ( 
    <div className="time-spent-wrapper">
      <InputField />
    </div>
  )
}


  /* 
interface ProjectFormProps {
}

const ProjectForm: FunctionComponent = ( {} ) => {
=======
  /*
interface ProjectFormProps {
}

const ProjectForm: FunctionComponent = (  ) => {
  const onSubmit = ( e: React.SyntheticEvent ) => {

  }


}
   */


/*
interface ActionProps {
  active: boolean
  formState: string 
  setFormState: Function
  innerRef: React.RefObject<HTMLInputElement>
  setFormState: Function 
}
 */

  /*
class ActionInput extends React.Component {

  constructor( props: ActionProps ) {
    super(props);
    this.state = {
      actionState: "",
      inputValue: ""
    }
  }

  onChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ inputValue: e.target.value });

    switch( inputValue ) {
      case "log": {
        this.props.setFormState("log")
        this.setState({ inputValue: "" });
        break
      }
      case "task": {
        this.props.setFormState("task")
        this.setState({ inputValue: "" });
        break
      }
      case "project": {
        this.props.setFormState("project")
        this.setState({ inputValue: "" });
        break
      }
      default: {
        // set form state
        break
      }
    }
  }

  render() {
    if ( !this.props.active ) return null;

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
      <input className="cli-input" ref={this.props.innerRef} value={this.state.inputValue} onChange={this.onChange}></input>
    )
  }
}
   */

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
    if ( sectorIsValid === true ) {
      if ( e.key === 'Space' || e.key === 'Tab' || e.key === 'ArrowRight' ) {
        //setFormState("timespent")
      }
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
        <input autoFocus className="cli-input" value={inputValue} onChange={onChange}></input>
      </Hint>
    </div>
  )

}


