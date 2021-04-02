attribute vec3 a_Position;
attribute vec2 a_uv;
attribute vec3 a_normal;
attribute vec3 a_tangent;
attribute vec3 a_bitangent;

uniform mat4 u_Pmatrix;
uniform mat4 u_Mmatrix;
uniform mat4 u_Vmatrix;
uniform mat4 u_Nmatrix;
uniform vec3 u_source_direction;

varying vec2 v_uv;
varying vec3 v_LightDir;
varying vec3 v_ViewDir;
varying mat3 v_tbnMatrix;

void main() {

    v_uv = a_uv;

    // Normal
    vec3 norm = normalize((u_Nmatrix * vec4(a_normal, 1.0)).xyz);
    vec3 tang = normalize((u_Nmatrix * vec4(a_tangent, 1.0)).xyz);
    vec3 binormal = normalize((u_Nmatrix * vec4(a_bitangent, 1.0)).xyz);

    v_tbnMatrix = mat3(tang, binormal, norm);

    vec3 pos = (u_Vmatrix * u_Mmatrix * vec4(a_Position, 1.0)).xyz;

    v_LightDir = normalize(u_source_direction);
    v_ViewDir = normalize(-pos);

    gl_Position = u_Pmatrix*u_Vmatrix*u_Mmatrix*vec4(a_Position,1.0);

}
