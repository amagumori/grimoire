export enum Sector {
  music = "music",
  visual = "visual",
  programming = "programming",
  physical = "physical",
  making = "making",
  none = "none"
}

export interface Log {
  id?:                number,
  description:        string,
  timestamp:          Date,
  timeSpent:          number, // just ms for now
  sector?:            Sector,
  projectId?:         number,
  taskId?:            number
}

export interface Project {
  id:                 number,
  name:               string,
  description:        string,
  timestamp:          number,
  timeLastWorked:     Date,
  logs:               Log[]  // array of log ids
}

export interface Task {
  id?:                number,  // made id and logs optional for now bc postgres is creating id and logs are optional
  active:             boolean,
  description:        string,
  timestamp?:          Date,
  timeLastWorked?:     Date,   
  percentageFinished?: number,
  elapsedWorkTime?:    number,
  subTasks?:           Task[] // task id
  logs?:               Log[]  // array of log ids
}


