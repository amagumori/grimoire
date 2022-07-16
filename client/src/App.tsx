import logo from './logo.svg';
import './App.css';

import "reflect-metadata";

import React, { useState, Component } from 'react';
import { Provider } from 'react-redux';

import { TaskGraph } from './components/Graph'

import './css/style.css';
import './css/breathe.css';

//import { rootReducer, RootState } from './services/store'
import store from './services/store'
import { CreateDummyTaskButton, List } from './components/List'
import { CLI } from './components/CLI'
import { TimeBar } from './components/TimeBar'
import { TileView } from './components/Tiles'

type currentPage =
  | {
    type: 'taskList'
  }
  | {
    type: 'projectList'
  }


const App: React.FC = () => {

  const tenDaysAgo = 86400 * 1000 * 10
  const oneDay = 86400 * 1000 
  const defaultTimebarEnd = Date.now()
  const defaultTimebarStart = defaultTimebarEnd - tenDaysAgo

  const [ activeTask, setActiveTask ] = useState(-1)

  //console.table( store.getState().logs ) 
  
  //<List listType="logs" tasks={store.getState().tasks} logs={store.getState().logs}/>
  //
  return (
    <Provider store={store}>
      <div className="app">
      <div className="tasks-banner">Tasks</div>
        <List listType="tasks" activeTask={activeTask} setActiveTask={setActiveTask} />
        <TileView />
        <div className="test-timebar-container">
          <TimeBar initialStart={defaultTimebarStart} initialEnd={defaultTimebarEnd} />
        </div>
      </div>
    </Provider>
  )
}

//<TimeBar startTime={defaultTimebarStart} endTime={defaultTimebarEnd} />
export default App;
