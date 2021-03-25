precision mediump float;

uniform sampler2D samplerTex;

varying vec2 v_uv;
varying vec3 v_color;

void main() {
    vec3 colorTex = vec3(texture2D(samplerTex, v_uv));
    gl_FragColor = vec4(v_color * colorTex, 1.0);
}
