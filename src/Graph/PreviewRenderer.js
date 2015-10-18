var createTexture = require("gl-texture2d");
var createShader = require("gl-shader");
const imageCache = require("./imageCache");

class PreviewRenderer {
  constructor () {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 2;
    const opts = { preserveDrawingBuffer: true };
    const gl = canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts);
    const texture = createTexture(gl, [canvas.width, canvas.height]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0,
      1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
      1.0, -1.0,
      1.0,  1.0
    ]), gl.STATIC_DRAW);
    const copyShader = createShader(gl,  `
attribute vec2 _p;
varying vec2 uv;
void main() {
  gl_Position = vec4(_p,0.0,1.0);
  uv = vec2(0.5, 0.5) * (_p+vec2(1.0, 1.0));
}
`, `
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main () {
  vec4 c = texture2D(t, uv);
  gl_FragColor = c;
}`);
    copyShader.bind();
    copyShader.attributes._p.pointer();

    this.copyShader = copyShader;
    this.texture = texture;
    this.canvas = canvas;
    this.gl = gl;
  }
  setSize (newWidth, newHeight) {
    const { gl, canvas, texture } = this;
    if (gl.drawingBufferWidth === newWidth && gl.drawingBufferHeight === newHeight) return;
    texture.shape = [ newWidth, newHeight ];
    canvas.width = newWidth;
    canvas.height = newHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }
  getSizeForData (obj) {
    if (!obj) return { width: 0, height: 0 };
    if (typeof obj === "string") {
      const img = imageCache.get(obj);
      if (img) {
        const { width, height } = img;
        return { width, height };
      }
      return { width: 0, height: 0 };
    }
    const width = "videoWidth" in obj ? obj.videoWidth : "width" in obj ? obj.width : obj.shape && obj.shape[0];
    const height = "videoHeight" in obj ? obj.videoHeight : "height" in obj ? obj.height : obj.shape && obj.shape[1];
    return { width, height };
  }
  render (obj) {
    const { texture, gl, copyShader } = this;
    const { width, height } = this.getSizeForData(obj);
    if (!width || !height) {
      this.setSize(100, 100);
    }
    else {
      this.setSize(width, height);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !obj.data);
      texture.setPixels(obj);
    }
    copyShader.uniforms.t = texture.bind();
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  copyToCanvas2D (ctx) {
    const { canvas } = this;
    ctx.canvas.width = canvas.width;
    ctx.canvas.height = canvas.height;
    ctx.drawImage(canvas, 0, 0);
  }
}

module.exports = PreviewRenderer;
