const React = require("react");
const {
  Component,
  PropTypes
} = React;

class ExpandButton extends Component {
  constructor (props, context) {
    super(props, context);
    this.onClick = this.onClick.bind(this);
  }
  onClick (e) {
    e.preventDefault();
    this.props.onChange(!this.props.value);
  }
  render () {
    const {
      value,
      color
    } = this.props;
    const style = {
      padding: "4px 4px 4px 0",
      color,
      cursor: "pointer"
    };
    return (
      <span style={style} onClick={this.onClick}>
        {value ? "▸" : "▾"}
      </span>
    );
  }
}

ExpandButton.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired
};

module.exports = ExpandButton;
