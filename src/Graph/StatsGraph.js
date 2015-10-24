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
      profiles: [],
      time: 0
    };
  }

  componentWillMount () {
    let startTime;
    const loop = T => {
      if (!startTime) startTime = T;
      let time = T - startTime;
      this._raf = raf(loop);
      const { timeRange } = this.props;
      const { profiles: prevProfiles } = this.state;
      const profiles = prevProfiles.filter(({ t }) => t > time - timeRange);
      if (profiles.length === 0) {
        startTime = T; // we reset time when there are no profiles
        time = T - startTime;
      }
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

  shouldComponentUpdate ({ timeRange, width, height }, { profiles: { length } }) {
    const { props, state } = this;
    return (state.profiles.length !== length || length>0) ||
    props.timeRange !== timeRange ||
    props.width !== width ||
    props.height !== height;
  }

  render () {
    const { timeRange, width, height } = this.props;
    const { profiles, time } = this.state;
    const { length } = profiles;
    const maxValue = profiles.map(p => p.value).reduce((a, b) => Math.max(a, b), 0);
    if (length<=1 || maxValue<=0) return <svg width={width} height={height} />;

    const pad = 2;
    const x = t => (pad + (width-2*pad) * (Math.min(timeRange - time, 0) + t) / timeRange).toFixed(1);
    const y = v => (pad + (height-2*pad) * (maxValue - v) / maxValue).toFixed(1);

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
