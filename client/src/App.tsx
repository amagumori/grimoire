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
import { TimeBar } from './components/TimeBar'

type currentPage =
  | {
    type: 'taskList'
  }
  | {
    type: 'projectList'
  }


const App: React.FC = () => {

  return (
    <Provider store={store}>
      <div className="app">
        <List listType="logs" tasks={store.getState().tasks} logs={store.getState().logs}/>
        <CLI hidden={false}/>
        <TimeBar logs={store.getState().logs}/>
      </div>
    </Provider>
  )
}

export default App;
