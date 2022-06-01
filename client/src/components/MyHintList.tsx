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


interface HintListInputProps {
  names: Array<string>
}

export const HintListInput: FunctionComponent<HintListInputProps> = ( names ) => {

  let inputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('')
  const [matches, setMatches] = useState<string[]>([])
  const [selectedHint, setSelectedHint] = useState('')
  const [changeEvent, setChangeEvent] = useState<React.ChangeEvent<HTMLInputElement>>()

  useEffect( () => {


  }, [] )

  const getMatches = (text: string) => {
    if (!text || text === '') {
      return;
    }

    if (typeof (options[0]) === 'string') {
      const matches = (options as Array<string>)
      .filter(x => x.toLowerCase() !== text.toLowerCase() && x.toLowerCase().startsWith(text.toLowerCase()))
      .sort();

      return matches;
    } else {
      const matches = (options as Array<IHintOption>)
      .filter(x => x.label.toLowerCase() !== text.toLowerCase() && x.label.toLowerCase().startsWith(text.toLowerCase()))
      .sort((a, b) => sortAsc(a.label, b.label));

      return matches;
    }
  };

  const onChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    setChangeEvent(e)
    e.persist()

    setText(e.target.value)

    setMatches( getMatches( text ) )

  }

  const items = matches.map( (match) => {
    return (
      <div className="hint-list-item">
        {match}
      </div>
    )
  })

  if ( matches.length === 0 ) return (
    <div className="hint-list-input-wrapper">
      <input className="hint-list-input" onChange={onChange}></input>
    </div>
  )

  return (
    <div className="hint-list-input-wrapper">
      <input className="hint-list-input" onChange={onChange}></input>
      <div className="hint-list">
        { items }
      </div>
    </div>
  )
}
