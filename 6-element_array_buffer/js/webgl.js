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
   gl.useProgram(program)

   let a_Position = gl.getAttribLocation(program, 'a_Position')
   let a_Color = gl.getAttribLocation(program, 'a_Color')

   gl.enableVertexAttribArray(a_Position)
   gl.enableVertexAttribArray(a_Color)

   let triangle_vertex =
      [
         -0.5, -0.5,   1.0, 0.0, 0.0,
         -0.5,  0.5,   0.0, 1.0, 0.0,
          0.5,  0.5,   0.0, 0.0, 1.0,
          0.5, -0.5,   0.0, 1.0, 0.0
      ]

   let vertexBuffer = gl.createBuffer()
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), gl.STATIC_DRAW)

   let triangle_face = [0,1,2,0,2,3]

   let vertexFaces = gl.createBuffer()
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexFaces)
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_face), gl.STATIC_DRAW)


   gl.clearColor(0.5, 0.5, 0.5, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT)

   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4 * 5, 0)
   gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 4 * 5, 2 * 4)

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexFaces)
   gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
   gl.flush()
}


document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
})
