const React = require("react");
const {
  Component,
  PropTypes
} = React;

class Toggle extends Component {
  render () {
    const { value, onChange, children: text } = this.props;
    return <label>
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />
      {text}
    </label>;
  }
}
Toggle.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

module.exports = Toggle;
