const React = require("react");
const GL = require("gl-react");
const Mix = require("./Mix");
const Gradient = require("./Gradient");
const Blur = require("./Blur");
const HueRotate = require("./HueRotate");
const Inverse = require("./Inverse");

const img1 = "http://i.imgur.com/CKlmtPs.jpg";
const img2 = "http://i.imgur.com/vGXYiYy.jpg";

module.exports = GL.createComponent(
  ({ width, height }) =>
  <Mix ref="mix" width={width} height={height}
    m={
      <Inverse width={64} height={64}>
        <Gradient />
      </Inverse>
    }>
    <Blur passes={4} factor={2} width={width} height={height}>
      {img1}
    </Blur>
    <HueRotate hue={3}>
      {img2}
    </HueRotate>
  </Mix>
  , { displayName: "Example1" });
