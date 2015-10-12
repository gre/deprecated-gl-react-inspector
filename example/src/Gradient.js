const React = require("react");
const GL = require("gl-react");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  gradient: {
    frag: glslify(`${__dirname}/gradient.frag`)
  }
});

module.exports = GL.createComponent(
  props => <GL.View {...props} shader={shaders.gradient} />
  , { displayName: "Gradient" });
