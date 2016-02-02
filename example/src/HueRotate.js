const React = require("react");
const GL = require("gl-react");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  hueRotate: {
    frag: glslify(`${__dirname}/hueRotate.frag`)
  }
});

module.exports = GL.createComponent(
  ({ hue, children: tex }) =>
  <GL.Node
    shader={shaders.hueRotate}
    uniforms={{ hue, tex }}
  />,
  { displayName: "HueRotate"});
