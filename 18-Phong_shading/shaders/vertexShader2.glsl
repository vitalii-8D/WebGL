attribute vec3 a_Position;
attribute vec2 a_uv;
attribute vec3 a_normal;

uniform mat4 u_Pmatrix;
uniform mat4 u_Mmatrix;
uniform mat4 u_Vmatrix;
uniform mat4 u_Nmatrix;

varying vec2 v_uv;
varying vec3 v_color;
varying vec3 v_normal;
varying vec3 v_vertPos;

void main() {

    v_uv = a_uv;

    vec3 N = normalize(a_normal);
    v_normal  = (u_Nmatrix * vec4(a_normal,1.0)).xyz;

    vec3 v_vertPos = (u_Vmatrix * u_Mmatrix*vec4(a_Position,1.0)).xyz;

    gl_Position = u_Pmatrix*u_Vmatrix*u_Mmatrix*vec4(a_Position,1.0);

}
