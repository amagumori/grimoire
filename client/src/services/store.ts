import { combineReducers, getDefaultMiddleware, configureStore, ThunkDispatch, Action } from '@reduxjs/toolkit'
import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { useDispatch } from 'react-redux'
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
  reducer: rootReducer,
  devTools: true
})

export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useTestDispatch = () => useDispatch<any>()

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>

export type ThunkAppDispatch = ThunkDispatch<RootState, void, Action>
export const useAppThunkDispatch = () => useDispatch<ThunkAppDispatch>()

export type TypedDispatch = ThunkDispatch<RootState, any, AnyAction>;
export type TypedThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
export const useTypedDispatch = () => useDispatch<TypedDispatch>();

export default store
