const React = require("react");
const {
  Component,
  PropTypes
} = React;

class PanelOpenIcon extends Component {
  shouldComponentUpdate ({ left, enabled }) {
    const props = this.props;
    return props.left !== left || props.enabled !== enabled;
  }
  render () {
    const { left, enabled } = this.props;
    const width = 13;
    const height = 11;
    const color = "#666";
    return <div style={{
      position: "relative",
      width,
      height,
      display: "inline-block",
      border: color+" 1px solid",
      background: "#fff",
      cursor: "pointer",
      boxShadow: "0px 0px 1px rgba(0,0,0,0.2)"
    }}>
      <div style={{
        position: "absolute",
        height,
        left: 4 + (!left ? 4 : 0),
        borderRight: color+" 1px solid" }}
      />
      <div style={{
        position: "absolute",
        left: (left ? 7 : 2) - (enabled===left ? 5 : 0),
        top: 2,
        width: 0,
        height: 0,
        borderWidth: 4,
        borderStyle: "solid",
        borderColor: enabled===left ? "transparent "+color+" transparent transparent" : "transparent transparent transparent "+color
      }} />
    </div>;
  }
}
PanelOpenIcon.propTypes = {
  left: PropTypes.bool.isRequired,
  enabled: PropTypes.bool.isRequired
};

module.exports = PanelOpenIcon;
