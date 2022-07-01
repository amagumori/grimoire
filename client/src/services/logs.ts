import { createAsyncThunk, createEntityAdapter, createSlice, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';
import store, { AppThunk } from './store'
import { Log } from '../Types'

interface LogsState {
  logs: Log[],
  error: string | undefined | null
}

interface LogUpdate {
  id: number,
  changes: Partial<Log>
}


// this only works if the id is stored in Log.id, otherwise specify with selectId

//const logsAdapter = createEntityAdapter<Log>();
const logsAdapter = createEntityAdapter<Log>({
  // js at its finest right here.  because this is deserialized JSON
  // they might appear to be Date objects and Date typed but don't have methods
  sortComparer: (a, b) => a.timestamp - b.timestamp 
});

// read this, dumbass!  your imperative ass needs to do everything immutably and
// copy evvereyyythiingngng instead of "pointer math"-ing your way

// https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns

// still don't fully understand why i have to put all these in extraReducers anyway.

/*
export const fetchLogs = createAsyncThunk<Log[], void, {state: LogsState} >(
  'logs/fetchLogsStatus',
  async( _, thunkAPI ) => {
    const response = await axios.get<Log[]>('/api/log');
    console.log('logs response data: ' + JSON.stringify(response.data))
    return response.data;
  }
)
*/

export const fetchLogs = createAsyncThunk(
  'logs/fetchLogsStatus',
  async () => {
    const res = await axios.get<Log[]>('/api/log')
    return res.data
  }
)



/*
export const createLog = createAsyncThunk(
  'logs/createLogStatus',
  async ( log, thunkAPI ) => {
    // doing this explicit any typing to circumvent what seems to be a bug in Axios itself as of 0.23.0
    const response: any = await axios.post('/api/log', log);
    console.log('createLog response: ' + JSON.stringify(response))
    return response.data.log;
  }
)
*/

export const createLog = createAsyncThunk(
  'logs/createLogStatus',
  async( log: Log ) => {
    const response: any = await axios.post('/api/log', log)
    return response.data.log
  }
)

/*
export const createLog = createAsyncThunk<Log, Log, {state: LogsState} >(
  'logs/createLogStatus',
  async ( log, thunkAPI ) => {
    // doing this explicit any typing to circumvent what seems to be a bug in Axios itself as of 0.23.0
    const response: any = await axios.post('/api/log', log);
    console.log('createLog response: ' + JSON.stringify(response))
    return response.data.log;
  }
)
*/


export const updateLogById = createAsyncThunk<LogUpdate, LogUpdate, {state: LogsState} >(
  'logs/updateLogByIdStatus',
  async ( logUpdate, thunkAPI ) => {
    const response = await axios.put('/api/log', logUpdate);
    return logUpdate;
  }
)

export const removeLogById = createAsyncThunk<number, number, {state: LogsState}>(
  'logs/removeLogByIdStatus',
  async ( logId, thunkAPI ) => {
    const response = await axios.delete(`/api/log/${logId}`);
    return logId;
  }
)


const logsSlice = createSlice({
  name: 'logs',
  initialState: logsAdapter.getInitialState(), 

  // https://redux-toolkit.js.org/api/createEntityAdapter

  reducers: {},
  extraReducers: (builder) => {

    builder.addCase(fetchLogs.fulfilled, (state, action) => {

      const byId = action.payload.reduce( (byId: any, log: any) => {
        byId[log.id] = log
        return byId
      }, {});

      logsAdapter.setAll( state, byId );
    });

    builder.addCase(createLog.fulfilled, (state, action) => {
      logsAdapter.addOne(state, action.payload);
    });

    builder.addCase(updateLogById.fulfilled, (state, action) => {
      logsAdapter.updateOne(state, action.payload);
    });
    
    builder.addCase(removeLogById.fulfilled, ( state, action ) => {
      logsAdapter.removeOne(state, action.payload);
    }); 

  }
});
// with this, you actually have to make sure the type you get back from the api response is a Log.
// how that works together with the typeorm entity type...idk yet.

/*
const getLogById = createAsyncThunk(
  'logs/getLogByIdStatus',
  async ( logId: number ) => {
    const response = await axios.get(`/api/logs/${logId}`);
    return logId;
  }
)
*/

type RootState = ReturnType<typeof store.getState>

export const logsSelectors = logsAdapter.getSelectors<RootState>(
  (state) => state.logs
)

var allLogs = logsSelectors.selectAll

export const select24h = createSelector( allLogs, logs => {
  var now = new Date( Date.now() )
  var then = new Date( Date.now() - 86400000 )
  logs.map( (log) => {
    let ts = new Date(log.timestamp)
    if ( ts > then && ts < now ) return log
  })
})


export const selectLast = createSelector( logsSelectors.selectAll, logs => {
  logs.sort( (a, b) => new Date( b.timestamp ).getTime() - new Date( a.timestamp ).getTime())
  return logs[0]
})

export const makeSelectByTimestamp = (ts: number) => {
  const sel = createSelector(
    logsSelectors.selectAll,
    // just using find so we can return a single instead of array
    (logs) => logs.find( (log) => {
      //return log.timestamp < ts && (log.timestamp + log.timeSpent) > ts
      // this will be our "close enough" constant for testing - 150 seconds
      return Math.abs(log.timestamp - ts) < 150000;
    })
  )
  return sel
}

// O'boy
export const makeSelectRange = (start: number, end: number) => {
  const selector = createSelector(
    logsSelectors.selectAll,
    (logs) => logs.filter( (log) => {
      // this is disgusting and fills me with rage.  thanks typeORM!
      return log.timestamp > start && log.timestamp < end 
    })
  );
  return selector;
}

export const selectRange = createSelector(
  logsSelectors.selectAll,
  (logs) => (start: number, end: number) => logs.filter( (log) => log.timestamp > start && log.timestamp < end )
)

export const selectAllWithTask = createSelector(
  logsSelectors.selectAll,
  (logs: Array<Log>) => (taskId: number) => logs.filter( (log) => log.taskId == taskId ),
  (logs) => logs.sort( (a, b) => a.timestamp - b.timestamp )
)

export const selectLogs = (state: RootState) => state.logs

export default logsSlice.reducer
