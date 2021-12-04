import { createAsyncThunk, createEntityAdapter, createSlice, configureStore } from '@reduxjs/toolkit'
import axios from 'axios'
import store, { AppThunk } from './store'

import { Task } from '../Types'

interface CLICommand {
  verb: string,
  noun: string[]
}

interface TasksResponse {
  data: Task[]
}

interface CLIState {
  hidden: boolean,
  logForm: boolean,
  commands: CLICommand[],
  error: string | null | undefined
}

export const cliSlice = createSlice({
  name: 'CLI',
  initialState: {},

  // https://redux-toolkit.js.org/api/createEntityAdapter

  reducers: { 
    toggleCLI: ( state: CLIState ) => {
      state.hidden = !state.hidden
    },
    enableLog: ( state: CLIState ) => {
      state.logForm = true
      console.log('reducer state: ' + state.logForm)
    }
  },
  extraReducers: {}
});

/* ACTIONS 
 *
 * log
 * task
 * project
 * ???
 */

/*
const parseCommand = function ( input: string ) {
  let words = input.trim().split(' ')
  let first = words[0].toLowerCase()
  switch ( first ) {
    case 'log':
      break;
    case 'task':
      break;
    case 'project':
      break;
    default:
      break;
  }
}

*/

type RootState = ReturnType<typeof store.getState>

const { actions, reducer } = cliSlice;

// export each action (reducer) by name
export const { toggleCLI, enableLog } = actions;

export default reducer;
