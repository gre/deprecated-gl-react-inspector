const React = require("react");
const {
  Component,
  PropTypes
} = React;
const AceEditor = require("react-ace");
const beautify = require("json-beautify");
require("brace/mode/glsl");
require("brace/mode/json");
require("brace/theme/solarized_dark");

const Graph = require("../Graph");
const Group = require("./Group");
const Panel = require("./Panel");
const Select = require("./Select");
const Toggle = require("./Toggle");

const styles = {
  root: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    backgroundRepeat: "repeat",
    fontFamily: "'Lucida Grande', sans-serif",
    position: "relative",
    overflow: "hidden"
  },
  graph: {
    flex: 1,
    overflow: "auto",
    backgroundColor: "#f9f9f9"
  },
  toolbar: {
    fontSize: "12px",
    backgroundColor: "#f3f3f3",
    borderTop: "#999 1px solid",
    borderBottom: "#ccc 1px solid",
    width: "100%",
    height: "30px",
    padding: "4px 0",
    boxSizing: "border-box",
    verticalAlign: "middle"
  },
  main: {
    display: "flex",
    flex: 1,
    flexDirection: "row"
  }
};

const captureRates = {
  0: "Real Time",
  50: "20 FPS",
  100: "10 FPS",
  200: "5 FPS",
  1000: "1 FPS"
};

class Inspector extends Component {

  constructor (props) {
    super(props);
    this.state = {
      debug: null,
      expanded: props.defaultExpanded,
      capture: props.defaultCapture,
      captureRate: props.defaultCaptureRate,
      profile: props.defaultProfile,
      movable: props.defaultMovable,
      autoRedraw: false,
      profileMode: "exclusive",
      resetIncrement: 1,
      leftPanelEnabled: false,
      rightPanelEnabled: false,
      selectedShaderIndex: 0
    };
    this.attach(props.glCanvas, this.state);
    this.onChange = this.onChange.bind(this);
    this.setLeftPanelWidth = this.setLeftPanelWidth.bind(this);
    this.openShader = this.openShader.bind(this);
  }

  componentWillUnmount () {
    this.detach(this.props.glCanvas);
  }

  componentWillUpdate ({ glCanvas }, newState) {
    const props = this.props;
    const state = this.state;
    if (props.glCanvas !== glCanvas ||
      newState.capture !== state.capture ||
      newState.captureRate !== state.captureRate ||
      newState.profile !== state.profile ||
      newState.autoRedraw !== state.autoRedraw) {
      this.detach(props.glCanvas);
      this.attach(glCanvas, newState);
    }
  }

  attach (glCanvas, { capture, captureRate, profile, autoRedraw }) {
    glCanvas.setDebugProbe({
      onDraw: debug => {
        if (autoRedraw) glCanvas.requestDraw();
        this.setState({ debug });
      },
      capture,
      captureRate,
      profile
    });
  }

  detach (glCanvas) {
    glCanvas.setDebugProbe(null);
  }

  setLeftPanelWidth (leftPanelWidth) {
    leftPanelWidth = Math.max(200, leftPanelWidth);
    this.setState({ leftPanelWidth });
  }

  onChange (value) {
    console.log(value); // eslint-disable-line no-console
  }

  openShader (id) {
    const { debug: { Shaders } } = this.state;
    const selectedShaderIndex = Shaders.list().indexOf(""+id);
    if (selectedShaderIndex === -1) return;
    this.setState({
      selectedShaderIndex,
      leftPanelEnabled: true
    });
  }

  render () {
    const {
      debug,
      capture,
      profile,
      profileMode,
      resetIncrement,
      expanded,
      leftPanelEnabled,
      rightPanelEnabled,
      selectedShaderIndex,
      captureRate,
      movable,
      autoRedraw
    } = this.state;

    let shadersList, shaders, selectedShader, glsl;
    if (debug) {
      shadersList = debug.Shaders.list();
      shaders = shadersList.map(id => `(${id}) ${debug.Shaders.get(id).name}`);
      selectedShader = shadersList[selectedShaderIndex];
      glsl = debug.Shaders.get(selectedShader).frag;
    }

    return (
      <div style={styles.root}>
        <div style={styles.toolbar}>
          <Group>
            <Toggle value={movable} onChange={movable => this.setState({ movable })}>Movable</Toggle>
          </Group>
          <Group>
            <Toggle value={expanded} onChange={expanded => this.setState({ expanded })}>Expanded</Toggle>
          </Group>
          <Group>
            <Toggle value={capture} onChange={capture => this.setState({ capture })}>Capture</Toggle>
            &nbsp;
            { capture ?
            <Select
              values={captureRates}
              value={captureRate}
              onChange={captureRate => this.setState({ captureRate: parseInt(captureRate) })}
            /> : null }
          </Group>
          <Group>
            <Toggle value={profile} onChange={profile => this.setState({ profile })}>
              Profile
            </Toggle>
            &nbsp;
            { profile ?
            <Select
              values={{ inclusive: "Inclusive", exclusive: "Exclusive" }}
              value={profileMode}
              onChange={profileMode => this.setState({ profileMode })}
            /> : null }
          </Group>
          <Group>
            <Toggle value={autoRedraw} onChange={autoRedraw => this.setState({ autoRedraw })}>
              Force autoRedraw
            </Toggle>
          </Group>
        </div>

        { debug ?
        <div style={styles.main}>

          <Panel left
            enabled={leftPanelEnabled}
            setEnabled={leftPanelEnabled => this.setState({ leftPanelEnabled })}>{ () =>
            <div style={{ width: "100%", height: "100%" }}>
              <div style={styles.glslEditorHeader}>
                <Select
                  style={{ width: "100%" }}
                  values={shaders}
                  value={selectedShaderIndex}
                  onChange={(id, selectedShaderIndex) => this.setState({ selectedShaderIndex })}
                />
              </div>
              <AceEditor
                readOnly
                value={glsl}
                mode="glsl"
                theme="solarized_dark"
                width="100%"
                height="100%"
                name="glslEditor"
                fontSize={10}
                editorProps={{ $blockScrolling: true }}
                onChange={() => {}}
              />
            </div>
          }
          </Panel>

          <div style={styles.graph}>
          <Graph
            key={resetIncrement}
            {...debug}
            onChange={this.onChange}
            profileMode={profileMode}
            expanded={expanded}
            openShader={this.openShader}
            captureEnabled={capture}
            movable={movable}
          />
          </div>

          <Panel
            defaultWidth={500}
            enabled={rightPanelEnabled}
            setEnabled={rightPanelEnabled => this.setState({ rightPanelEnabled })}>{ () =>
            <AceEditor
              readOnly
              value={beautify(debug.tree, null, 2, 60)}
              mode="json"
              theme="solarized_dark"
              width="100%"
              height="100%"
              name="dataJsonViewer"
              fontSize={10}
              editorProps={{ $blockScrolling: true }}
              onChange={() => {}}
            />
          }</Panel>

        </div>
        : null }
      </div>
    );
  }
}

Inspector.propTypes = {
  glCanvas: PropTypes.object.isRequired,
  defaultCapture: PropTypes.bool,
  defaultCaptureRate: PropTypes.number,
  defaultProfile: PropTypes.bool,
  defaultExpanded: PropTypes.bool,
  defaultMovable: PropTypes.bool
};

Inspector.defaultProps = {
  defaultCapture: false,
  defaultCaptureRate: 100,
  defaultProfile: false,
  defaultExpanded: true,
  defaultMovable: false
};

module.exports = Inspector;
