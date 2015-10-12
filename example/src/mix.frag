precision highp float;
varying vec2 uv;

uniform sampler2D m;
uniform sampler2D t1;
uniform sampler2D t2;

void main () {
  gl_FragColor = mix(
    texture2D(t1, uv),
    texture2D(t2, uv),
    texture2D(m, uv).r);
}
