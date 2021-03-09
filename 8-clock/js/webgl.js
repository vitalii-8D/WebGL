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

   // canvas.width = gl.canvas.clientWidth
   canvas.width = 400
   // canvas.height = gl.canvas.clientHeight
   canvas.height = 400

   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

   let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText)
   let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText)

   program = createProgram(gl, vertexShader, fragmentShader)
   gl.useProgram(program)

   let u_Pmatrix = gl.getUniformLocation(program, 'u_Pmatrix')
   let u_Mmatrix = gl.getUniformLocation(program, 'u_Mmatrix')
   let u_Vmatrix = gl.getUniformLocation(program, 'u_Vmatrix')

   let a_Position = gl.getAttribLocation(program, 'a_Position')
   let a_Color = gl.getAttribLocation(program, 'a_Color')

   gl.enableVertexAttribArray(a_Position)
   gl.enableVertexAttribArray(a_Color)

   let triangle_vertex =
      [
         -0.5, -0.5, 1.0, 0.0, 0.0,
         -0.5, 0.5, 0.0, 1.0, 0.0,
         0.5, 0.5, 0.0, 0.0, 1.0,
         0.5, -0.5, 0.0, 1.0, 0.0
      ]

   let vertexBuffer = gl.createBuffer()
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), gl.STATIC_DRAW)

   let triangle_face = [0, 1, 2, 0, 2, 3]

   let vertexFaces = gl.createBuffer()
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexFaces)
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_face), gl.STATIC_DRAW)

   let PROJMATRIX = mat4.perspective([], 40, canvas.width / canvas.height, 1, 100)
   let VIEWMATRIX = mat4.create()
   let MODELMATRIX = mat4.create()

   let anitate = function (time) {

      // CLOCK
      let d = new Date()
      let Seconds = d.getSeconds()
      let Minutes = d.getMinutes()
      let Hours = d.getHours()

      let ANGLE_STEP = -6.0 / 180 * Math.PI

      if (Hours > 12) {
         Hours = Hours - 12
      }

      let AngleSeconds = Seconds * ANGLE_STEP
      let AngleMinutes = Minutes * ANGLE_STEP
      let AngleHours = Hours * ANGLE_STEP * 5 + (Minutes * ANGLE_STEP / 12)

      // --------------//

      mat4.identity(MODELMATRIX)
      mat4.identity(VIEWMATRIX)

      // ------   Minutes  --------- \\

      mat4.translate(VIEWMATRIX, VIEWMATRIX, [0.0, 0.0, -2.0])
      mat4.rotateZ(MODELMATRIX, MODELMATRIX, AngleMinutes)
      mat4.translate(MODELMATRIX, MODELMATRIX, [0.0, 1.0, 0.0])
      mat4.scale(MODELMATRIX, MODELMATRIX, [0.15, 3.8, 1.0])

      gl.clearColor(0.5, 0.5, 0.5, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

      gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX)
      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX)
      gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX)

      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4 * 5, 0)
      gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 4 * 5, 2 * 4)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexFaces)
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)

      // ------   Hours  --------- \\
      mat4.identity(MODELMATRIX)

      mat4.rotateZ(MODELMATRIX, MODELMATRIX, AngleHours)
      mat4.translate(MODELMATRIX, MODELMATRIX, [0.0, 1.3, 0.0])
      mat4.scale(MODELMATRIX, MODELMATRIX, [0.2, 3.8, 1.0])

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

      gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX)
      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX)
      gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX)

      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4 * 5, 0)
      gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 4 * 5, 2 * 4)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexFaces)
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)

      // ------   Seconds  --------- \\
      mat4.identity(MODELMATRIX)

      mat4.rotateZ(MODELMATRIX, MODELMATRIX, AngleSeconds)
      mat4.translate(MODELMATRIX, MODELMATRIX, [0.0, 1.6, 0.0])
      mat4.scale(MODELMATRIX, MODELMATRIX, [0.1, 4.8, 1.0])

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

      gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX)
      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX)
      gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX)

      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4 * 5, 0)
      gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 4 * 5, 2 * 4)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexFaces)
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)

      // FACE
      let AngeleFace = 0
      for (let i = 0; i <= 12; i++) {
         AngeleFace = (i * ANGLE_STEP * 5.0)
         mat4.identity(MODELMATRIX);
         mat4.rotateZ(MODELMATRIX, MODELMATRIX, AngeleFace)
         mat4.translate(MODELMATRIX, MODELMATRIX, [0.0, 3.2, 0.0])

         if (i % 3 == 0) {
            mat4.scale(MODELMATRIX, MODELMATRIX, [0.15, 0.5, 1.0])
         } else {
            mat4.scale(MODELMATRIX, MODELMATRIX, [0.1, 0.3, 1.0])
         }

         gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
         gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX)
         gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX)
         gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX)

         gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4 * 5, 0)
         gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 4 * 5, 2 * 4)

         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexFaces)
         gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
      }

      window.requestAnimationFrame(anitate)
   }

   anitate(0)
}


document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
})
