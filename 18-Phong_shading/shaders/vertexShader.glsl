attribute vec3 a_Position;
attribute vec2 a_uv;
attribute vec3 a_normal;

uniform mat4 u_Pmatrix;
uniform mat4 u_Vmatrix;
uniform mat4 u_Mmatrix;
uniform mat4 u_Nmatrix;

uniform vec3 u_source_direction;
uniform vec3 u_view_direction;
uniform float u_shininess;

varying vec2 v_uv;
varying vec3 v_color;

const vec3 source_diffuse_color = vec3(1.0, 1.0, 1.0);
const vec3 source_ambient_color = vec3(0.2, 0.2, 0.2);
const vec3 source_specular_color = vec3(1.0, 1.0, 1.0);

void main() {
    v_uv = a_uv;

    vec3 N = normalize(a_normal);
         N = (u_Nmatrix * vec4(a_normal, 1.0)).xyz;

    vec3 vertPos = (u_Vmatrix * u_Mmatrix * vec4(a_Position, 1.0)).xyz;
    vec3 lightDir = normalize(u_source_direction - vertPos);

    vec3 L = normalize(lightDir);
    vec3 V = normalize(u_view_direction);
    vec3 R = normalize(reflect(-L, N));

    float S = dot(V,R);
    S = clamp(S, 0.1, 1.0);
    S = pow(S, u_shininess);

    vec3 color = (S * source_specular_color) + source_ambient_color + source_diffuse_color * max(0.0, dot(N,L));

    v_color = color;

    gl_Position = u_Pmatrix * u_Vmatrix * u_Mmatrix * vec4(a_Position, 1.0);
}
