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
  test: String
}

type DraggableState = {
  relX: number,
  x: number 
}


class Draggable extends React.Component<DummyProps, DraggableState> {

    private divRef: React.RefObject<HTMLDivElement>

    constructor( props: DummyProps) { 
      super(props)
      this.divRef = React.createRef()
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
      
    }

    state: DraggableState = { 
      relX: 0,
      x: 0
    };

  /*
    constructor(props: DraggableProps ) {
        super(props);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
    }
   */

  onStart(e: React.MouseEvent<HTMLDivElement>) {
    const body = document.body;
    if ( this.divRef.current != null ) {
      const box = this.divRef.current.getBoundingClientRect();
      this.setState({
        relX: e.pageX - (box.left + body.scrollLeft - body.clientLeft)
      })
    };
  }

  onMove(e: MouseEvent ) {
        const x = Math.trunc((e.pageX - this.state.relX))
        if (x !== this.state.x ) { 
            this.setState({
                x
            });
          //this.props.onMove && this.props.onMove(this.state.x)
        }        
    }

  onMouseDown(e: React.MouseEvent<HTMLDivElement> ) {
        if (e.button !== 0) return;
        this.onStart(e);
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
