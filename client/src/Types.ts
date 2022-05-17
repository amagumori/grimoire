export enum Sector {
  music = "music",
  visual = "visual",
  programming = "programming",
  physical = "physical",
  making = "making",
  none = "none"
}

// working with all integer timestamps bc typeorm's date types are completely useless.

export interface Log {
  id?:                number,
  description:        string,
  timestamp:          number, 
  timeSpent:          number, // just ms for now
  sector?:            Sector,
  projectId?:         number,
  taskId?:            number
}

export interface Project {
  id:                 number,
  description:        string,
  timestamp:          number,
  timeLastWorked:     number,
  percentageFinished: number,
  elapsedWorkTime:    number,
  logs:               number[]  // array of log ids
}

export interface Task {
  id?:                 number,  // made id and logs optional for now bc postgres is creating id and logs are optional
  description:         string,
  timestamp?:          number,
  timeLastWorked?:     number,   
  percentageFinished?: number,
  elapsedWorkTime?:    number,
  logs?:              number[]  // array of log ids
}


