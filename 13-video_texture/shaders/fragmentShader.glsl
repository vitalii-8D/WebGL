precision mediump float;

uniform vec4 u_FragColor;
uniform sampler2D sampler;

varying vec2 v_uv;

void main() {
    gl_FragColor = texture2D(sampler, v_uv);;
}
