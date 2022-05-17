import { Request, Response } from 'express';

import {
  getTasks,
  getTaskById,
  removeTask,
  updateTask,
  createTask,

  getLogs,
  getLogById,
  removeLog,
  updateLog,
  createLog,

  getProjectById,
  removeProject,
  updateProject,
  createProject
} from './controller';

import { verifyTask, verifyLog } from './middleware';

export default [

  // TASK
  {
    path: "/api/task/:id",
    method: "get",
    handler: [
        async ( req: Request, res: Response ) => {
        let id = req.id;
        let task = await getTaskById(+id);
        res.status(200).send( { task } );
      }
    ]
  },
  {
    path: "/api/task",
    method: "get",
    handler: [
      async ( req: Request, res: Response ) => {
        let tasks = await getTasks()
        console.log('received a request for tasks.  tasks are:\n' + tasks)
        res.status(200).send( tasks ) 
      }
    ]
  },
  {
    path: "/api/task/:id",
    method: "delete",
    handler: [
      async ( req: Request, res: Response ) => {
        let id = req.id;
        let task = await removeTask(+id);
        res.status(200).send( { task } );
      }
    ]
  },
  {
    path: "/api/task/:id",
    method: "put",
    handler: [
      // TODO: implement verifyTask middleware
      verifyTask,
      async ( req: Request, res: Response ) => {
        let updateId = req.params.id;
        let newTask = req.params.updatedTask;
        let task = await updateTask(+updateId, newTask!);
        res.status(200).send( { task } );
      }
    ]
  },
  {
    path: "/api/task/",
    method: "post",
    handler: [
      //verifyTask,
      async ( req: Request, res: Response ) => {
        let newTask = req.body
        console.log("is this a task?" + req.body)
        let task = await createTask(newTask!);
        res.status(200).send( { task } );
      }
    ]
  },
  
  
  
  // LOG 
  {
    path: "/api/log",
    method: "get",
    handler: [
      async ( req: Request, res: Response ) => {
        let logs = await getLogs()
        res.status(200).send( logs ) 
      }
    ]
  },
  {
    path: "/api/log/:id",
    method: "get",
    handler: [
      async ( req: Request, res: Response ) => {
        let id = req.id;
        let task = await getLogById(+id);
        res.status(200).send( { task } );
      }
    ]
  },
  {
    path: "/api/log/:id",
    method: "delete",
    handler: [
      async ( req: Request, res: Response ) => {
        let id = req.id;
        let log = await removeLog(+id);
        res.status(200).send( { log } );
      }
    ]
  },
  {
    path: "/api/log/:id",
    method: "put",
    handler: [
      verifyLog,
      async ( req: Request, res: Response ) => {
        let id = req.id;
        let newLog = req.log;
        let log = await updateLog(+id, newLog!);
        res.status(200).send( { log } );
      }
    ]
  },
  {
    path: "/api/log/",
    method: "post",
    handler: [
      //verifyLog,
      async ( req: Request, res: Response ) => {
        let newLog = req.body;
        let log = await createLog(newLog!);
        res.status(200).send( { log } );
      }
    ]
  },



  // project
  {
    path: "/api/project/:id",
    method: "get",
    handler: [
      async ( req: Request, res: Response ) => {
        let id = req.id;
        let task = await getProjectById(+id);
        res.status(200).send( { task } );
      }
    ]
  },
  {
    path: "/api/project/:id",
    method: "delete",
    handler: [
      async ( req: Request, res: Response ) => {
        let id = req.id;
        let project = await removeProject(+id);
        res.status(200).send( { project } );
      }
    ]
  },
  {
    path: "/api/project/:id",
    method: "put",
    handler: [
      verifyLog,
      async ( req: Request, res: Response ) => {
        let id = req.id;
        let newProject = req.project;
        let project = await updateProject(+id, newProject!);
        res.status(200).send( { project } );
      }
    ]
  },
  {
    path: "/api/project/",
    method: "post",
    handler: [
      verifyLog,
      async ( req: Request, res: Response ) => {
        let newProject = req.project;
        let project = await createProject(newProject!);
        res.status(200).send( { project } );
      }
    ]
  }
]
