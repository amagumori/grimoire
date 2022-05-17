import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,  
  OneToMany, 
  ManyToOne 
} from 'typeorm';

// export this?
export enum Sector {
  music = 'music',
  visual = 'visual',
  programming = 'programming',
  physical = 'physical',
  making = 'making'
}

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()

  @UpdateDateColumn()

  @DeleteDateColumn()

  @Column("text")
  name!: string;

  @Column("text")
  description!: string;

  @Column( { type: 'enum', enum: Sector })
  sector!: Sector;

  @OneToMany( type => Task, task => task.project )
  tasks?: Task[];

  @OneToMany( type => Log, log => log.project )
  logs?: Log[];

}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  active!: boolean;

  @CreateDateColumn()

  @UpdateDateColumn()

  @DeleteDateColumn()

  @Column("text")
  description!: string;

  // i'm going back to int bc trying to store Date objects
  // literally just creates problems, what's stored is a "fake" Date object
  @Column("timestamptz") 
  timestamp!: Date;

  @Column("timestamptz") 
  timeLastWorked!: Date;

  @Column("integer")
  percentageFinished!: number;

  @Column("integer")
  elapsedWorkTime!: number;

  @ManyToOne( () => Project, project => project.tasks )
  project?: Project;

  @OneToMany( () => Task, task => task.subTasks )
  subTasks?: Task[];

  @OneToMany( type => Log, log => log.task )
  logs?: Log[];
}

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  description!: string;

  @CreateDateColumn()

  @UpdateDateColumn()

  @DeleteDateColumn()

  @Column("timestamptz")
  timestamp!: number;

  // this may or may not actually work in TypeORM
  //@Column("interval")
  //timeSpent!: string;
  //
  // i'm just saying fuck it and storing minutes for now.
  @Column('integer')
  timeSpent!: number;

  @Column( { type: 'enum', enum: Sector } )
  sector!: Sector;

  @ManyToOne( type => Project, project => project.logs )
  project?: Project;

  @ManyToOne( type => Task, task => task.logs )
  task?: Task;
}

