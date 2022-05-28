import React, { forwardRef, ForwardRefExoticComponent, FunctionComponent, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../services/store'
import { Hint } from './Hint'
import { Log, Task, Sector } from '../Types'
import { EntityState } from '@reduxjs/toolkit'
import store from '../services/store'
import '../css/breathe.css'
import { HiTerminal,  HiCode } from 'react-icons/hi'
import { IoColorPaletteSharp } from 'react-icons/io5'
import { createLog, selectLogs, logsSelectors } from '../services/logs'
import { createTask, fetchTasks, tasksSelectors, selectActiveTasks, selectActiveTaskTitles } from '../services/tasks'

interface CLIProps {
  timestamp: number 
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

  const dispatch = useAppDispatch()

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
        setFormState('none')
      }
      if ( e.key == ' ' || ( e.key >= 'a' && e.key <= 'z' ) || e.key == 'Tab' ) {
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
          <TaskForm timestamp={timestamp} />
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
      case "subtask": {
        setFormState("subtask")
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
  timestamp: number,
  formState: string 
}

const LogForm: FunctionComponent<LogFormProps> = ( { formState, toggleSpanMarker, updateTimespan, timestamp } ) => {

  const dispatch = useAppDispatch()

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
    dispatch( createLog(log) )
  }

  const toggleOn = ( e: React.FocusEvent<HTMLInputElement> ) => {
    toggleSpanMarker(true)
  }

  const toggleOff = ( e: React.FocusEvent<HTMLInputElement> ) => {
    toggleSpanMarker(false)
  }

  const setTimespan = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    let t = parseInt(e.target.value)
    updateTimespan(e)
    setTimeSpent(t)
  }

  // now need to make it update timespan so we can create log

  if ( formState === 'log' ) {
  
    return (
      <form className="log-form" onSubmit={ onSubmit }>
        <SectorInput active={true} sectorValue={sector} setSector={setSector} />
        <div className="time-spent-wrapper">
          <input className="time-spent" onChange={setTimespan} onFocus={toggleOn} onBlur={toggleOff}></input>
        </div>
        { textAreaActive === true ? <textarea className="log-description" /> : null }
      </form>
    )

  } else return null;
}

interface TaskFormProps {
  timestamp: number 
}

const TaskForm: FunctionComponent<TaskFormProps> = ( { timestamp } ) => {
  const dispatch = useAppDispatch()

  const [description, setDesc] = useState('')

  const timeLastWorked = Date.now()

  const descChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    setDesc(e.target.value) 
  }

  const now = new Date( Date.now() )

  const onSubmit = ( e: React.SyntheticEvent ) => {
    e.preventDefault();
    let task: Task = {
      active: true,
      timestamp: timestamp,
      timeLastWorked: timeLastWorked,
      percentageFinished: 0,
      elapsedWorkTime: 50,
      description: description
    }
    dispatch( createTask( task ) )      
  }

  return (
    <form onSubmit={ onSubmit }>
      <input autoFocus className="task-description" onChange={descChange} value={description}></input>
    </form>
  )
}

interface SubTaskFormProps {
  timestamp: number
}


const SubTaskForm: FunctionComponent<SubTaskFormProps> = ( { timestamp } ) => {

  const dispatch = useAppDispatch()

  useEffect( () => {
    dispatch( fetchTasks() )
  }, [dispatch] )

  var taskNamesArray: Array<string> = []
  const taskNames = useSelector( selectActiveTaskTitles )

  taskNames.map( ( task ) => {
    if ( task !== undefined ) {
      taskNamesArray.push(task)
    }
  })

  const [ inputValue, setInputValue ] = useState('')
  const [ description, setDesc ] = useState('')

  const onChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    setInputValue( e.target.value )
  }

  const descChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    setDesc( e.target.value )
  }

  const handleFill = ( word: String | Object | undefined ) => {
    console.log('phooey')    
  }


  const timeLastWorked = Date.now()

  const onSubmit = ( e: React.SyntheticEvent ) => {
    e.preventDefault();
    let task: Task = {
      active: true,
      timestamp: timestamp,
      timeLastWorked: timeLastWorked,
      percentageFinished: 0,
      elapsedWorkTime: 50,
      description: description
    }
    dispatch( createTask( task ) )      
  }


  return (
    <form onSubmit={ onSubmit }>
      <Hint options={taskNamesArray} allowTabFill onFill={handleFill} >
        <input autoFocus className="cli-input" value={inputValue} onChange={onChange}></input>
      </Hint>
      <input autoFocus className="task-description" onChange={descChange} value={description}></input>
    </form>
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
        setSector("programming")
        //setSectorValid(true)
        break;
      case "visual":
        setSector("visual")
        //setSectorValid(true)
        break;
      default:
        setSector("none")
        break;
    }
  }

  const onChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    setInputValue(e.target.value)

    if ( inputValue === 'programming' || inputValue === 'visual' ) {
      const target = e.target
      const form = target.form
        if ( form != null ) {
          const index = Array.prototype.indexOf.call( form, target )
          // this is a truly awful and brittle hack
          // we have to jump forward 2 because there's a hidden input for the autocomplete.
          if ( form.elements[index+2] != null ) {
            let f = form.elements[index+2] as HTMLElement
            f.focus()
            //form.elements[index+1].focus()
          }
          e.preventDefault()
        }
      setSectorValid(true)
    }

    // more checking in her.e
  }

  const onKeyup = ( e: React.KeyboardEvent ) => {
    /*
    const target = e.target as HTMLInputElement
    if ( target.value === 'programming' || target.value === 'visual' ) {
      setSectorValid(true)
      active = false
    } else {
      setSectorValid(false)
      active = false
    }
     */

    /*
    if ( sectorIsValid === true ) {
      if ( e.key === 'Space' || e.key === 'Tab' || e.key === 'ArrowRight' ) {
        const form = target.form
        if ( form != null ) {
          const index = Array.prototype.indexOf.call( form, target )
          if ( form.elements[index+1] != null ) {
            let f = form.elements[index+1] as HTMLElement
            f.focus()
            //form.elements[index+1].focus()
          }
          e.preventDefault()
        }
        //setFormState("timespent")
      
      }
     */
      /*
      if ( e.key === 'Space' || e.key === 'Tab' || e.key === 'ArrowRight' ) {
        setFormState("timespent")
      }
       */
      if ( e.key === 'Backspace' ) {
        setSector(Sector.none)
      }
    //}
  }

  if ( !active ) return null;

  return (
    <span className="sector" >
      <div className={ sectorIsValid ? "hidden" : "sector-input-wrapper" } > 
        <Hint options={sectorHints} allowTabFill onFill={handleFill} >
          <input autoFocus className="cli-input" value={inputValue} onKeyUp={onKeyup} onChange={onChange}></input>
        </Hint>
      </div>
      <SectorIcon active={sectorIsValid} sector={sectorValue} />
    </span>
  )

}

interface SectorIconProps {
  active: boolean
  sector: Sector 
}

const SectorIcon: FunctionComponent<SectorIconProps> = ( { active, sector } ) => {

  if ( active ) {
    switch ( sector ) {
      case "programming":
        return ( <HiTerminal className="input-icon" /> )
        break;
      case "visual":
        return ( <IoColorPaletteSharp /> )
        break;
      case "none":
        return null;
        break;
      default:
        return null;
        break;
    }
  }

  return null;
  
}

