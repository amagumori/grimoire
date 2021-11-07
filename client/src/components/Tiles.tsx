import React, { FunctionComponent } from 'react';

interface TileViewProps {
  bepp: number
}

export const TileView: FunctionComponent<TileViewProps> = ( props ) => {
  // https://www.carlrippon.com/repeat-element-n-times-in-jsx/

  return (
    <div className="tileview-container"></div>
  )
}

