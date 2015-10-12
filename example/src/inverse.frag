precision highp float;
varying vec2 uv;

uniform sampler2D t;

void main () {
  vec4 c = texture2D(t, uv);
  gl_FragColor = vec4(1.0 - c.rgb, c.a);
}
