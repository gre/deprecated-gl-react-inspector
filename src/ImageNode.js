const React = require("react");
const {
  Component,
  PropTypes
} = React;
const ExpandButton = require("./ExpandButton");

class ImageNode extends Component {
  render () {
    return <span />;
  }
}

ImageNode.renderHeader = ({ uri, colors, expanded, onSetExpanded }) => {
  const uriStyle = {
    fontSize: "8px",
    fontWeight: "bold",
    color: colors.image
  };
  return <span>
    <ExpandButton value={expanded} onChange={onSetExpanded} color={colors.image} />
    <span style={uriStyle}>{uri}</span>
  </span>;
};

ImageNode.propTypes = {
  uri: PropTypes.string.isRequired,
  Shaders: PropTypes.object.isRequired,
  colors: PropTypes.object.isRequired
};

ImageNode.calculateOutConnectorPosition = (data, line, rect) =>
  ({ x: rect.x + rect.width, y: rect.y + 10 });

ImageNode.calculateSize = (props, expanded) => {
  const width = expanded ? 180 : 140;
  const height = expanded ? 180 : 25;
  return { width, height };
};

module.exports = ImageNode;
