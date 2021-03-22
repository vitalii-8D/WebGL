precision mediump float;

uniform vec4 u_FragColor;
uniform sampler2D sampler1;
uniform sampler2D sampler2;

varying vec2 v_uv;

void main() {
    vec4 color1 = texture2D(sampler1, v_uv);
    vec4 color2 = texture2D(sampler2, v_uv);
    gl_FragColor = color1 * color2;
}
