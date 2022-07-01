import React, { FunctionComponent, useState, useEffect } from 'react';
import { EntityState } from '@reduxjs/toolkit'
import faker from 'faker'
import { Task, Log, Project, Sector } from '../Types'
import { useDispatch, useSelector, connect } from 'react-redux'

import { tasksSelectors, createTask, fetchTasks } from '../services/tasks'
import { logsSelectors, fetchLogs, createLog } from '../services/logs'
import { projectsSelectors } from '../services/projects'
import store, { useAppDispatch } from '../services/store'
import { TaskItem, LogItem, ProjectItem } from './ListItem'

interface ListProps {
  listType: string,
  activeTask: number,
  setActiveTask: Function
}

export const CreateDummyTaskButton: FunctionComponent<{}> = props => {

  const dispatch = useAppDispatch()

  // build faker object then add onclick handler to call createTask with the fake object.
  // mock out api calls / backend stuff this way.

  function makeDummyTask() {
    let desc = faker.lorem.sentence()
    let timestamp = Date.now()
    let timeLastWorked = Date.now()
    let percentageFinished = Math.floor( Math.random() * 100 )
    // we're turning elapsedtime into a minute value 
    let elapsedTime = 35

    let dummyTask: Task = {
      id: 0,
      active: true,
      description: desc,
      timestamp: timestamp,
      timeLastWorked: timeLastWorked,
      percentageFinished: percentageFinished,
      elapsedWorkTime: 60  
    }
    console.log(dummyTask)
    dispatch(createTask(dummyTask));
  }

  function generateDummyLogs() {
    const dayInMs = 86400 * 1000
    const yesterday = Date.now() - dayInMs

    //let currentTimestamp = new Date( "2021-11-20T00:00:00+0000" )
    // do a whole month

    let currentTimestamp = Date.now() - ( dayInMs * 50 )
    for ( var i=0; i < 380; i++ ) {
      //if ( currentTimestamp >= Date.now() ) break;
      let desc = faker.lorem.sentence()
      let timestamp = currentTimestamp
      // timespent in SECONDS.
      let rand0 = Math.random()
      let rand1 = Math.random()
      let timeSpent = Math.floor( rand0 * 120 * 60000)
      let sector = Sector.programming
      let dummyLog: Log = {
        id: 0,
        description: desc,
        timestamp: timestamp,
        timeSpent: timeSpent,
        sector: sector
      }

      console.log( 'timespent in minutes: ' + timeSpent)
      //let incrementMs = timeSpent + Math.floor( ( rand1 * ( 3600 * 1000 ) ) )
      let incrementMs = timeSpent + Math.floor( ( rand1 * ( 240 * 60000 ) ) )
      console.log('current timestamp ms: ' + currentTimestamp )
      currentTimestamp += incrementMs;

      console.log('increment in ms: ' + incrementMs )
      //console.log("dummy log: " + JSON.stringify(dummyLog))
      dispatch(createLog(dummyLog))
    }
  }


  return(
    <button onClick={() => generateDummyLogs()}>generate dummy logs</button>
  )
}

export const List: FunctionComponent<ListProps> = ( { listType, activeTask, setActiveTask } ) => {

  const dispatch = useAppDispatch()

  const theTasks = useSelector(tasksSelectors.selectAll); 
  
  useEffect( () => {
    if ( listType === 'tasks' ) {
      dispatch(fetchTasks())
    } else if ( listType === 'logs' ) {
      dispatch(fetchLogs())
    }
  }, [dispatch])
 
  if ( listType === 'tasks' ) {
    
    //const selectAllTasks = tasksSelectors.selectAll(store.getState())
    //console.log('tasks: ' + selectAllTasks);
    //console.log('tasks from selector: ' + JSON.stringify(theTasks));
    const taskItems = theTasks.map( (task) => <TaskItem key={task.id} id={task.id} activeTask={activeTask} setActiveTask={setActiveTask} /> )

    return (
      <div className="task-container">
        { taskItems }
      </div>
    )

  }

  if ( listType === 'projects' ) {
    const allProjects = projectsSelectors.selectAll(store.getState().projects)
    const projects = allProjects.map( (project) => {
      return <ProjectItem {...project} />
    })
    return (
      <div className="new-list-container">
        <CreateDummyTaskButton />
        { projects } 
      </div>
    )
  }

  if ( listType === 'logs' ) {
    const allLogs = logsSelectors.selectAll(store.getState())
    const logs = allLogs.map( (log) => {
      <LogItem key={log.id} {...log} />
    })
    //<CreateDummyTaskButton />
    return (
      <div className="new-list-container">
        <div className="cli-wrapper" />
        { logs } 
      </div>
    )
  }


  else {
     return <div>ya fucked up.  incorrect list type.</div>
  }
}

export default List
