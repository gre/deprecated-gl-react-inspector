precision highp float;
varying vec2 uv;

void main () {
  gl_FragColor = vec4(vec3(2.0 * distance(uv, vec2(0.5))), 1.0);
}
