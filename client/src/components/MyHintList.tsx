import React, {
  useRef,
  useState,
  FunctionComponent,
  cloneElement,
  useEffect,
  ReactElement,
  MutableRefObject,
  RefCallback
} from 'react'

import { useSelector } from 'react-redux'
import { tasksSelectors, selectActiveTasks } from '../services/tasks'


export const HintListInput: FunctionComponent = ( ) => {

  // i literally just gave up on the inscrutable type errors.
  // after an hour with no discernable difference between the return type
  // of a createSelector in logs working while in tasks the same thing doesn't
  // return a Task[] ( as it is explicitly typed to ) i truly hate ts.  it's so bad.
  const tasks = useSelector( tasksSelectors.selectAll )

  let inputRef = useRef<HTMLInputElement>(null);
  // going to try a sort of ugly hack to use the computed style thru ref to 
  // vertically position this div with arbitrary size dynamically.
  let listRef  = useRef<HTMLDivElement>(null);

  const [text, setText] = useState('')
  const [matches, setMatches] = useState<string[]>([])
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0)
  const [changeEvent, setChangeEvent] = useState<React.ChangeEvent<HTMLInputElement>>()

  let pairs : Array<Object> = []

  // i literally couldn't figure out how to get around the possibly undefined checks.
  // i explicitly checked every undefined and null case in my map and it still didn't allow it.
  // what is the point of this?  i'm so mad.
  //
  // i lost easily 90 minutes over type assertions.  i'm not building a formally specified Boeing 737 TACAN.
  let names: any = []

  if ( tasks != undefined ) {
    pairs = tasks.map( (task) => {
      return {
        id: task.id,
        name: task.description
      }
    })
     
    names = tasks.map( (task) => {
      if ( task.active! ) { return task.description! }
    })
     
  }

  useEffect( () => {


  }, [] )

  const getMatches = (text: string) => {
    if (!text || text === '') {
      return;
    }

    if ( names != undefined && names[0] != undefined && typeof (names[0]) === 'string') {
      const matches = (names as Array<string>)
      .filter(x => x.toLowerCase() !== text.toLowerCase() && x.toLowerCase().startsWith(text.toLowerCase()))
      .sort();

      return matches;
    } 

  };

  const onKey = ( e: React.KeyboardEvent<HTMLInputElement> ) => {

    if ( e.key === 'ArrowUp' ) {
      if ( matches[ selectedMatchIndex - 1 ] != undefined ) {
        setSelectedMatchIndex( selectedMatchIndex - 1 ) 
      }
    }

    if ( e.key === 'ArrowDown' ) {
      if ( matches[ selectedMatchIndex + 1 ] != undefined ) {
        setSelectedMatchIndex( selectedMatchIndex + 1 ) 
      }
    }
  }

  const onChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    setChangeEvent(e)
    e.persist()

    setText(e.target.value)
    
    const foundMatches = getMatches(text)
    if ( foundMatches != undefined ) {
      setMatches( foundMatches )
    }

  }

  const items = matches.map( (item, index) => {
    if ( index == selectedMatchIndex ) {
      return (
        <div className="hint-list-item-selected">
          {item}
        </div>
      ) 
    }
    return (
      <div className="hint-list-item">
        {item}
      </div>
    )
  })

  if ( matches.length === 0 ) return (
    <div className="hint-list-input-wrapper">
      <input className="hint-list-input" onChange={onChange} onKeyUp={onKey}></input>
    </div>
  )

  return (
    <div className="hint-list-input-wrapper">
      <input className="hint-list-input" onChange={onChange} onKeyUp={onKey}></input>
      <div className="hint-list" ref={listRef} >
        { items }
      </div>
    </div>
  )
}
