const React = require("react");
const {
  Component,
  PropTypes
} = React;
const ExpandButton = require("./ExpandButton");

class ContentNode extends Component {

  render () {
    const {
      content: { code }
    } = this.props;

    const preStyle = {
      overflow: "hidden",
      whiteSpace: "nowrap",
      fontFamily: "monospace",
      fontSize: "9px",
      color: "#999"
    };

    return (
      <pre style={preStyle}>
        <code>
          {code}
        </code>
      </pre>
    );
  }
}

ContentNode.renderHeader = ({ id, colors, expanded, onSetExpanded }) => {

  const shaderNameStyle = {
    fontWeight: "bold",
    marginRight: "5px",
    color: colors.content
  };
  const shaderStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    fontSize: "10px",
    fontWeight: "bold",
    color: colors.content
  };
  return <span>
    <ExpandButton value={expanded} onChange={onSetExpanded} color={colors.content} />
    <span style={shaderNameStyle}>Content #{id}</span>
    { expanded ? <span style={shaderStyle}>{id}</span> : null }
  </span>;
};

ContentNode.propTypes = {
  id: PropTypes.number.isRequired,
  content: PropTypes.object.isRequired,
  Shaders: PropTypes.object.isRequired,
  colors: PropTypes.object.isRequired
};

ContentNode.calculateOutConnectorPosition = (data, line, rect) =>
  ({ x: rect.x + rect.width, y: rect.y + 10 });

ContentNode.calculateSize = (props, expanded) => {
  const width = expanded ? 180 : 100;
  const height = expanded ? 180 : 25;
  return { width, height };
};

module.exports = ContentNode;
