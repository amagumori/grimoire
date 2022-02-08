import logo from './logo.svg';
import './App.css';

import "reflect-metadata";

import React, { useState, Component } from 'react';
import { Provider } from 'react-redux';
import { EntityState } from '@reduxjs/toolkit';

import './css/style.css';
import './css/breathe.css';

//import { rootReducer, RootState } from './services/store'
import store from './services/store'
import { List } from './components/List'
import { CLI } from './components/CLI'
import { TimeBar } from './components/NewTimeBar'

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
  const defaultTimebarEnd = new Date( Date.now() )
  const defaultTimebarStart = new Date( Date.now() - oneDay )

  //console.table( store.getState().logs ) 
  
  //<List listType="logs" tasks={store.getState().tasks} logs={store.getState().logs}/>
  //
  return (
    <Provider store={store}>
      <div className="app">
        <List listType="tasks" tasks={store.getState().tasks} logs={store.getState().logs}/>
        <div className="test-timebar-container">
          <TimeBar startTime={defaultTimebarStart} endTime={defaultTimebarEnd} />
        </div>
      </div>
    </Provider>
  )
}

export default App;
