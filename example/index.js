const React = require("react");
const {
  Component
} = React;
const ReactDOM = require("react-dom");
const GlReactInspector = require("..");
const { Surface } = require("gl-react-dom");
const Example1 = require("./src/Example1");

window.Perf = require("react-addons-perf");

class Demo extends Component {

  constructor (props) {
    super(props);
    this.state = {
      glCanvas: null
    };
  }

  componentDidMount () {
    window.addEventListener("resize", () => this.forceUpdate());
    this.setState({ glCanvas: this.refs.gl.getGLCanvas() });
  }

  render () {
    const { glCanvas } = this.state;
    return (
      <div>
        <Surface ref="gl" width={200} height={120}>
          <Example1 />
        </Surface>
        <div style={{ height: window.innerHeight-120 }}>
        { glCanvas && <GlReactInspector.Inspector glCanvas={glCanvas} /> || null }
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById("demo"));

/*
function mockShaders (shaders) {
  return {
    getName: i => shaders[i-1].name,
    get: i => shaders[i-1]
  }
}

// to generate mocks: add this in renderVcontainer
//
console.log("{\n  data: "+
  JSON.stringify(renderer.props.data)+
  ",\n  contents: ["+
  contents.map(c => JSON.stringify(React.renderToStaticMarkup(c))).join(", ")+
  "],\n  Shaders: mockShaders("+
  JSON.stringify(Shaders.list().map(name => Shaders.get(name)))+
  ")\n}"
);
//

const mocks = [
  {
    name: "Blur",
    data: {"shader":2,"width":1024,"height":483,"premultipliedAlpha":false,"uniforms":{"color":[0,0,0],"map":{"type":"uri","uri":"http://i.imgur.com/T7SeRKx.png"},"factor":0.32,"t":{"type":"fbo","id":0}},"contextChildren":[],"children":[{"shader":1,"width":1024,"height":483,"premultipliedAlpha":false,"uniforms":{"direction":[1,0],"minBlur":0,"maxBlur":2,"blurMap":{"type":"uri","uri":"http://i.imgur.com/SzbbUvX.png"},"offset":[0,0],"resolution":[1024,483],"t":{"type":"fbo","id":1}},"contextChildren":[],"children":[{"shader":1,"width":1024,"height":483,"premultipliedAlpha":false,"uniforms":{"direction":[0,1],"minBlur":0,"maxBlur":2,"blurMap":{"type":"uri","uri":"http://i.imgur.com/SzbbUvX.png"},"offset":[0,0],"resolution":[1024,483],"t":{"type":"fbo","id":2}},"contextChildren":[],"children":[{"shader":1,"width":1024,"height":483,"premultipliedAlpha":false,"uniforms":{"direction":[-0.7071067811865475,0.7071067811865475],"minBlur":0,"maxBlur":2,"blurMap":{"type":"uri","uri":"http://i.imgur.com/SzbbUvX.png"},"offset":[0,0],"resolution":[1024,483],"t":{"type":"fbo","id":3}},"contextChildren":[],"children":[{"shader":1,"width":1024,"height":483,"premultipliedAlpha":false,"uniforms":{"direction":[0.7071067811865475,0.7071067811865475],"minBlur":0,"maxBlur":2,"blurMap":{"type":"uri","uri":"http://i.imgur.com/SzbbUvX.png"},"offset":[0,0],"resolution":[1024,483],"t":{"type":"uri","uri":"http://i.imgur.com/NjbLHx2.jpg","opts":{}}},"contextChildren":[],"children":[],"fboId":3}],"fboId":2}],"fboId":1}],"fboId":0}],"fboId":-1},
    contents: [],
    Shaders: mockShaders([{"frag":"#define GLSLIFY 1\nprecision highp float;\nvarying vec2 uv;\nuniform sampler2D t;\nuniform vec2 resolution;\nuniform vec2 direction;\nuniform float minBlur;\nuniform float maxBlur;\nuniform sampler2D blurMap;\nuniform vec2 offset;\n\nvec4 blur13_1_0(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n  vec4 color = vec4(0.0);\n  vec2 off1 = vec2(1.411764705882353) * direction;\n  vec2 off2 = vec2(3.2941176470588234) * direction;\n  vec2 off3 = vec2(5.176470588235294) * direction;\n  color += texture2D(image, uv) * 0.1964825501511404;\n  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;\n  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;\n  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;\n  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;\n  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;\n  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;\n  return color;\n}\n\n\n\nvoid main () {\n  vec2 dir = direction * mix(minBlur, maxBlur, texture2D(blurMap, uv + offset).r);\n  gl_FragColor = blur13_1_0(t, uv, resolution, dir);\n}\n","name":"blur1D"},{"frag":"#define GLSLIFY 1\nprecision highp float;\n\nvarying vec2 uv;\nuniform sampler2D t;\nuniform sampler2D map;\nuniform float factor;\nuniform vec3 color;\n\nvoid main () {\n  vec4 c = texture2D(t, uv);\n  float m = (1.0 - texture2D(map, uv).r) * factor;\n  gl_FragColor = vec4(mix(c.rgb, color, m), c.a);\n}\n","name":"mix"}])
  },
  {
    name: "VideoBlur",
    data: {"shader":2,"width":640,"height":480,"premultipliedAlpha":false,"uniforms":{"direction":[8.7,0],"resolution":[640,480],"t":{"type":"fbo","id":0}},"contextChildren":[],"children":[{"shader":2,"width":640,"height":480,"premultipliedAlpha":false,"uniforms":{"direction":[4.613871747242222,-4.613871747242222],"resolution":[640,480],"t":{"type":"fbo","id":1}},"contextChildren":[],"children":[{"shader":2,"width":640,"height":480,"premultipliedAlpha":false,"uniforms":{"direction":[3.075914498161482,3.075914498161482],"resolution":[640,480],"t":{"type":"fbo","id":2}},"contextChildren":[],"children":[{"shader":2,"width":640,"height":480,"premultipliedAlpha":false,"uniforms":{"direction":[0,2.175],"resolution":[640,480],"t":{"type":"fbo","id":3}},"contextChildren":[],"children":[{"shader":1,"width":640,"height":480,"premultipliedAlpha":false,"uniforms":{"hue":2.72,"tex":{"type":"content","id":0}},"contextChildren":[],"children":[],"fboId":3}],"fboId":2}],"fboId":1}],"fboId":0}],"fboId":-1},
    contents: ["<div style=\"position:absolute;top:0;left:0;width:640px;height:480px;visibility:visible;\"><video autoplay loop><source type=\"video/mp4\" src=\"video.mp4\"></video></div>"],
    Shaders: mockShaders([{"frag":"#define GLSLIFY 1\nprecision highp float;\nvarying vec2 uv;\nuniform sampler2D tex;\nuniform float hue;\n\nconst mat3 rgb2yiq = mat3(0.299, 0.587, 0.114, 0.595716, -0.274453, -0.321263, 0.211456, -0.522591, 0.311135);\nconst mat3 yiq2rgb = mat3(1.0, 0.9563, 0.6210, 1.0, -0.2721, -0.6474, 1.0, -1.1070, 1.7046);\n\nvoid main() {\n  vec3 yColor = rgb2yiq * texture2D(tex, uv).rgb;\n  float originalHue = atan(yColor.b, yColor.g);\n  float finalHue = originalHue + hue;\n  float chroma = sqrt(yColor.b*yColor.b+yColor.g*yColor.g);\n  vec3 yFinalColor = vec3(yColor.r, chroma * cos(finalHue), chroma * sin(finalHue));\n  gl_FragColor = vec4(yiq2rgb*yFinalColor, 1.0);\n}\n","name":"hueRotate"},{"frag":"#define GLSLIFY 1\nprecision highp float;\nvarying vec2 uv;\nuniform sampler2D t;\nuniform vec2 resolution;\nuniform vec2 direction;\n\nvec4 blur13_1_0(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n  vec4 color = vec4(0.0);\n  vec2 off1 = vec2(1.411764705882353) * direction;\n  vec2 off2 = vec2(3.2941176470588234) * direction;\n  vec2 off3 = vec2(5.176470588235294) * direction;\n  color += texture2D(image, uv) * 0.1964825501511404;\n  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;\n  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;\n  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;\n  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;\n  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;\n  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;\n  return color;\n}\n\n\n\nvoid main () {\n  gl_FragColor = blur13_1_0(t, uv, resolution, direction);\n}\n","name":"blur1D"}])
  },
  {
    name: "Test",
    data: {"shader":6,"width":600,"height":600,"premultipliedAlpha":false,"uniforms":{"t1":{"type":"fbo","id":2},"t2":{"type":"fbo","id":3}},"contextChildren":[{"shader":5,"width":64,"height":64,"premultipliedAlpha":false,"uniforms":{},"contextChildren":[],"children":[],"fboId":0}],"children":[{"shader":2,"width":300,"height":300,"premultipliedAlpha":false,"uniforms":{"t1":{"type":"content","id":0},"t2":{"type":"fbo","id":0}},"contextChildren":[],"children":[],"fboId":2},{"shader":6,"width":300,"height":300,"premultipliedAlpha":false,"uniforms":{"t1":{"type":"fbo","id":4},"t2":{"type":"fbo","id":5},"vertical":true},"contextChildren":[],"children":[{"shader":1,"width":200,"height":200,"premultipliedAlpha":false,"uniforms":{"direction":[2.8284271247461903,2.8284271247461903],"resolution":[200,200],"t":{"type":"fbo","id":6}},"contextChildren":[],"children":[{"shader":1,"width":200,"height":200,"premultipliedAlpha":false,"uniforms":{"direction":[0,3.3333333333333335],"resolution":[200,200],"t":{"type":"fbo","id":7}},"contextChildren":[],"children":[{"shader":1,"width":200,"height":200,"premultipliedAlpha":false,"uniforms":{"direction":[2.6666666666666665,0],"resolution":[200,200],"t":{"type":"fbo","id":8}},"contextChildren":[],"children":[{"shader":1,"width":200,"height":200,"premultipliedAlpha":false,"uniforms":{"direction":[1.4142135623730951,-1.4142135623730951],"resolution":[200,200],"t":{"type":"fbo","id":9}},"contextChildren":[],"children":[{"shader":1,"width":200,"height":200,"premultipliedAlpha":false,"uniforms":{"direction":[0.9428090415820634,0.9428090415820634],"resolution":[200,200],"t":{"type":"fbo","id":10}},"contextChildren":[],"children":[{"shader":1,"width":200,"height":200,"premultipliedAlpha":false,"uniforms":{"direction":[0,0.6666666666666666],"resolution":[200,200],"t":{"type":"uri","uri":"http://i.imgur.com/zJIxPEo.jpg","opts":{}}},"contextChildren":[],"children":[],"fboId":10}],"fboId":9}],"fboId":8}],"fboId":7}],"fboId":6}],"fboId":4},{"shader":1,"width":300,"height":150,"premultipliedAlpha":false,"uniforms":{"direction":[1,0],"resolution":[300,150],"t":{"type":"fbo","id":6}},"contextChildren":[],"children":[{"shader":1,"width":300,"height":150,"premultipliedAlpha":false,"uniforms":{"direction":[0.5303300858899107,-0.5303300858899107],"resolution":[300,150],"t":{"type":"fbo","id":7}},"contextChildren":[],"children":[{"shader":1,"width":300,"height":150,"premultipliedAlpha":false,"uniforms":{"direction":[0.3535533905932738,0.3535533905932738],"resolution":[300,150],"t":{"type":"fbo","id":8}},"contextChildren":[],"children":[{"shader":1,"width":300,"height":150,"premultipliedAlpha":false,"uniforms":{"direction":[0,0.25],"resolution":[300,150],"t":{"type":"fbo","id":9}},"contextChildren":[],"children":[{"shader":3,"width":300,"height":150,"premultipliedAlpha":false,"uniforms":{"t1":{"type":"fbo","id":10},"t2":{"type":"fbo","id":0}},"contextChildren":[],"children":[{"shader":4,"width":300,"height":150,"premultipliedAlpha":false,"uniforms":{"t1":{"type":"fbo","id":11},"t2":{"type":"content","id":0}},"contextChildren":[],"children":[{"shader":1,"width":200,"height":200,"premultipliedAlpha":false,"uniforms":{"direction":[2.8284271247461903,2.8284271247461903],"resolution":[200,200],"t":{"type":"fbo","id":12}},"contextChildren":[],"children":[{"shader":1,"width":200,"height":200,"premultipliedAlpha":false,"uniforms":{"direction":[0,3.3333333333333335],"resolution":[200,200],"t":{"type":"fbo","id":13}},"contextChildren":[],"children":[{"shader":1,"width":200,"height":200,"premultipliedAlpha":false,"uniforms":{"direction":[2.6666666666666665,0],"resolution":[200,200],"t":{"type":"fbo","id":14}},"contextChildren":[],"children":[{"shader":1,"width":200,"height":200,"premultipliedAlpha":false,"uniforms":{"direction":[1.4142135623730951,-1.4142135623730951],"resolution":[200,200],"t":{"type":"fbo","id":15}},"contextChildren":[],"children":[{"shader":1,"width":200,"height":200,"premultipliedAlpha":false,"uniforms":{"direction":[0.9428090415820634,0.9428090415820634],"resolution":[200,200],"t":{"type":"fbo","id":16}},"contextChildren":[],"children":[{"shader":1,"width":200,"height":200,"premultipliedAlpha":false,"uniforms":{"direction":[0,0.6666666666666666],"resolution":[200,200],"t":{"type":"uri","uri":"http://i.imgur.com/zJIxPEo.jpg","opts":{}}},"contextChildren":[],"children":[],"fboId":16}],"fboId":15}],"fboId":14}],"fboId":13}],"fboId":12}],"fboId":11}],"fboId":10}],"fboId":9}],"fboId":8}],"fboId":7}],"fboId":6}],"fboId":5}],"fboId":3}],"fboId":-1},
    contents: ["<div style=\"position:absolute;top:0;left:0;width:600px;height:600px;visibility:hidden;\"><canvas width=\"1600\" height=\"1600\" style=\"width:800px;height:800px;\"></canvas></div>"],
    Shaders: mockShaders([{"frag":"#define GLSLIFY 1\nprecision highp float;\nvarying vec2 uv;\nuniform sampler2D t;\nuniform vec2 resolution;\nuniform vec2 direction;\n\nvec4 blur13_1_0(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n  vec4 color = vec4(0.0);\n  vec2 off1 = vec2(1.411764705882353) * direction;\n  vec2 off2 = vec2(3.2941176470588234) * direction;\n  vec2 off3 = vec2(5.176470588235294) * direction;\n  color += texture2D(image, uv) * 0.1964825501511404;\n  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;\n  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;\n  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;\n  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;\n  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;\n  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;\n  return color;\n}\n\n\n\nvoid main () {\n  gl_FragColor = blur13_1_0(t, uv, resolution, direction);\n}\n","name":"blur1D"},{"frag":"#define GLSLIFY 1\nprecision highp float;\n\nvarying vec2 uv;\nuniform sampler2D t1;\nuniform sampler2D t2;\n\nvoid main () {\n  vec4 c1 = texture2D(t1, uv);\n  vec4 c2 = texture2D(t2, uv);\n  gl_FragColor = c1 + c2;\n}\n","name":"add"},{"frag":"#define GLSLIFY 1\nprecision highp float;\n\nvarying vec2 uv;\nuniform sampler2D t1;\nuniform sampler2D t2;\n\nvoid main () {\n  vec4 c1 = texture2D(t1, uv);\n  vec4 c2 = texture2D(t2, uv);\n  gl_FragColor = c1 * c2;\n}\n","name":"multiply"},{"frag":"#define GLSLIFY 1\nprecision highp float;\n\nvarying vec2 uv;\nuniform sampler2D t1;\nuniform sampler2D t2;\n\nvoid main () {\n  vec4 c1 = texture2D(t1, uv);\n  vec4 c2 = texture2D(t2, uv);\n  gl_FragColor = mix(c1, c2, c2.a);\n}\n","name":"layer"},{"frag":"\nprecision highp float;\nvarying vec2 uv; // This variable vary in all pixel position (normalized from vec2(0.0,0.0) to vec2(1.0,1.0))\n\nvoid main () { // This function is called FOR EACH PIXEL\n  gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0); // red vary over X, green vary over Y, blue is 50%, alpha is 100%.\n}\n    ","name":"helloGL"},{"frag":"#define GLSLIFY 1\nprecision highp float;\n\nvarying vec2 uv;\nuniform sampler2D t1;\nuniform sampler2D t2;\nuniform bool vertical;\n\nvoid main () {\n  float v = vertical ? 1.0 : 0.0;\n  vec2 p = uv * mix(vec2(2.0, 1.0), vec2(1.0, 2.0), v);\n  vec4 c1 = step(mix(p.x, p.y, v), 1.0) * texture2D(t1, p);\n  vec4 c2 = step(1.0, mix(p.x, p.y, v)) * texture2D(t2, p - vec2(1.0-v, v));\n  gl_FragColor = c1 + c2;\n}\n","name":"display2"},{"frag":"\nprecision highp float;\n\nvarying vec2 uv;\nuniform sampler2D t;\n\nvoid main () {\n  gl_FragColor = texture2D(t, uv);\n}\n","name":"Copy"},{"frag":"\nprecision highp float;\n\nvarying vec2 uv;\nuniform sampler2D t;\n\nvoid main () {\n  gl_FragColor = vec4(texture2D(t, uv).rgb, 0.0);\n}\n","name":"TransparentNonPremultiplied"}])
  },
];

class Demo extends Component {

  render () {
    const {} = this.props;
    return (
      <div>
        <h1>gl-react-inspector Demo</h1>
        {mocks.map((mock, i) => <div>
          <h2>{mock.name}</h2>
          <GlReactInspector.Tree {...mock} key={i} width={window.innerWidth-60} height={300} />
        </div>)}
      </div>
    );
  }
}

React.render(<Demo />, document.getElementById("demo"));
*/
