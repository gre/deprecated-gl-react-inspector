const React = require("react");
const {
  Component,
  PropTypes
} = React;

class NodeConnectionDotsSVG extends Component {
  render () {
    const { from, dataFrom, to, dataTo, colors, uniform } = this.props;
    const dotStyle = {
      stroke: "#999",
      strokeWidth: 1
    };
    const dotFromStyle = {
      ...dotStyle,
      fill: colors[dataFrom.type]
    };
    const dotToStyle = {
      ...dotStyle,
      fill: colors[dataTo.dataNode ? dataTo.dataNode.uniforms[uniform].type : dataTo.type]
    };
    const radFrom = 3;
    const radTo = 3;
    return (
      <g>
        <circle cx={from.x} cy={from.y} r={radFrom} style={dotFromStyle} />
        <circle cx={to.x} cy={to.y} r={radTo} style={dotToStyle} />
      </g>
    );
  }
}

NodeConnectionDotsSVG.propTypes = {
  from: PropTypes.object.isRequired,
  to: PropTypes.object.isRequired,
  dataFrom: PropTypes.object.isRequired,
  dataTo: PropTypes.object.isRequired,
  uniform: PropTypes.string,
  colors: PropTypes.object.isRequired
};

module.exports = NodeConnectionDotsSVG;
