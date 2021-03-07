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

   let a_Position = gl.getAttribLocation(program, 'a_Position')
   let a_PointSize = gl.getAttribLocation(program, 'a_PointSize')

   // Передаем атрибут шейдеру
   gl.vertexAttrib1f(a_PointSize, 5.0)
   gl.vertexAttrib3f(a_Position, -0.5, -0.5, -0.4)

   // Достаем uniform-переменную и назначаем её
   let u_FragColor = gl.getUniformLocation(program, 'u_FragColor')
   gl.uniform4f(u_FragColor, 0.9, 0.5, 0.0, 1.0)

   gl.clearColor(0.75, 0.9, 1.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT)

   // ***--- MOUSE ---*** //
   let mouseClicked = false;
   canvas.onmousedown = function () {
      mouseClicked = true
   }
   canvas.onmouseup = function () {
      mouseClicked = false
   }
   canvas.onmousemove = function (ev) {
      if (!mouseClicked) return;
      click(ev, gl, canvas, a_Position)
   }

   let g_points = []

   function click(ev, gl, canvas, a_Position) {
      let x = ev.clientX
      let y = ev.clientY

      let rect = ev.target.getBoundingClientRect()

      x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2)
      y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2)

      g_points.push(x)
      g_points.push(y)

      gl.clear(gl.COLOR_BUFFER_BIT)

      let len = g_points.length

      for (i = 0; i < len; i+=2) {
         gl.vertexAttrib3f(a_Position, g_points[i], g_points[i+1], 0.0)
         gl.uniform4f(u_FragColor, 0.9, 0.5, 0.0, 1.0)
         gl.drawArrays(gl.POINTS, 0, 1)
      }
   }

   gl.useProgram(program)
}


document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
})
