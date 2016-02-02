const React = require("react");
const GL = require("gl-react");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  inverse: {
    frag: glslify(`${__dirname}/inverse.frag`)
  }
});

module.exports = GL.createComponent(
  ({ children: t }) => <GL.Node shader={shaders.inverse} uniforms={{ t }} />
, { displayName: "Inverse" });
