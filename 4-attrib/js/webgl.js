const InitWebGL = function () {
   let VSText, FSText;
   loadTextResource('shaders/vertexShader.glsl')
      .then(result => {
         VSText = result;
         return loadTextResource('shaders/fragmentShader.glsl')
      })
      .then(function (result) {
         FSText = result;
         // послу загрузки текста шейдеров передаем их в програму
         return StartWebGL(VSText, FSText);
      })
      .catch(err => {
         alert('Errar with loading resources. See console for details!')
         console.log(err);
      })
}

let gl, program;

const StartWebGL = function (vertexShaderText, fragmentShaderText) {
   let canvas = document.getElementById('example-canvas')
   gl = canvas.getContext('webgl')

   if (!gl) {
      alert('Your browser does not support WebGL')
      return;
   }

   canvas.width = gl.canvas.clientWidth
   canvas.height = gl.canvas.clientHeight

   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

   let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText)
   let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText)

   program = createProgram(gl, vertexShader, fragmentShader)

   draw()
}

let draw = function () {

   // Достаем аттрибут для позиции
   let a_Position = gl.getAttribLocation(program, 'a_Position')
   let a_PointSize = gl.getAttribLocation(program, 'a_PointSize')

   // Передаем атрибут шейдеру
   gl.vertexAttrib1f(a_PointSize, 50.0)
   gl.vertexAttrib3f(a_Position, -0.5, -0.5, -0.4)

   gl.clearColor(0.75, 0.9, 1.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT)

   gl.useProgram(program)
   gl.drawArrays(gl.POINTS, 0, 1)
}

document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
})
