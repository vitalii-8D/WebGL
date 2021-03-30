precision highp float;

uniform sampler2D u_tex;
uniform vec2 u_textureSize;

varying vec2 v_uv;

void main() {
    gl_FragColor = texture2D(u_tex, v_uv);
}
