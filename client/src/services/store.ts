import { combineReducers, configureStore, Action } from '@reduxjs/toolkit'
import { ThunkAction } from 'redux-thunk'
import tasksReducer from './tasks'
import logsReducer  from './logs'
import projectsReducer from './projects'
import cliReducer from './cli'

export const rootReducer = combineReducers({
  cli: cliReducer,
  tasks: tasksReducer,
  logs:  logsReducer,
  projects: projectsReducer
})

export type RootState = ReturnType<typeof rootReducer>

const store = configureStore({
  reducer: rootReducer
})

export type AppDispatch = typeof store.dispatch

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>

export default store
