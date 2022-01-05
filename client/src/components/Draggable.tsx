import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

type DraggableProps = {
  onMove: Function,
  onStop: Function,
  x: Number,
  y: Number,
  gridX: Number,
  gridY: Number
}

type DummyProps = { 
  parentWidth: number,
  parentX: number,
  timespan: number
}

type DraggableState = {
  x: number,
  timestamp: Date
}

class Draggable extends React.Component<DummyProps, DraggableState> {

  private divRef: React.RefObject<HTMLDivElement>
  private timeRatio: number  = 0 

  constructor( props: DummyProps) { 
    super(props)
    this.divRef = React.createRef()
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.setState( { x: this.props.parentX, timestamp: new Date(Date.now() - this.props.timespan ) })

    console.log('effective time: ' + new Date( Date.now() - this.props.timespan ) )

    // timespan comes in in ms - this gives ms per pixel
    this.timeRatio = this.props.timespan / this.props.parentWidth
    
    console.log('time ratio: ' + this.timeRatio)
  }

  state: DraggableState = { 
    timestamp: new Date(Date.now() - this.props.timespan),
    x: this.props.parentX
  }

  onStart(e: React.MouseEvent<HTMLDivElement>) {
    const body = document.body;
    if ( this.divRef.current != null ) { 
      const box = this.divRef.current.getBoundingClientRect();
      console.log("passed width: " + this.props.parentWidth )
      console.log("passed offset: " + this.props.parentX )
      console.log('left: ' + box.left)
      this.setState({
        x: box.left
        //relX: e.pageX - (box.left + body.scrollLeft - body.clientLeft)
      })
    };
  }

  onMove(e: MouseEvent ) {
    // incredibly optimized hot-loop code worthy of RAD tools
    var x = Math.trunc(e.pageX) 
    if ( x > this.props.parentWidth + this.props.parentX ) {
      x = this.props.parentWidth + this.props.parentX
    }
    if ( x < this.props.parentX ) x = this.props.parentX

    let xOffset = x - this.props.parentX
    console.log('xof' + xOffset)
    let timeOffset = Math.trunc( xOffset * this.timeRatio )
    console.log('time offset: ' + timeOffset)
    let time = new Date( this.state.timestamp.getTime() + timeOffset )
    console.log('time: ' + time.toLocaleString('en-US'))

    if (x !== this.state.x ) { 
      this.setState({
        x: x
      });
    }        
  }

  onMouseDown(e: React.MouseEvent<HTMLDivElement> ) {
    if (e.button !== 0) return;
    //this.onStart(e);
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp);
    e.preventDefault();
  }

  onMouseUp(e: MouseEvent ) {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    //this.props.onStop && this.props.onStop(this.state.x)
    e.preventDefault();
  }

  onMouseMove(e: MouseEvent ) {
    this.onMove(e);
    e.preventDefault();
  }

  /*
    onTouchStart(e: React.TouchEvent ) {
        this.onStart(e.touches[0]);
        document.addEventListener('touchmove', this.onTouchMove, {passive: false});
        document.addEventListener('touchend', this.onTouchEnd, {passive: false});
        e.preventDefault();
    }

    onTouchMove(e: React.TouchEvent) {
        this.onMove(e.touches[0]);
        e.preventDefault();
    }

    onTouchEnd(e: React.TouchEvent) {
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
        this.props.onStop && this.props.onStop(this.state.x)
        e.preventDefault();
    }
   */

    render() {
        return <div
            className="gg-pin-alt"
            onMouseDown={this.onMouseDown}
            style={{
                position: 'absolute',
                left: this.state.x,
                touchAction: 'none'
            }}
            ref={this.divRef} 
        >
        </div>;
    }
}

export default Draggable;

  /*
export default React.forwardRef( (props: DummyProps, ref: React.MutableRefObject) => {
  <Draggable { ...props } innerRef={ref} />
})
   */