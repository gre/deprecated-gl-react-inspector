const React = require("react");
const {
  Component,
  PropTypes
} = React;
const NodeConnectionDotsSVG = require("./NodeConnectionDotsSVG");
const NodeConnectionLineSVG = require("./NodeConnectionLineSVG");
const immupdate = require("immupdate");
const Node = require("./Node");

const base64grid = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3woRFBYgsXCysgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAABIUlEQVR42u3cMQqAQAxE0YmNdt7/qHY2gkcIIe81lgvLZzun0uf8vo/zW9xJcoTVBCAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAmKXy/6XKLpcXgFTj2fYBes+3D4AABOAKBIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAmMY+wF72AbAPsPl8+wAIQACuQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIgGnsA+xlHwD7AJvPtw+AAATgCgSAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAAJim8v0liheAhV6jvg1xhNw/egAAAABJRU5ErkJggg==";

const nodeComponentForType = {
  gl: require("./GLNode"),
  content: require("./ContentNode"),
  output: require("./OutputNode"),
  image: require("./ImageNode")
};

function findIndex (coll, f) {
  for (let i=0; i<coll.length; i++)
    if (f(coll[i]))
      return i;
  return -1;
}

function recBuild (key, dataNode, { nodes, lines }, lvl, parentContext, imageIndexByURL, onChangeNode) {
  const thisIndex = nodes.length;
  const context = { ...parentContext, [dataNode.fboId]: thisIndex };
  nodes.push({
    type: "gl",
    ...dataNode,
    dataNode,
    lvl,
    key,
    onChange ({ uniforms }) {
      onChangeNode({ ...dataNode, uniforms });
    }
  });

  dataNode.contextChildren.forEach((child, i) => {
    context[child.fboId] = nodes.length;
    recBuild(key+"x"+i, child, {nodes, lines}, lvl+1, context, imageIndexByURL, node => onChangeNode(immupdate(dataNode, {
      contextChildren: { [i]: () => node }
    })));
  });

  const childrenContext = { ...context };
  dataNode.children.forEach((child, i) => {
    context[child.fboId] = nodes.length;
    recBuild(key+"c"+i, child, {nodes, lines}, lvl+1, childrenContext, imageIndexByURL, node => onChangeNode(immupdate(dataNode, {
      children: { [i]: () => node }
    })));
  });

  Object.keys(dataNode.uniforms).forEach(uniform => {
    const value = dataNode.uniforms[uniform];
    if (typeof value === "object" && !(value instanceof Array)) {
      const type = value.type;
      let fromIndex;
      if (type === "fbo") {
        fromIndex = context[value.id];
      }
      else if (type === "content") {
        fromIndex = value.id; // content index IS id in our case because we have prepended the data
      }
      else if (type === "uri") {
        fromIndex = imageIndexByURL[value.uri];
      }
      if (fromIndex !== undefined) {
        lines.push({
          from: { type, index: fromIndex },
          to: { index: thisIndex },
          uniform
        });
      }
    }
  });
}

function recExtractImages (dataNode, acc) {
  for (var k in dataNode.uniforms) {
    const v = dataNode.uniforms[k];
    if (v && v.type === "uri" && acc.indexOf(v.uri)===-1)
      acc.push(v.uri);
  }
  dataNode.children.forEach(c => recExtractImages(c, acc));
  dataNode.contextChildren.forEach(c => recExtractImages(c, acc));
}

function extractImages (dataTree) {
  const images = [];
  recExtractImages(dataTree, images);
  return images;
}

function searchDepthestUniform (dataNode, lvl, predicate) {
  const all =
  dataNode.contextChildren.map(child => searchDepthestUniform(child, lvl+1, predicate))
  .concat(dataNode.children.map(child => searchDepthestUniform(child, lvl+1, predicate)))
  .concat(
    Object.keys(dataNode.uniforms).map(uniform => {
      const value = dataNode.uniforms[uniform];
      return predicate(value, uniform) ? lvl : -Infinity;
    }));
  return Math.max(...all);
}

function build (data, onChange) {
  const contentNodes = data.contents.map((content, id) => ({
    type: "content",
    ...content,
    content,
    id,
    key: "C"+id,
    lvl: searchDepthestUniform(data.tree, 2, value =>
      typeof value === "object" && !(value instanceof Array) && value.type === "content" && value.id === id)
  }));
  const imageNodes = extractImages(data.tree).map((uri, i) => ({
    type: "image",
    uri,
    capture: uri,
    key: "i"+i,
    lvl: searchDepthestUniform(data.tree, 2, value =>
      typeof value === "object" && !(value instanceof Array) && value.type === "uri" && value.uri === uri)
  }));
  const outputNode = {
    type: "output",
    key: "o",
    lvl: 0
  };

  const imageIndexByURL = {};
  imageNodes.forEach(({uri}, i) => {
    imageIndexByURL[uri] = i + contentNodes.length;
  });

  const nodes = contentNodes.concat(imageNodes).concat(outputNode);

  const lines = [{
    // connect root node to output
    from: { type: "fbo", index: nodes.length }, // root node is index after nodes
    to: { index: nodes.length-1 } // output node is last node in nodes
  }];
  recBuild("", data.tree, { nodes, lines }, 1, {}, imageIndexByURL, tree => onChange({ ...data, tree }));

  let profileSum = 0;
  nodes.forEach(({ profileExclusive }) => profileSum += profileExclusive || 0);
  outputNode.profileExclusive = 0;
  outputNode.profileInclusive = profileSum;

  return { nodes, lines, profileSum };
}

