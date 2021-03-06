attribute vec2 vertexPosition;

varying vec3 fragColor;

void main() {
    fragColor = vec3(vertexPosition, 0.3);
    gl_Position = vec4(vertexPosition, 0, 1);
    gl_PointSize = 3.0;
}
