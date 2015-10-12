const React = require("react");
const {
  Component,
  PropTypes
} = React;
const NodeConnectionDotsSVG = require("./NodeConnectionDotsSVG");
const NodeConnectionLineSVG = require("./NodeConnectionLineSVG");
const immupdate = require("immupdate");
const Node = require("./Node");

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
    dataNode,
    capture: dataNode.capture,
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

function build (data, onChange) {
  const contentNodes = data.contents.map((content, id) => ({
    type: "content",
    content,
    capture: content.capture,
    id,
    key: "C"+id
  }));
  const imageNodes = extractImages(data.tree).map((uri, i) => ({
    type: "image",
    uri,
    capture: uri,
    key: "i"+i
  }));
  const outputNode = {
    type: "output",
    key: "o"
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
  recBuild("", data.tree, { nodes, lines }, 0, {}, imageIndexByURL, tree => onChange({ ...data, tree }));
  return { nodes, lines };
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

function resolveNodesRect (dataNodes, { nodeMargin, nodesExpanded }) {
  const nodes = dataNodes.map((node, i) => ({ ...node, size: nodeComponentForType[node.type].calculateSize(node, nodesExpanded[i]) }));
  const groupedDataNodes = groupBy(nodes, "type");

  // handle gl nodes
  const nodesByLevel = groupByLevel(groupedDataNodes.gl);
  const widthByLevel = nodesByLevel.map(nodes => nodes.reduce((max, { size: { width } }) => Math.max(width, max), 0));
  const heightByLevel = nodesByLevel.map(nodes => nodes.reduce((sum, { size: { height } }) => sum + height + nodeMargin, 0) - nodeMargin);
  const widthByLevelAccumulated = widthByLevel.reduce((acc, width) => acc.concat(acc[acc.length-1] + width + nodeMargin), [ 0 ]);
  const glWidth = widthByLevelAccumulated[widthByLevelAccumulated.length-1] - nodeMargin;
  const glHeight = heightByLevel.reduce((max, height) => Math.max(height, max), 0);

  // handle content nodes
  let contentLineMaxY = 0, contentX = 0, contentY = nodeMargin;
  const contentRect = (groupedDataNodes.content||[]).concat(groupedDataNodes.image||[]).map(node => {
    const { width, height } = node.size;
    if (contentX + width > glWidth) {
      // new line
      contentX = 0;
      contentY += contentLineMaxY;
      contentLineMaxY = 0;
    }
    else {
      contentLineMaxY = Math.max(contentLineMaxY, height);
    }
    const rect = { x: contentX, y: contentY + glHeight, width, height };
    contentX += width + nodeMargin;
    return rect;
  });

  // generate nodes rects
  const levelsAcc = nodesByLevel.map(() => 0);
  const nodesRect = nodes.map(node => {
    const { type, size: { width, height } } = node;
    let x, y, i;
    switch (type) {
    case "gl":
      const { lvl } = node;
      x = glWidth - widthByLevelAccumulated[lvl+1] + nodeMargin;
      y = Math.floor((glHeight-heightByLevel[lvl])/2) + levelsAcc[lvl];
      levelsAcc[lvl] += height + nodeMargin;
      return { x, y, width, height };

    case "content":
      i = groupedDataNodes.content.indexOf(node);
      return contentRect[i];

    case "output":
      x = glWidth + nodeMargin;
      y = Math.floor((glHeight-height)/2);
      levelsAcc[lvl] += height + nodeMargin;
      return { x, y, width, height };

    case "image":
      i = groupedDataNodes.image.indexOf(node) + groupedDataNodes.content && groupedDataNodes.content.length || 0;
      return contentRect[i];
    }
  });

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
    const { tree, contents, onChange } = props;
    const { nodes: dataNodes, lines: dataLines } = build({ tree, contents }, onChange);
    const nodesExpanded = dataNodes.map(() => true);
    if (previousState) {
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
      nodesExpanded
    });

    if (previousState) {
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
      nodesExpanded
    };
  }

  getSize () {
    const { nodesRect } = this.state;
    const { width, height } = this.props;
    let maxX=0, maxY=0;
    nodesRect.forEach(({ x, y, width, height }) => {
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    return {
      width: Math.max(width-60, maxX+20),
      height: Math.max(height-40, maxY+20)
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
    const { width, height, colors, Shaders } = this.props;
    const { nodesRect, dataNodes, dataLines, nodesExpanded } = this.state;
    const { width: maxWidth, height: maxHeight } = this.getSize();
    const linesPos = resolveLinesPos(dataLines, dataNodes, nodesRect, nodesExpanded);

    const style = {
      background: "#eee",
      display: "inline-block",
      overflow: "auto",
      width,
      height,
      boxSizing: "border-box"
    };

    const containerStyle = {
      width: maxWidth,
      height: maxHeight,
      position: "relative",
      display: "inline-block"
    };

    const absStyle = {
      width: maxWidth,
      height: maxHeight,
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
      <div style={style}>
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
                expanded: nodesExpanded[i]
              })
            )}
          </div>
          <svg style={svgStyle} width={width} height={height}>
            {dataLines.map((line, i) =>
              <NodeConnectionDotsSVG key={i} {...linesPos[i]} colors={colors} />)}
          </svg>
        </div>
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
  tree: PropTypes.object.isRequired,
  contents: PropTypes.array.isRequired,
  Shaders: PropTypes.object.isRequired,
  colors: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
};

module.exports = Graph;
