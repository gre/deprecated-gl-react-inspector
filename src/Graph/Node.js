const React = require("react");
const {
  Component,
  PropTypes
} = React;
const {Motion, spring} = require("react-motion");
const StatsGraph = require("./StatsGraph");
const shallowShouldComponentUpdate = require("../shallowShouldComponentUpdate");
const Preview = require("./Preview");

const statsGraphWidth = 50;
const statsGraphHeight = 16;

const styles = {
  noBlank: {
    background: "#fff",
    border: "1px solid #ddd",
    padding: "5px 10px",
    borderRadius: "3px",
    boxSizing: "border-box"
  },
  profile: {
    position: "absolute",
    right: 0,
    fontSize: "10px",
    width: "100%",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexWrap: "wrap"
  },
  profileNumbers: {
    display: "inline-block"
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
      type,
      capture,
      profileExclusive,
      profileInclusive,
      Component,
      expanded,
      onSetExpanded,
      profileSum,
      profileMode,
      captureEnabled,
      ...rest
    } = props;

    const componentProps = {
      ...rest,
      expanded,
      width,
      capture
    };

    const blank = Component.useBlankNode;

    const style = {
      position: "absolute",
      top: y,
      left: x,
      width,
      userSelect: "none",
      MozUserSelect: "none",
      WebkitUserSelect: "none",
      ...(blank ? {} : styles.noBlank)
    };

    const boxStyle = {
      overflow: "hidden"
    };

    const headerStyle = {
      wordWrap: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      paddingBottom: "2px",
      marginBottom: "2px",
      borderBottom: expanded ? "1px solid #eee" : "",
      fontSize: "12px",
      color: "#aaa",
      position: "relative",
      ...this.dragProps.style
    };

    const timeStyle = {
      color: "#888"
    };

    const timePercentageStyle = {
      color: "#bbb"
    };

    return <Motion defaultStyle={{height}} style={{height: spring(height, [120, 17])}}>{({ height }) => {
      const profileStyle = {
        ...styles.profile,
        bottom: height
      };
      return <div style={{ ...style, height }}>
        {
        type==="output" && profileInclusive && <div style={profileStyle}>
          <StatsGraph value={profileInclusive} width={statsGraphWidth} height={statsGraphHeight} />
          <div style={styles.profileNumbers}>
            <span style={timeStyle}>{profileInclusive.toFixed(3)}ms</span>
          </div>
        </div> ||
        profileMode==="exclusive" && profileExclusive && <div style={profileStyle}>
          <StatsGraph value={profileExclusive} width={statsGraphWidth} height={statsGraphHeight} />
          <div style={styles.profileNumbers}>
            <span style={timeStyle}>{profileExclusive.toFixed(3)}ms</span>
            <span style={timePercentageStyle}>&nbsp;({(100*profileExclusive/profileSum).toFixed(0)}%)</span>
          </div>
        </div> ||
        profileMode==="inclusive" && profileInclusive && <div style={profileStyle}>
          <StatsGraph value={profileInclusive} width={statsGraphWidth} height={statsGraphHeight} />
          <div style={styles.profileNumbers}>
            <span style={timeStyle}>{profileInclusive.toFixed(3)}ms</span>
            <span style={timePercentageStyle}>&nbsp;({(100*profileInclusive/profileSum).toFixed(0)}%)</span>
          </div>
        </div> ||
        null
        }
        <div style={{ ...boxStyle, height }}>
          { !Component.renderHeader ? null :
          <div {...this.dragProps} style={headerStyle}>
            {Component.renderHeader({ ...componentProps, expanded, onSetExpanded })}
          </div> }
          <Component {...componentProps} dragProps={this.dragProps} />
          { !captureEnabled && !capture ? null :
          <Preview data={capture} maxHeight={100} maxWidth={width-34} /> }
        </div>
      </div>;
    }}</Motion>;
  }
}

Node.propTypes = {
  rect: PropTypes.object.isRequired,
  capture: PropTypes.any,
  profile: PropTypes.number,
  Component: PropTypes.any.isRequired,
  onMove: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
  onSetExpanded: PropTypes.func.isRequired,
  profileMode: PropTypes.string.isRequired,
  captureEnabled: PropTypes.bool.isRequired
};

module.exports = Node;
