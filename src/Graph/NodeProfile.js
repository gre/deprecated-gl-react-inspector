const React = require("react");
const {
  Component,
  PropTypes
} = React;

const shallowShouldComponentUpdate = require("../shallowShouldComponentUpdate");
const StatsGraph = require("./StatsGraph");
const StatsPie = require("./StatsPie");
const {Motion, spring} = require("react-motion");

const statsGraphWidth = 50;
const statsGraphHeight = 16;
const statsPieSize = 12;

const styles = {
  profile: {
    fontSize: "10px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexWrap: "wrap-reverse",
    textAlign: "right"
  },
  profileNumbers: {
    display: "inline-block"
  },
  time: {
    color: "#888"
  }
};

class NodeProfile extends Component {
  constructor (props) {
    super(props);
    this.shouldComponentUpdate = shallowShouldComponentUpdate;
  }
  render () {
    const { mode, value, total, disablePercentage } = this.props;
    const ratio = value / total;
    return (
      <div style={styles.profile}>
        <StatsGraph key={mode} value={value} width={statsGraphWidth} height={statsGraphHeight} />
        <Motion defaultStyle={{ value }} style={{ value: spring(value, [120, 15]) }}>{ ({ value }) =>
          <span style={styles.time}>{value.toFixed(3)}ms</span>
        }</Motion>
        { disablePercentage ? null :
          <Motion
            defaultStyle={{ ratio }}
            style={{ ratio: spring(ratio, [120, 17]) }}>{ ({ ratio }) =>
            <StatsPie value={Math.max(0, Math.min(ratio, 1))} size={statsPieSize} />
          }
          </Motion> }
      </div>
    );
  }
}

NodeProfile.propTypes = {
  mode: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  disablePercentage: PropTypes.bool
};

module.exports = NodeProfile;
