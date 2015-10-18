const React = require("react");
const {
  Component,
  PropTypes
} = React;

const styles = {
  inner: {
    fill: "#ddd"
  },
  outer: {
    fill: "#f9f9f9"
  },
  text: {
    fill: "#666",
    textAnchor: "middle",
    alignmentBaseline: "middle",
    fontSize: "6px"
  }
};

class StatsPie extends Component {

  shouldComponentUpdate ({ value, size }) {
    const props = this.props;
    return props.value !== value || props.size !== size;
  }

  render () {
    const { value, size } = this.props;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2;

    const x1 = cx, y1 = cy - r;

    const ang = value * 2 * Math.PI;
    const x2 = (cx + Math.sin(ang) * r).toFixed(1);
    const y2 = (cy + -Math.cos(ang) * r).toFixed(1);

    const innerPath = [
      `M${cx},${cy}`,
      `L${x1},${y1}`,
      `A${cx},${cy} 0 ${ang>Math.PI ? 1 : 0},1 ${x2},${y2}`,
      "z"
    ].join(" ");

    return (
      <svg width={size+10} height={size}>
        <circle style={value===1 ? styles.inner : styles.outer} cx={cx} cy={cy} r={r} />
        <path style={styles.inner} d={innerPath} />
        <text style={styles.text} x={cx} y={cy}>{(value*100).toFixed(0)+""}</text>
        <text style={styles.text} x={size+5} y={cy}>{"%"}</text>
      </svg>
    );
  }
}

StatsPie.propTypes = {
  value: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired
};

module.exports = StatsPie;
