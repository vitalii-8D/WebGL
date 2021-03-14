precision mediump float;
uniform float u_Transparency;

varying vec3 v_Color;

void main() {
    gl_FragColor = vec4(v_Color, u_Transparency);
}
