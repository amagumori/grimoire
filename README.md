# grimoire

![screenshot](https://i.ibb.co/fSkf7nb/grimoire-screenshot.png)

## design

generally: 

+ projects
+ tasks
+ logs
+ tags

there is a **timebar** that tracks how all your time is used, through logs.

**tasks** *can be* associated with **projects**.

**projects** are a set of tasks, with projected lengths of time to complete.

**logs** are associated either with **tasks** or **tags**.

**tags** are descriptors for things you spend time on that aren't necessarily productivity sensitive.  eating, sleeping, etc.

## general flow

you sit down to try to be productive.  you create **projects** for the things you're currently working on, and make a to-do list of **tasks**.

at the end of every day / work session, you **log** your time in the timebar.

grimoire then tries to make projections on productivity and inspiration based on this data.

## user interface

everything happens through keyboard input, hopefully frictionlessly.  

you start by typing a command:

#### timebar

timebar shows a time series of all logs that can be zoomed and scrolled.

on hover: shows a concise truncated summary of the log

on click: opens a view above or below the timebar with the whole log data.  if we could make this editable that'd be greeeeaaaat.

#### log

you type log and ( hit enter )

an auto-form pops up, with first input focused: tag / area.
as you type the tag, autocomplete suggests existing tags.

you hit Tab to proceed - the playhead is highlighted and automatically starts at end of previous log.  you can drag it with the mouse ( or input datetime w keyboard ) 

on Tab / Enter / Space, other playhead is selected.  again, you can drag it or, this time, enter a "time spent" value.

on Tab, the selected timespan in the timebar is highlighted and breathes.  you now enter a description of the activity

description is a possible area for extensibility in adding variables that can be extracted and used to plot data.

next field, as you type an associated task, current tasks are suggested.  you can also create a new task, or skip this.

if creating a new task, it will also ask for the associated project.  

at this point, the whole input form will highlight to show it's ready, and it can be input with Enter or Space.

#### task

you type task, hit enter

enter the name of the task, Tab / enter

enter the associated project or task, if exists: this way we can do tasks w subtasks

to add: 

+ deadlines

+ projected finish date 

+ percentage complete

#### project

project is really just a property of tasks at the end of the day.

#### task list 

current tasks are shown in a listview

name of task : project

with a timebar showing time spent and progress.

--- 

timebar

  -> playhead
      takes props from timebar:
        time range
        entry times ( last entry ) 
      
      owns state:
        current pos

      passes back up to entry form: current time, calculated from playhead position

  -> entries

  -> entry view details
     delete / edit entry

cli

  -> add entries to timebar

  -> edit existing entries in timebar
