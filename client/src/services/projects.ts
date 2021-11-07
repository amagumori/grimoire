import { createAsyncThunk, createEntityAdapter, createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';
import axios from 'axios';

import { Project } from '../Types'

interface ProjectUpdate {
  id: number,
  changes: Partial<Project>
}

interface ProjectsState {
  projects: Project[],
  error:  string | undefined | null
}

// this only works if the id is stored in Project.id, otherwise specify with selectId

const projectsAdapter = createEntityAdapter<Project>();

// read this, dumbass!  your imperative ass needs to do everything immutably and
// copy evvereyyythiingngng instead of "pointer math"-ing your way

// https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns

// still don't fully understand why i have to put all these in extraReducers anyway.

const createProject = createAsyncThunk<Project, Project, {state: ProjectsState}> (
  'projects/createProjectStatus',
  async ( project, thunkAPI ) => {
    const response = await axios.post('/api/project', project);
    return project;
  }
)

const updateProjectById = createAsyncThunk<ProjectUpdate, ProjectUpdate, {state: ProjectsState}> (
  'projects/updateProjectByIdStatus',
  async ( updatedProject, ThunkAPI ) => {
    const response = await axios.put('/api/project', updatedProject);
    return updatedProject;
  }
)

const removeProjectById = createAsyncThunk<number, number, {state: ProjectsState}> (
  'projects/removeProjectByIdStatus',
  async ( projectId, thunkAPI ) => {
    const response = await axios.delete(`/api/project/${projectId}`);
    return projectId;
  }
)


export const projectsSlice = createSlice({
  name: 'projects',
  initialState: projectsAdapter.getInitialState(), 

  // https://redux-toolkit.js.org/api/createEntityAdapter

  reducers: {},
  extraReducers: (builder) => {

    builder.addCase(createProject.fulfilled, (state, action) => {
      projectsAdapter.addOne(state, action.payload);
    });

    builder.addCase(updateProjectById.fulfilled, (state, action) => {
      projectsAdapter.updateOne(state, action.payload);
    });

    builder.addCase(removeProjectById.fulfilled, ( state, action ) => {
      projectsAdapter.removeOne(state, action.payload);
    }); 

  }
});

/*
const getProjectById = createAsyncThunk(
  'projects/getProjectByIdStatus',
  async ( projectId ) => {
    const response = await axios.get(`/api/projects/${projectId}`);
    return response;
  }
)
*/

export const projectsSelectors = projectsAdapter.getSelectors()

export default projectsSlice.reducer
