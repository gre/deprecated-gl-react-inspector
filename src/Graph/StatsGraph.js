const React = require("react");
const raf = require("raf");
const {
  Component,
  PropTypes
} = React;

const styles = {
  dot: {
    fill: "#999",
    r: 2
  },
  lines: {
    stroke: "#999",
    fill: "none",
    strokeWidth: 1
  }
};

class StatsGraph extends Component {

  constructor (props) {
    super(props);
    this._id = 1;
    this.state = {
      profiles: [{ t: 0, value: props.value, id: this._id++ }],
      time: 0
    };
  }

  componentWillMount () {
    let startTime;
    const loop = T => {
      if (!startTime) startTime = T;
      const time = T - startTime;
      this._raf = raf(loop);
      const { timeRange } = this.props;
      const { profiles: prevProfiles } = this.state;
      const profiles = prevProfiles.filter(({ t }) => t > time - timeRange);
      this.setState({ time, profiles });
    };
    this._raf = raf(loop);
  }

  componentWillUnmount () {
    raf.cancel(this._raf);
  }

  componentWillReceiveProps ({ value }) {
    const {props} = this;
    if (props.value !== value) {
      const { profiles, time } = this.state;
      this.setState({
        profiles: profiles.concat({
          t: time,
          value,
          id: this._id++
        })
      });
    }
  }

  shouldComponentUpdate ({ timeRange, width, height }, { profiles: { length }, time }) {
    const { props, state } = this;
    return (state.profiles.length !== length || length>0 && state.time !== time) ||
    props.timeRange !== timeRange ||
    props.width !== width ||
    props.height !== height;
  }

  render () {
    const { timeRange, width, height } = this.props;
    const { profiles, time } = this.state;
    const { length } = profiles;
    const maxValue = profiles.map(p => p.value).reduce((a, b) => Math.max(a, b), 0);
    if (length===0 || maxValue<=0) return <svg width={width} height={height} />;

    const pad = 2;
    const x = t => pad + (width-2*pad) * (timeRange - time + t) / timeRange;
    const y = v => pad + (height-2*pad) * (maxValue - v) / maxValue;

    const linesPath =
    [ length ? `M${pad},${y(profiles[0].value)}` : "" ]
    .concat(profiles.map(({ t, value }) => `L${x(t)},${y(value)}`))
    .join(" ");

    const last = profiles[length-1];

    return (
      <svg width={width} height={height}>
        <circle
          cx={x(last.t)}
          cy={y(last.value)}
          style={styles.dot}
        />
        <path key="lines" d={linesPath} style={styles.lines} />
      </svg>
    );
  }
}

StatsGraph.propTypes = {
  value: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  timeRange: PropTypes.number.isRequired
};

StatsGraph.defaultProps = {
  timeRange: 2000,
  width: 50,
  height: 20
};

module.exports = StatsGraph;
