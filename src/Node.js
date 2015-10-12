const React = require("react");
const {
  Component,
  PropTypes
} = React;
const {Motion, spring} = require("react-motion");
const shallowShouldComponentUpdate = require("./shallowShouldComponentUpdate");
const Preview = require("./Preview");

const styles = {
  noBlank: {
    background: "#fff",
    border: "1px solid #ddd",
    padding: "5px 10px",
    borderRadius: "3px",
    boxSizing: "border-box"
  }
};

class Node extends Component {

  constructor (props, context) {
    super(props, context);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.shouldComponentUpdate = shallowShouldComponentUpdate;
    this.dragProps = {
      style: {
        cursor: "move"
      },
      onMouseDown: this.onMouseDown
    };
  }

  componentWillUnmount () {
    this.detachEvents();
  }

  attachEvents () {
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("mouseleave", this.onMouseLeave);
  }

  detachEvents () {
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("mouseleave", this.onMouseLeave);
  }

  onMouseDown (e) {
    const { rect: { x, y } } = this.props;
    const { clientX, clientY } = e;
    this._drag = {
      clientX,
      clientY,
      x,
      y
    };
    this.attachEvents();
  }

  onMouseMove (e) {
    const { onMove } = this.props;
    const { clientX: originClientX, clientY: originClientY, x, y } = this._drag;
    const { clientX, clientY } = e;
    onMove(
      x + clientX - originClientX,
      y + clientY - originClientY
    );
  }

  onMouseUp () {
    this.detachEvents();
    this._drag = null;
  }

  onMouseLeave () {
    this.detachEvents();
    this._drag = null;
  }

  render () {
    const { props } = this;
    const {
      rect: { x, y, width, height },
      capture,
      Component,
      expanded,
      onSetExpanded,
      ...rest
    } = props;

    const componentProps = {
      ...rest,
      expanded,
      width
    };

    const blank = Component.useBlankNode;

    const style = {
      overflow: "hidden",
      position: "absolute",
      top: y,
      left: x,
      width,
      userSelect: "none",
      MozUserSelect: "none",
      WebkitUserSelect: "none",
      ...(blank ? {} : styles.noBlank)
    };

    const headerStyle = {
      wordWrap: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      paddingBottom: "2px",
      marginBottom: "2px",
      borderBottom: expanded ? "1px solid #eee" : "",
      fontSize: "10px",
      color: "#aaa",
      fontFamily: "monospace",
      position: "relative",
      ...this.dragProps.style
    };

    return <Motion defaultStyle={{height}} style={{height: spring(height, [120, 17])}}>{interpolatedStyle =>
      <div style={{ ...style, ...interpolatedStyle }}>
        { !Component.renderHeader ? null :
        <div {...this.dragProps} style={headerStyle}>
          {Component.renderHeader({ ...componentProps, expanded, onSetExpanded })}
        </div> }
        <Component {...componentProps} dragProps={this.dragProps} />
        { !capture ? null :
        <Preview data={capture} maxHeight={100} maxWidth={width-34} /> }
      </div>
    }</Motion>;
  }
}

Node.propTypes = {
  rect: PropTypes.object.isRequired,
  capture: PropTypes.any,
  Component: PropTypes.any.isRequired,
  onMove: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
  onSetExpanded: PropTypes.func.isRequired
};

module.exports = Node;
