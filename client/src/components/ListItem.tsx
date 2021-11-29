import React, { useState, FunctionComponent } from 'react';
import { Task, Project, Log } from '../Types'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'

//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { faHeadphones, faTerminal, faPenFancy } from '@fortawesome/free-solid-svg-icons'

import store from '../services/store'
import { Sector } from '../Types'

type TaskProps = Task
type ProjectProps = Project 
type LogProps = Log 

export const TaskItem: FunctionComponent<TaskProps> = ( {id, description, timestamp, timeLastWorked, percentageFinished, elapsedWorkTime, logs } ) => {
  
  return (
    <div className="taskEntry" key={ id } >
      <div className="task-date"> { timestamp } </div>
      <div className="task-name"> { description } </div>
    </div>
  ) 
}

export const LogItem: FunctionComponent<LogProps> = ( {id, description, timestamp, timeSpent, sector, projectId, taskId } ) => {
  
  return (
    <div className="taskEntry" key={ id } >
      <div className="task-date"> { timestamp } </div>
      <div className="task-name"> { description } </div>
    </div>
  ) 
}

export const ProjectItem: FunctionComponent<ProjectProps> = ( {id, description, timestamp, timeLastWorked, percentageFinished, elapsedWorkTime, logs } ) => {
  
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

