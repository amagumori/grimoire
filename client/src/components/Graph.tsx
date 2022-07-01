import React, { useEffect, FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { logsSelectors, selectLogs, fetchLogs, createLog, selectAllWithTask } from '../services/logs'
import store, { useAppDispatch } from '../services/store'

interface TaskGraphProps {
  id: number,
  activeTask: number,
  selectTask: Function
}

export const TaskGraph: FunctionComponent<TaskGraphProps> = ( { id, activeTask, selectTask } ) => {
  // https://www.carlrippon.com/repeat-element-n-times-in-jsx/

  const dispatch = useAppDispatch()

  const task = useSelector( selectAllWithTask( store.getState())(id) ) 
  if ( !task ) return null

  const divs = logs.map( (log) => ( <div className="graph-line"></div> ) )

  return (
    <div className="graph-container">
      { divs } 
    </div>
  )
}

