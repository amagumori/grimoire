import { getRepository } from 'typeorm';
import { Sector, Task, Project, Log } from './entities';

export const createProject = async ( body: any ) => {
  const projectRepo = getRepository(Project);
  let { name, desc, percentageFinished, sector } = body;
  let project = new Project();

  project.name = name;
  project.description = desc;
  project.sector = sector;

  await projectRepo.save(project);
  return project;
};

/* task update has to be calculated off assoc. logs 
  @param id
*/

export const updateProject = async ( id: number, body: any ) => {
  const projectRepo = getRepository(Project);
  let { desc, timeSpent, sector, projectId, taskId } = body;

  let updatedProject = await projectRepo.update(id, body);
  return updatedProject;
};

export const removeProject = async ( id: number ) => {
  const projectRepo = getRepository(Project);
  let projectToDelete = await projectRepo.findOneOrFail(id);
  if (projectToDelete) {
    let deletedProject = await projectRepo.remove(projectToDelete);
    return deletedProject;
  }
}

export const getProjectById = async ( id: number ) => {
  const projectRepo = getRepository(Project);
  let project = projectRepo.findOne(id);
  return project;
}



// STUB: lol only call this with no args for now
export const getTasks = async ( filter?: any ) => {

  if (filter === undefined ) {
    const taskRepo = getRepository(Task);

    let tasks = await taskRepo.find();
    return tasks;
  }
}

export const getTaskById = async ( id: number ) => {
  const taskRepo = getRepository(Task);
  let task = taskRepo.findOne(id);
  return task;
}

export const createTask = async ( body: any ) => {

  console.log('we made it')
  console.log(body)

  const taskRepo = getRepository(Task);
  let { description, elapsedWorkTime, percentageFinished, timeLastWorked, timestamp } = body;
  let task = new Task();
  task.description = description;
  console.log('desc: ' + description)
  task.timestamp = timestamp;
  task.timeLastWorked = timeLastWorked;
  task.percentageFinished = percentageFinished;
  task.elapsedWorkTime = elapsedWorkTime;

  await taskRepo.save(task);
  return task;
}

const dummyCreateTask = async ( body: any ) => {
  const taskRepo = getRepository(Task);
  let { id, timestamp, desc, timeLastWorked, percentageFinished, elapsedWorkTime } = body;
  let task = new Task();
  console.log('desc: ' + desc)
  task.description = desc;
  console.log('task desc: ' + task.description)
  task.timeLastWorked = timeLastWorked;
  task.percentageFinished = percentageFinished;
  task.elapsedWorkTime = elapsedWorkTime;

  await taskRepo.save(task);
  return task;
}

/* task update has to be calculated off assoc. logs */

export const updateTask = async ( id: number, body: any ) => {
  const taskRepo = getRepository(Task);
  let { desc, timeSpent, sector, projectId, taskId } = body;

  let updatedTask = await taskRepo.update(id, body);
  return updatedTask;
}

export const removeTask = async ( id: number ) => {
  const taskRepo = getRepository(Task);
  let taskToDelete = await taskRepo.findOneOrFail(id);
  if (taskToDelete) {
    let deletedTask = await taskRepo.remove(taskToDelete);
    return deletedTask;
  }
  return null;
}

export const getLogs = async ( filter?: any ) => {

  if (filter === undefined ) {
    const logRepo = getRepository(Log);

    let logs = await logRepo.find();
    console.log('logs on server side: ' + JSON.stringify(logs))
    return logs;
  }
}


export const createLog = async ( body: any ) => {
  const logRepo = getRepository(Log);

  console.log("made it to createLog.  body: " + JSON.stringify(body))

  let { description, timestamp, timeSpent, sector, projectId, taskId } = body;
  let log = new Log();

  log.description = description;
  // validate dates for the postgres format
  log.timestamp = timestamp;
  log.timeSpent = timeSpent;

  log.sector = sector;
  // it's really this simple...?
  log.project = projectId;
  log.task = taskId;

  await logRepo.save(log);
  return log;
}

export const updateLog = async ( id: number, body: any ) => {
  const logRepo = getRepository(Log);

  let { startTime, timeSpent, sector, projectId, taskId } = body;

  let updatedLog = await logRepo.update(id, body);

  return updatedLog;
}

export const removeLog = async ( id: number ) => {
  const logRepo = getRepository(Log);
  let logToDelete = await logRepo.findOneOrFail(id);
  if ( logToDelete ) {
    let removedLog = await logRepo.remove(logToDelete);
    return removedLog;
  }

  return null;
}
export const getLogById = async ( id: number ) => {
  const logRepo = getRepository(Log);
  let log = logRepo.findOne(id);
  return log;
}

//export { createTask as createTask };
