import React, { useEffect, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { logsSelectors, selectLogs, fetchLogs, createLog } from '../services/logs'
import store from '../services/store'

export const TileView: FunctionComponent = ( ) => {
  // https://www.carlrippon.com/repeat-element-n-times-in-jsx/

  const dispatch = useDispatch()

  useEffect( () => {
    dispatch( fetchLogs() )
  }, [dispatch] )

  const logs = logsSelectors.selectAll( store.getState() )

  const divs = logs.map( (log) => ( <div className="grid-box"></div> ) )

  return (
    <div className="grid-container">
      { divs } 
    </div>
  )
}

