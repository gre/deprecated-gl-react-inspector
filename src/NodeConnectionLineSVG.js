const React = require("react");
const {
  Component,
  PropTypes
} = React;

class NodeConnectionLineSVG extends Component {
  render () {
    const { from, to, tension, solid } = this.props;
    const dx = from.x - to.x;
    const dy = from.y - to.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const t = tension * dist;
    const s = Math.min(solid * dist, 8);
    const style = {
      stroke: "#bbb",
      strokeWidth: 1,
      fill: "none"
    };
    const d = [
      "M"+[ from.x, from.y ],
      "L"+[ from.x + s, from.y ],
      "C"+[ from.x + t, from.y ],
      [ to.x - t, to.y ],
      [ to.x - s, to.y ],
      "L"+[ to.x, to.y ]
    ].join(" ");
    return (
      <path style={style} d={d} />
    );
  }
}

NodeConnectionLineSVG.defaultProps = {
  tension: 0.3,
  solid: 0.05
};

NodeConnectionLineSVG.propTypes = {
  from: PropTypes.object.isRequired,
  to: PropTypes.object.isRequired,
  tension: PropTypes.number,
  solid: PropTypes.number
};

module.exports = NodeConnectionLineSVG;
