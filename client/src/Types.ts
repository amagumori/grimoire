export enum Sector {
  music,
  visual,
  programming,
  physical,
  making,
  none
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
  description:        string,
  timestamp:          number,
  timeLastWorked:     Date,
  percentageFinished: number,
  elapsedWorkTime:    string,
  logs:               number[]  // array of log ids
}

export interface Task {
  id?:                number,  // made id and logs optional for now bc postgres is creating id and logs are optional
  description:        string,
  timestamp?:          Date,
  timeLastWorked?:     Date,   
  percentageFinished?: number,
  elapsedWorkTime?:    string,
  logs?:              number[]  // array of log ids
}


