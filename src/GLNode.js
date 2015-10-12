const React = require("react");
const {
  Component,
  PropTypes
} = React;
const GlslUniformsEditor = require("glsl-uniforms-editor");
const shallowShouldComponentUpdate = require("./shallowShouldComponentUpdate");

const ExpandButton = require("./ExpandButton");

const samplerOrder = [ "uri", "ndarray", "content", "fbo" ];
const uniformOrder = a => a.type === "sampler2D" ? (!a.value ? 0 : samplerOrder.indexOf(a.value.type) + 1) : -1;
function reorder (uniformsN, uniformsTypesN) {
  const uniforms = {}, uniformsTypes = {};
  Object.keys(uniformsN)
  .map(name => ({ name, type: uniformsTypesN[name], value: uniformsN[name] }))
  .sort((a, b) => uniformOrder(b) - uniformOrder(a))
  .forEach(({ name, type, value }) => {
    uniforms[name] = value;
    uniformsTypes[name] = type;
  });
  return { uniforms, uniformsTypes };
}

class GLNode extends Component {

  constructor (props, context) {
    super(props, context);
    this.shouldComponentUpdate = shallowShouldComponentUpdate;
  }

  render () {
    const {
      width,
      expanded,
      dataNode: {
        shaderInfos: {
          types: {
            uniforms: uniformsTypesNonOrdered
          }
        },
        uniforms: uniformsNonOrdered
      },
      colors,
      onChange
    } = this.props;

    const { uniforms, uniformsTypes } = reorder(uniformsNonOrdered, uniformsTypesNonOrdered);

    return <GlslUniformsEditor
      types={uniformsTypes}
      defaultValues={uniforms}
      onChange={uniforms => onChange({ uniforms })}
      labelsWidth={64}
      width={width - 20}
      uniformInputMargin={2}
      labelStyle={(highlight, hover, { name, type }) => {
        const value = uniforms[name];
        const color = colors[value && value.type || type] || colors.uniform;
        return {
          color: color, //highlight ? "#49f" : hover ? "#9cf" : "#579",
          fontFamily: "monospace",
          fontSize: "9px",
          lineHeight: "20px"
        };
      }}
      inputStyle={(focus, hover, { primitiveType }) => primitiveType === "bool" ? {} : ({
        color: "#579",
        fontFamily: "monospace",
        fontSize: "9px",
        lineHeight: "16px",
        padding: "0 5px",
        margin: "0",
        border: "1px solid "+(focus ? "#49F" : (hover ? "#9cf" : "#eee")),
        outline: focus ? "#49F 1px solid" : "none",
        boxShadow: focus ? "0px 0px 2px #49F" : "none"
      })}
      renderNoUniforms={()=>null}
      renderSampler2DInput={props => {
        if (props.value && props.value.type === "uri") {
          const onChange = e => {
            const value = e.target.value || null;
            props.onChange(value);
          };
          return <input
            {...props}
            type="url"
            value={props.value.uri}
            onChange={onChange}
          />;
        }
        return null;
      }}
    />;
  }
}

GLNode.renderHeader = ({
  dataNode: {
    shader,
    via
  },
  colors,
  Shaders,
  expanded,
  onSetExpanded
}) => {
  const style = {
    height: expanded ? 14 : 40,
    display: "inline-block"
  };
  const shaderNameStyle = {
    fontWeight: "bold",
    marginRight: "5px",
    color: colors.gl
  };
  const viaStyle = {
    fontSize: "7px"
  };
  const viaCompStyle = {
    color: colors.gl
  };
  const shaderStyle = {
    display: expanded ? "block" : "none",
    position: "absolute",
    top: 0,
    right: 0,
    fontSize: "10px",
    fontWeight: "bold",
    color: colors.gl
  };
  const shaderName = Shaders.getName(shader);
  return <span style={style}>
    <ExpandButton value={expanded} onChange={onSetExpanded} color={colors.gl} />
    <span style={shaderNameStyle}>{shaderName}</span>
    {via && via.length ? <span style={viaStyle}>
    {"via "}
    {via.map((name, i) =>
      <span key={i}>
        <span style={viaCompStyle}>
          {name}
        </span>
      {i===via.length-1 ? "" : " > "}
      </span>
    )}
  </span> : null}
    <span style={shaderStyle}>{shader}</span>
  </span>;
};

GLNode.propTypes = {
  dataNode: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  expanded: PropTypes.bool.isRequired,
  Shaders: PropTypes.object.isRequired,
  colors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

function percentageUniform (uniform, uniforms, uniformsTypes) {
  const keys = Object.keys(reorder(uniforms, uniformsTypes).uniformsTypes);
  let length = 0;
  for (let k in uniformsTypes) {
    if (uniformsTypes[k] === "sampler2D")
      length ++;
  }
  return (0.5 + keys.indexOf(uniform)) / length;
}

GLNode.calculateInConnectorPosition = ({ dataNode: { uniforms, shaderInfos: { types: { uniforms: uniformsTypes } } } }, { uniform }, rect, expanded) =>
  ({
    x: rect.x,
    y: rect.y + (
      expanded ?
      34 + 22 * Object.keys(reorder(uniforms, uniformsTypes).uniformsTypes).indexOf(uniform) :
      4 + 32 * percentageUniform(uniform, uniforms, uniformsTypes)
    )
  });

GLNode.calculateOutConnectorPosition = (data, line, rect) =>
  ({ x: rect.x + rect.width, y: rect.y + 10 });

GLNode.calculateSize = ({ dataNode: { uniforms } }, expanded) => {
  const width = expanded ? 180 : 140;
  const height = 40 + (!expanded ? 0 : 20 * Object.keys(uniforms).length + 120);
  return { width, height };
};

module.exports = GLNode;
