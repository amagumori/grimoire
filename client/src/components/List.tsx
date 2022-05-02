import React, { FunctionComponent, useState, useEffect } from 'react';
import { EntityState } from '@reduxjs/toolkit'
import faker from 'faker'
import { Task, Log, Project, Sector } from '../Types'
import { useDispatch, useSelector, connect } from 'react-redux'

import { tasksSelectors, selectTasks, createTask, fetchTasks } from '../services/tasks'
import { logsSelectors, selectLogs, fetchLogs, createLog } from '../services/logs'
import { projectsSelectors } from '../services/projects'
import store from '../services/store'
import { TaskItem, LogItem, ProjectItem } from './ListItem'

interface ListProps {
  listType: string
  //tasks: EntityState<Task>
  //logs: EntityState<Log>
}

export const CreateDummyTaskButton: FunctionComponent<{}> = props => {

  const dispatch = useDispatch()

  // build faker object then add onclick handler to call createTask with the fake object.
  // mock out api calls / backend stuff this way.

  function makeDummyTask() {
    let desc = faker.lorem.sentence()
    let timestamp: Date = new Date( Date.now() )
    let timeLastWorked: Date  = new Date( Date.now() )
    let percentageFinished = Math.floor( Math.random() * 100 )
    let elapsedTime = "1 hour 35 minutes"

    let dummyTask: Task = {
      description: desc,
      timestamp: timestamp,
      timeLastWorked: timeLastWorked,
      percentageFinished: percentageFinished,
      elapsedWorkTime: elapsedTime
    }
    console.log(dummyTask)
    dispatch(createTask(dummyTask));
  }

  function generateDummyLogs() {
    const dayInMs = 86400 * 1000
    const today = new Date()
    const yesterday = new Date( today.getTime() - dayInMs )

    //let currentTimestamp = new Date( "2021-11-20T00:00:00+0000" )
    let currentTimestamp = yesterday

    for ( var i=0; i < 50; i++ ) {
      let desc = faker.lorem.sentence()
      let timestamp = currentTimestamp
      // timespent in SECONDS.
      let rand0 = Math.random()
      let rand1 = Math.random()
      let timeSpent = Math.floor( rand0 * 360 * 60000) // in minutes; 0-6 hours
      let sector = Sector.programming
      let dummyLog: Log = {
        description: desc,
        timestamp: timestamp,
        timeSpent: timeSpent,
        sector: sector
      }

      console.log( 'timespent in minutes: ' + timeSpent)
      let incrementMs = timeSpent + Math.floor( ( rand1 * ( 3600 * 1000 ) ) )
      console.log('current timestamp ms: ' + currentTimestamp.getTime() )
      currentTimestamp.setTime( currentTimestamp.getTime() + incrementMs )

      console.log('increment in ms: ' + incrementMs )
      //console.log("dummy log: " + JSON.stringify(dummyLog))
      dispatch(createLog(dummyLog))

    }
  }


  return(
    <button onClick={() => generateDummyLogs()}>generate dummy logs</button>
  )
}

export const List: FunctionComponent<ListProps> = ( props ) => {

  const dispatch = useDispatch()
  //const [listType, tasks] = useState(0)
  const [listType, logs] = useState(0)
  //dispatch(fetchTasks())

  //const tasksFromSelector = useSelector(selectTasks)
  //const theTasks = useSelector(selectTasks)
  const theLogs = useSelector(selectLogs)
  
  useEffect( () => {
    if ( props.listType === 'tasks' ) {
      dispatch(fetchTasks())
    } else if ( props.listType === 'logs' ) {
      dispatch(fetchLogs())
    }
  }, [dispatch])
 
  if ( props.listType === 'tasks' ) {
    
    const selectAllTasks = tasksSelectors.selectAll(store.getState())
    //console.log('tasks: ' + selectAllTasks);
    //console.log('tasks from selector: ' + JSON.stringify(theTasks));
    const taskItems = selectAllTasks.map( (task) => <TaskItem key={task.id} {...task} /> )

    //console.log('taskItems: ' + taskItems)

        //<CreateDummyTaskButton />
    return (
      <div className="task-container">
        { taskItems }
      </div>
    )

  }

  if ( props.listType === 'projects' ) {
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

  if ( props.listType === 'logs' ) {
    const allLogs = logsSelectors.selectAll(store.getState())
    const logs = allLogs.map( (log) => {
      <LogItem key={log.id} {...log} />
    })
    return (
      <div className="new-list-container">
        <CreateDummyTaskButton />
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
