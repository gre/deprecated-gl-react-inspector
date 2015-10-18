const React = require("react");
const {
  Component,
  PropTypes
} = React;

class Select extends Component {
  render () {
    const { values, value, onChange, style } = this.props;
    return <select style={style} onChange={e => onChange(e.target.value, e.target.selectedIndex)} value={value}>
      {Object.keys(values).map(key =>
        <option value={key} key={key}>{values[key]}</option>)}
    </select>;
  }
}
Select.propTypes = {
  style: PropTypes.object,
  value: PropTypes.any.isRequired,
  values: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired
};

module.exports = Select;
