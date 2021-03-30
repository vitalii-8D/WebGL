precision highp float;

uniform sampler2D sampler;
uniform vec2 u_texSize;

varying vec2 v_uv;

void main() {
    gl_FragColor = texture2D(sampler, v_uv);
}