function groupByLevel (nodes) {
  const nodesByLevel = [];
  nodes.forEach(node => {
    if (!nodesByLevel[node.lvl]) nodesByLevel[node.lvl] = [];
    nodesByLevel[node.lvl].push(node);
  });
  return nodesByLevel;
}

function groupBy (array, field) {
  const groups = {};
  array.forEach(el => {
    const group = el[field];
    if (!(group in groups)) groups[group] = [];
    groups[group].push(el);
  });
  return groups;
}

function resolveNodesRect (dataNodes, { nodeMargin, nodesExpanded, captureEnabled }) {
  const nodes = dataNodes.map((node, i) => ({ ...node, size: nodeComponentForType[node.type].calculateSize(node, nodesExpanded[i], captureEnabled) }));

  // handle gl nodes
  const nodesByLevel = groupByLevel(nodes);
  const widthByLevel = nodesByLevel.map(nodes => nodes.reduce((max, { size: { width } }) => Math.max(width, max), 0));
  const heightByLevel = nodesByLevel.map(nodes => nodes.reduce((sum, { size: { height } }) => sum + height + nodeMargin, 0) - nodeMargin);
  const widthByLevelAccumulated = widthByLevel.reduce((acc, width) => acc.concat(acc[acc.length-1] + width + nodeMargin), [ 0 ]);
  const glWidth = widthByLevelAccumulated[widthByLevelAccumulated.length-1] - nodeMargin;
  const glHeight = heightByLevel.reduce((max, height) => Math.max(height, max), 0);

  // generate nodes rects
  const levelsAcc = nodesByLevel.map(() => 0);
  const allocRect = node => {
    const { size: { width, height } } = node;
    let x, y;
    const { lvl } = node;
    x = glWidth - widthByLevelAccumulated[lvl+1] + nodeMargin;
    y = Math.floor((glHeight-heightByLevel[lvl])/2) + levelsAcc[lvl];
    levelsAcc[lvl] += height + nodeMargin;
    return { x, y, width, height };
  };

  // split by type to order/group visually each nodes column
  const nodesByType = groupBy(nodes, "type");
  const glNodes = (nodesByType.gl||[]).map(allocRect);
  const imageNodes = (nodesByType.image||[]).map(allocRect);
  const contentNodes = (nodesByType.content||[]).map(allocRect);
  const outputNodes = (nodesByType.output||[]).map(allocRect);
  const nodesRect = contentNodes.concat(imageNodes).concat(outputNodes).concat(glNodes);

  return nodesRect.map(({ x, y, width, height }) => ({
    x: x + 20,
    y: y + 20,
    width,
    height
  }));
}

function resolveLinesPos (dataLines, dataNodes, nodesRect, nodesExpanded) {
  return dataLines.map(line => {
    const { from: { index: fromIndex }, to: { index: toIndex }, ...rest } = line;
    const dataFrom = dataNodes[fromIndex];
    const dataTo = dataNodes[toIndex];
    const from = nodeComponentForType[dataFrom.type].calculateOutConnectorPosition(dataFrom, line, nodesRect[fromIndex]);
    const to = nodeComponentForType[dataTo.type].calculateInConnectorPosition(dataTo, line, nodesRect[toIndex], nodesExpanded[toIndex]);
    return {
      ...rest, // eslint-disable-line no-undef
      line, from, to, dataFrom, dataTo };
  });
}

class Graph extends Component {

  constructor (props) {
    super(props);
    this.state = this.getState(props);
    this._nodeHandlers = [];
  }

  componentWillReceiveProps (props) {
    this.setState(this.getState(props));
  }

