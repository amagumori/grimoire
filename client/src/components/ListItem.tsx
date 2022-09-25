import React, { useState, FunctionComponent } from 'react';
import { Task, Project, Log } from '../Types'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { tasksSelectors } from '../services/tasks'
import { selectAllWithTask } from '../services/logs'
import { EntityId } from '@reduxjs/toolkit'

import { HiTerminal,  HiCode } from 'react-icons/hi'
import { IoColorPaletteSharp } from 'react-icons/io5'
import { FcLowPriority } from 'react-icons/fc'


import store from '../services/store'
import { Sector } from '../Types'

type TaskProps = Task
type ProjectProps = Project 
type LogProps = Log 

interface TaskItemProps {
  id: number,
    activeTask: number,
  setActiveTask: Function
}

export const TaskItem: FunctionComponent<TaskItemProps> = ( {id, activeTask, setActiveTask } ) => { 

  const task = tasksSelectors.selectById( store.getState(), id )
  const associatedLogs = selectAllWithTask( store.getState() )(id)

  //console.info( associatedLogs )

  let ts = task!.timestamp.toString()
  let num = parseInt(ts)
  const d = new Date(num)
  const month = d.getMonth()
  const day = d.getDate()

  if ( !task ) return null

  const handleClick = ( e: React.MouseEvent<HTMLDivElement> ) => {
    if ( activeTask != id ) {
      setActiveTask( id )  
    } else {
      setActiveTask( -1 ) 
    }
  }

  return (
    <div className="taskEntry" onClick={handleClick} key={ id } >
      <div className="date-box">
        { month } / { day } 
      </div>
      <FcLowPriority />
      <div className="task-name"> { task.description } </div>
    </div>
  ) 
  
}

      //<div className="task-date"> { timestamp } </div>
export const LogItem: FunctionComponent<LogProps> = ( {id, description, timestamp, timeSpent, sector, projectId, taskId } ) => {
  
  return (
    <div className="taskEntry" key={ id } >
      <div className="task-date"> { timestamp } </div>
      <div className="task-name"> { description } </div>
    </div>
  ) 
}

export const ProjectItem: FunctionComponent<ProjectProps> = ( {id, description, timestamp, timeLastWorked, logs } ) => {
  
  return (
    <div className="taskEntry" key={ id } >
      <div className="task-date"> { timestamp } </div>
      <div className="task-name"> { description } </div>
    </div>
  ) 
}

const SectorIcon = ( sector: Sector ) => {

  // coercing type to number based on:
  // https://stackoverflow.com/questions/27747437/typescript-enum-switch-not-working
  // maybe don't need to?

  /*
  switch ( +sector ) {
    case Sector.music:
      return ( <FontAwesomeIcon icon={faHeadphones} /> );
    case Sector.programming:
      return ( <FontAwesomeIcon icon={faTerminal} /> );
    case Sector.visual:
      return ( <FontAwesomeIcon icon={faPenFancy} /> );
    default:
      return ( <i className = "fa fa-pen-fancy fi"></i> )
  }
  */

}

