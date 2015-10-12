const React = require("react");
const {
  Component,
  PropTypes
} = React;

class OutputNode extends Component {

  render () {
    const {
      colors,
      dragProps
    } = this.props;

    const style = {
      position: "absolute",
      width: "40px",
      height: "40px",
      top: "0px",
      left: "0px",
      background: "#ddd",
      padding: "10px",
      borderRadius: "40px",
      boxSizing: "border-box",
      ...dragProps.style
    };

    const styleInner = {
      background: colors.output,
      borderRadius: "40px",
      height: "100%",
      width: "100%"
    };

    return (
      <div {...dragProps} style={style}>
        <div style={styleInner} />
      </div>
    );
  }
}

OutputNode.propTypes = {
  colors: PropTypes.object.isRequired,
  dragProps: PropTypes.object.isRequired
};

OutputNode.useBlankNode = true;

OutputNode.calculateInConnectorPosition = (data, line, rect) =>
  ({ x: rect.x, y: rect.y + 20 });

OutputNode.calculateSize = () => {
  const width = 40;
  const height = 40;
  return { width, height };
};

module.exports = OutputNode;