  getState (props) {
    const previousState = this.state;
    const previousProps = this.props;
    const { tree, contents, onChange, expanded, captureEnabled, movable } = props;
    const { nodes: dataNodes, lines: dataLines, profileSum } = build({ tree, contents }, onChange);

    const nodesExpanded = dataNodes.map(() => expanded);
    if (previousState && previousProps.expanded === expanded) {
      const {
        dataNodes: prevDataNodes,
        nodesExpanded: prevNodesExpanded
      } = previousState;
      dataNodes.forEach(({key}, i) => {
        const oldNodeIndex = findIndex(prevDataNodes, node => node.key === key);
        if (oldNodeIndex !== -1) {
          nodesExpanded[i] = prevNodesExpanded[oldNodeIndex];
        }
      });
    }

    const nodesRect = resolveNodesRect(dataNodes, {
      nodeMargin: 20,
      nodesExpanded,
      captureEnabled
    });

    if (previousState && movable) {
      const { dataNodes: prevDataNodes, nodesRect: prevNodesRect } = previousState;
      dataNodes.forEach(({key}, i) => {
        const oldNodeIndex = findIndex(prevDataNodes, node => node.key === key);
        if (oldNodeIndex !== -1) {
          const oldRect = prevNodesRect[oldNodeIndex];
          const rect = nodesRect[i];
          rect.x = oldRect.x;
          rect.y = oldRect.y;
        }
      });
    }

    // FIXME: totalWidth & totalHeight should be computed from nodesRect here

    return {
      dataNodes,
      dataLines,
      nodesRect,
      nodesExpanded,
      profileSum
    };
  }

  getSize () {
    const { nodesRect } = this.state;
    let maxX=0, maxY=0;
    nodesRect.forEach(({ x, y, width, height }) => {
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    return {
      width: maxX+20,
      height: maxY+20
    };
  }

  getNodeHandlers (i) {
    return this._nodeHandlers[i] || (
    this._nodeHandlers[i] = {
      onMove: (x, y) => this.onDragNode(i, x, y),
      onSetExpanded: expanded => this.onSetExpanded(i, expanded)
    });
  }

  onDragNode (i, x, y) {
    this.setState({
      nodesRect: immupdate(this.state.nodesRect, {
        [i]: ({ width, height }) => ({
          x: Math.max(0, x),
          y: Math.max(0, y),
          width,
          height
        })
      })
    });
  }

  onSetExpanded (i, expanded) {
    const { nodesExpanded, nodesRect, dataNodes } = this.state;
    const node = dataNodes[i];
    this.setState({
      nodesExpanded: immupdate(nodesExpanded, {
        [i]: () => expanded
      }),
      nodesRect: immupdate(nodesRect, {
        [i]: nodeComponentForType[node.type].calculateSize(node, expanded)
      })
    });
  }

  render () {
    const { colors, Shaders, profileMode, openShader, captureEnabled, movable } = this.props;
    const { nodesRect, dataNodes, dataLines, nodesExpanded, profileSum } = this.state;
    const { width, height } = this.getSize();
    const linesPos = resolveLinesPos(dataLines, dataNodes, nodesRect, nodesExpanded);

    const containerStyle = {
      width,
      height,
      minWidth: "100%",
      minHeight: "100%",
      position: "relative",
      display: "inline-block",
      background: "url('data:image/png;base64,"+base64grid+"')",
      backgroundSize: "64px 64px"
    };

    const absStyle = {
      width,
      height,
      position: "absolute",
      top: 0,
      left: 0
    };

    const nodesContainerStyle = {
      ...absStyle
    };

    const svgStyle = {
      ...absStyle,
      WebkitPointerEvents: "none",
      pointerEvents: "none"
    };

    return (
      <div style={containerStyle}>
        <svg style={svgStyle} width={width} height={height}>
          {dataLines.map((line, i) => // FIXME: we should use a SVG for each node so it handle z-index properly
            <NodeConnectionLineSVG key={i} {...linesPos[i]} colors={colors} />)}
        </svg>
        <div style={nodesContainerStyle}>
          {dataNodes.map((data, i) =>
            React.createElement(Node, {
              ...this.getNodeHandlers(i),
              ...data,
              Component: nodeComponentForType[data.type],
              Shaders,
              rect: nodesRect[i],
              colors,
              expanded: nodesExpanded[i],
              profileSum,
              profileMode,
              openShader,
              captureEnabled,
              movable
            })
          )}
        </div>
        <svg style={svgStyle} width={width} height={height}>
          {dataLines.map((line, i) =>
            <NodeConnectionDotsSVG key={i} {...linesPos[i]} colors={colors} />)}
        </svg>
      </div>
    );
  }
}

Graph.defaultProps = {
  colors: {
    gl: "#f55",
    fbo: "#fb0", // OBVIOUSLY #fb0 is the color for framebuffer !!
    uri: "#39f",
    uniform: "#777",
    content: "#6c0",
    output: "#444",
    image: "#0cf"
  },
  onChange: () => {}
};

Graph.propTypes = {
  expanded: PropTypes.bool.isRequired,
  profileMode: PropTypes.string.isRequired,
  tree: PropTypes.object.isRequired,
  contents: PropTypes.array.isRequired,
  Shaders: PropTypes.object.isRequired,
  colors: PropTypes.object.isRequired,
  openShader: PropTypes.func.isRequired,
  captureEnabled: PropTypes.bool.isRequired,
  movable: PropTypes.bool.isRequired
};

module.exports = Graph;
