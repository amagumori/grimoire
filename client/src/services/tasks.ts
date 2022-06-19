import { createAsyncThunk, 
         createSelector, 
         createEntityAdapter, 
         createSlice, 
         configureStore } from '@reduxjs/toolkit'

import axios from 'axios'
import store, { AppThunk } from './store'

import { Task } from '../Types'

interface TaskUpdate {
  id:     number,
  changes: Partial<Task>
}

interface TasksResponse {
  data: Task[]
}

interface TasksState {
  tasks: Task[],
  error: string | null | undefined
}

// this only works if the id is stored in Task.id, otherwise specify with selectId

const tasksAdapter = createEntityAdapter<Task>();

// read this, dumbass!  your imperative ass needs to do everything immutably and
// copy evvereyyythiingngng instead of "pointer math"-ing your way

// https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns

// still don't fully understand why i have to put all these in extraReducers anyway.

/*
export const fetchTasks = createAsyncThunk< Task[], void, {state: TasksState}>(
  'tasks/fetchTasksStatus',
  async(_, ThunkAPI) => {
    const res = await axios.get< Task[] >('/api/task')
    //console.log('axios response: ' + JSON.stringify(res))
    return res.data
  }
)
*/

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasksStatus',
  async() => {
    const res = await axios.get<Task[]>('/api/task')
    return res.data
  } 
)

export const createTask = createAsyncThunk(
  'tasks/createTaskStatus',
  async( task: Task ) => {
    const res: any = await axios.post('/api/task', task)
    return res.data.task as Task
  }
)

export const updateTask = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ( updatedTask: TaskUpdate ) => {
    // @TODO sending Partial<T> instead of T 
    // fix on backend controller
    const response = await axios.put(`/api/task/${updatedTask.id}`, updatedTask);
    return updatedTask;
  }
)

export const removeTask = createAsyncThunk(
  'tasks/removeTaskStatus',
  async ( taskId: number ) => {
    const response = await axios.delete(`/api/task/${taskId}`);
    return taskId;
  }
)

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState: tasksAdapter.getInitialState(), 

  // https://redux-toolkit.js.org/api/createEntityAdapter

  reducers: { },
  extraReducers: (builder) => {
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      // https://redux-toolkit.js.org/usage/usage-guide#managing-normalized-data
      //
      // typescript kinda sucks fucknig ass
      // who are these type annotations helping?!  gtfo my way
      // cool now im annotating "any" for both args to get this to compile.  bruh
      const byId = action.payload.reduce( (byId: any, task: any) => {
        byId[task.id] = task
        return byId
      }, {})

      console.log('byId: ' + JSON.stringify(byId))
      //state.entities = byId
      //state.ids = Object.keys(byId)
      //
      //tasksAdapter.addMany( state, byId );
      tasksAdapter.setAll( state, byId );
    });
    builder.addCase(createTask.fulfilled, (state, action) => {
      tasksAdapter.addOne(state, action.payload);
      console.log('hit this after addone')
    }); 
    builder.addCase(updateTask.fulfilled, (state, action) => {
      tasksAdapter.updateOne(state, action.payload);
    }); 
    builder.addCase(removeTask.fulfilled, (state, action) => {
      tasksAdapter.removeOne(state, action.payload);
    }); 
  }

});

type RootState = ReturnType<typeof store.getState>

type Return = (state: RootState) => Array<Task> | undefined

export const tasksSelectors = tasksAdapter.getSelectors<RootState>(
  (state) => state.tasks
)

export const selectActiveTasks = () => createSelector(
  tasksSelectors.selectAll,
  (tasks) => tasks.filter( (task) => task.active)
)

type ReturnTitles = ( state: RootState ) => String[] | undefined

export interface TaskNameIdPair {
  id: number,
  description: string
};

type TaskNames = ( state: RootState ) => TaskNameIdPair[] | undefined 

export const selectActiveTaskTitles = createSelector(
  tasksSelectors.selectAll,
  (tasks) => tasks.map( (task) => { if (task.active && task.description ) return { id: task.id, description: task.description } } )
)

//export const selectTasks = (state: RootState) => state.tasks

export default tasksSlice.reducer
