const React = require("react");
const {
  Component,
  PropTypes
} = React;
const GlslUniformsEditor = require("glsl-uniforms-editor").default;
const shallowShouldComponentUpdate = require("../shallowShouldComponentUpdate");

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
      values={uniforms}
      onChange={uniforms => onChange({ uniforms })}
      labelsWidth={50}
      width={width - 20}
      uniformInputMargin={0}
      labelStyle={(highlight, hover, { name, type }) => {
        const value = uniforms[name];
        const color = colors[value && value.type || type] || colors.uniform;
        return {
          color,
          fontFamily: "inherit",
          fontSize: "9px",
          lineHeight: "16px",
          verticalAlign: "bottom"
        };
      }}
      inputStyle={(focus, hover, { primitiveType }) => primitiveType === "bool" ? {} : ({
        color: "#579",
        fontFamily: "inherit",
        fontSize: "9px",
        lineHeight: "16px",
        padding: "0 4px",
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
    via,
    fboId
  },
  colors,
  Shaders,
  expanded,
  onSetExpanded,
  openShader
}) => {
  const style = {
    height: expanded ? 14 : 40,
    position: "relative"
  };
  const shaderNameStyle = {
    fontWeight: "bold",
    color: colors.gl
  };
  const viaStyle = {
    fontSize: "9px"
  };
  const viaCompStyle = {
    color: colors.gl
  };
  const openShaderStyle = {
    color: colors.gl,
    cursor: "pointer",
    padding: 4,
    background: "#fff"
  };
  const fboStyle = {
    position: "absolute",
    top: -4,
    right: -4,
    fontSize: "10px",
    padding: 4,
    color: colors.fbo,
    backgroundColor: "#fff"
  };
  const shaderName = Shaders.getName(shader);
  const onClick = e => {
    e.preventDefault();
    openShader(shader);
  };
  const title = shaderName+(via && via.length ? "\n(via "+(via||[]).join(" > ")+")" : "");
  return <div style={style}>
    <ExpandButton value={expanded} onChange={onSetExpanded} color={colors.gl} />
    <span title={title} style={shaderNameStyle}>
      {shaderName}
      <span style={openShaderStyle} onClick={onClick}>⦿</span>
    </span>
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
  { fboId>=0 ? <span style={fboStyle} title="Framebuffer ID">{fboId}</span> : null }
</div>;
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

function componentLinesForType (t) {
  if (t === "mat2") return 2;
  if (t === "mat3") return 3;
  if (t === "mat4") return 4;
  return 1;
}

const pluckKeys = (keys, obj) =>
  keys.map(key => obj[key]);

const uniformsHeight = uniformsTypes =>
  uniformsTypes.reduce((acc, t) =>
    acc + 2 + 19 * componentLinesForType(t), 0);

const subUniforms = (uniformsTypes, uniform) =>
  uniformsTypes.slice(0, uniformsTypes.indexOf(uniform));

GLNode.calculateInConnectorPosition = ({ dataNode: { uniforms, shaderInfos: { types: { uniforms: uniformsTypes } } } }, { uniform }, rect, expanded) =>
  ({
    x: rect.x,
    y: rect.y + (
      expanded ?
      38 + uniformsHeight(pluckKeys(subUniforms(Object.keys(reorder(uniforms, uniformsTypes).uniformsTypes), uniform), uniformsTypes)) :
      4 + 32 * percentageUniform(uniform, uniforms, uniformsTypes)
    )
  });

GLNode.calculateOutConnectorPosition = (data, line, rect) =>
  ({ x: rect.x + rect.width, y: rect.y + 10 });

GLNode.calculateSize = ({ dataNode: { shaderInfos: { types: { uniforms: uniformsTypes } } } }, expanded, captureEnabled) => {
  const width = expanded ? 180 : 120;
  const height = 40 + (!expanded ? 0 : uniformsHeight(pluckKeys(Object.keys(uniformsTypes), uniformsTypes)) + (captureEnabled ? 120 : 0));
  return { width, height };
};

module.exports = GLNode;
