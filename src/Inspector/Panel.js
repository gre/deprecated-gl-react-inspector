const React = require("react");
const {
  Component,
  PropTypes
} = React;
const {Motion, spring} = require("react-motion");

const PanelOpenIcon = require("./PanelOpenIcon");
const PanelResizer = require("./PanelResizer");

const styles = {
  panel: {
    position: "absolute",
    top: 30,
    paddingBottom: 30,
    backgroundColor: "#fff",
    height: "100%",
    zIndex: 2
  },
  leftPanelButton: {
    position: "absolute",
    right: -20,
    top: 2,
    zIndex: 2
  },
  rightPanelButton: {
    position: "absolute",
    left: -20,
    top: 2,
    zIndex: 2
  }
};

class Panel extends Component {
  constructor (props) {
    super(props);
    this.state = {
      width: props.defaultWidth
    };
    this.setWidth = this.setWidth.bind(this);
    this.toggleEnable = this.toggleEnable.bind(this);
  }
  toggleEnable () {
    const { enabled, setEnabled } = this.props;
    setEnabled(!enabled);
  }
  setWidth (width) {
    const {minWidth, maxWidth} = this.props;
    width = Math.min(Math.max(minWidth, width), maxWidth);
    this.setState({ width });
  }
  render () {
    const { children, left, enabled } = this.props;
    const { width } = this.state;
    const panelButton = left ? styles.leftPanelButton : styles.rightPanelButton;
    const value = enabled ? width : 0;
    return <Motion
      defaultStyle={{ value }}
      style={{value: spring(value, [300, 30])}}>{interpolated => {
        const value = Math.round(interpolated.value);
        return <div style={{ width: value, height: "100%" }}>
          <div style={{
            ...styles.panel,
            [left ? "left" : "right"]: value - width,
            [left ? "borderRight" : "borderLeft"]: enabled ? "1px solid #999" : "",
            width
          }}>
            <span style={panelButton} onClick={this.toggleEnable}>
              <PanelOpenIcon left={left} enabled={enabled} />
            </span>
            { enabled ? <PanelResizer left={left} value={width} onChange={this.setWidth} /> : null }
            { value > 0 ? children() : null}
          </div>
        </div>;
      }
    }</Motion>;
  }
}

Panel.defaultProps = {
  defaultEnabled: false,
  defaultWidth: 400,
  minWidth: 200,
  maxWidth: 600,
  left: false
};

Panel.propTypes = {
  defaultEnabled: PropTypes.bool,
  defaultWidth: PropTypes.number,
  minWidth: PropTypes.number,
  maxWidth: PropTypes.number,
  left: PropTypes.bool,
  enabled: PropTypes.bool.isRequired,
  setEnabled: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired
};

module.exports = Panel;
