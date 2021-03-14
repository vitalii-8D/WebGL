attribute vec2 a_Position;
attribute vec3 a_Color;

uniform mat4 u_Pmatrix;
uniform mat4 u_Mmatrix;
uniform mat4 u_Vmatrix;

varying vec3 v_Color;

void main() {
    v_Color = a_Color;
    gl_Position = u_Pmatrix * u_Vmatrix * u_Mmatrix * vec4(a_Position, 0.0, 1.0);
}
