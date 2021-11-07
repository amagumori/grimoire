import React, { FunctionComponent, useState, useEffect } from 'react';
import { EntityState } from '@reduxjs/toolkit'
import faker from 'faker'
import { Task, Log, Project, Sector } from '../Types'
import { useDispatch, useSelector, connect } from 'react-redux'

import { tasksSelectors, selectTasks, createTask, fetchTasks } from '../services/tasks'
import { logsSelectors, fetchLogs, createLog } from '../services/logs'
import { projectsSelectors } from '../services/projects'
import store from '../services/store'
import ListItem from './ListItem'

interface ListProps {
  listType: string
  tasks: EntityState<Task>
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

  function makeDummyLog() {
    let desc = faker.lorem.sentence()
    let timestamp: Date = new Date( Date.now() )
    // timespent in SECONDS.
    let timeSpent = 600
    let sector = Sector.programming
    let dummyLog: Log = {
      description: desc,
      timestamp: timestamp,
      timeSpent: timeSpent,
      sector: sector
    }
    console.log("dummy log: " + JSON.stringify(dummyLog))
    dispatch(createLog(dummyLog))
  }


  return(
    <button onClick={() => makeDummyLog()}>dummy log</button>
  )
}

export const List: FunctionComponent<ListProps> = ( props ) => {

  const dispatch = useDispatch()
  const [listType, tasks] = useState(0)
  //dispatch(fetchTasks())

  //const tasksFromSelector = useSelector(selectTasks)
  const theTasks = useSelector(selectTasks)
  useEffect( () => {
    dispatch(fetchTasks())
  }, [dispatch, tasks])

  if ( props.listType === 'tasks' ) {
    
    const selectAllTasks = tasksSelectors.selectAll(store.getState())
    //console.log('tasks: ' + selectAllTasks);
    //console.log('tasks from selector: ' + JSON.stringify(theTasks));
    const taskItems = selectAllTasks.map( (task) => <ListItem key={task.id} {...task} /> )

    //console.log('taskItems: ' + taskItems)

    return (
      <div className="new-list-container">
        <CreateDummyTaskButton />
        { taskItems }
      </div>
    )

  }

  if ( props.listType === 'projects' ) {
    const allProjects = projectsSelectors.selectAll(store.getState().projects)
    const projects = allProjects.map( (project) => {
      return <ListItem {...project} />
    })
    return (
      <div className="new-list-container">
        <CreateDummyTaskButton />
        { projects } 
      </div>
    )
  }

  else {
     return <div>ya fucked up.  incorrect list type.</div>
  }
}



export default List
