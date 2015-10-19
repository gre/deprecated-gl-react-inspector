const React = require("react");
const {
  Component,
  PropTypes
} = React;

const styles = {
  group: {
    display: "inline-block",
    padding: "0 6px",
    margin: "0 6px"
  }
};

class Group extends Component {
  render () {
    const { children } = this.props;
    return <div style={styles.group}>{children}</div>;
  }
}
Group.propTypes = {
  children: PropTypes.node.isRequired
};

module.exports = Group;
