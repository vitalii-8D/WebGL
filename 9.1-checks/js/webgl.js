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
   // canvas.width = 700
   canvas.height = gl.canvas.clientHeight
   // canvas.height = 700

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

   let u_Transparency = gl.getUniformLocation(program, 'u_Transparency')

   let vertex_data =
      [  // Lines
         1, 0, 0,     1.0, 0.0, 0.0,
         -1, 0, 0,    1.0, 0.0, 0.0,
         0, 1, 0,     0.0, 1.0, 0.0,
         0, -1, 0,    0.0, 1.0, 0.0,
         0, 0, 1,     0.0, 0.0, 1.0,
         0, 0, -1,    0.0, 0.0, 1.0,
         // Square
         0.5, 0, 0,     0.0, 0.0, 1.0,
         0, 0.5, 0,     0.0, 0.0, 1.0,
         -0.5, 0, 0,    0.0, 0.0, 1.0,
         0, -0.5, 0,    0.0, 0.0, 1.0,

         0.5, 0, 0,     0.0, 1.0, 0.0,
         0, 0, 0.5,     0.0, 1.0, 0.0,
         -0.5, 0, 0,    0.0, 1.0, 0.0,
         0, 0, -0.5,    0.0, 1.0, 0.0,

         0, 0.5, 0,     1.0, 0.0, 0.0,
         0, 0, 0.5,     1.0, 0.0, 0.0,
         0, -0.5, 0,    1.0, 0.0, 0.0,
         0, 0, -0.5,    1.0, 0.0, 0.0,
      ]

   let vertexBuffer = gl.createBuffer()
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_data), gl.STATIC_DRAW)


   let PROJMATRIX = mat4.perspective(25, canvas.width / canvas.height, 0.1, 100)
   let VIEWMATRIX = mat4.create()
   let MODELMATRIX = mat4.create()

   let animate = function (time) {

      // --------------//

      mat4.identity(MODELMATRIX)
      mat4.identity(VIEWMATRIX)


      // ---- VIEW  ---- //
      mat4.translate(VIEWMATRIX, [-0.5, -0.5, -7.0])
      mat4.rotateX(VIEWMATRIX, -rot_y)
      mat4.rotateY(VIEWMATRIX, -rot_x)
      // mat4.rotateZ(VIEWMATRIX, 180 / 180 * Math.PI)

      gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX)
      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX)
      gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX)

      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * 6, 0)
      gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 4 * 6, 3 * 4)


      gl.clearColor(0.5, 0.5, 0.5, 0.8);
      gl.enable(gl.DEPTH_TEST)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      // Draw coordinates
      gl.uniform1f(u_Transparency, 1.0)
      gl.drawArrays(gl.LINES, 0, 6)

      // ------   MODELMATRIX  --------- \\
      mat4.translate(MODELMATRIX, [0.5, 0.5, 0.5])
      mat4.rotateY(MODELMATRIX, 0 / 180 * Math.PI)
      mat4.scale(MODELMATRIX, [1.0, 1.0, 1.0])


      gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX)
      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX)
      gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX)

      gl.uniform1f(u_Transparency, 0.5)
      gl.drawArrays(gl.TRIANGLE_FAN, 6, 4)
      gl.drawArrays(gl.TRIANGLE_FAN, 10, 4)
      gl.drawArrays(gl.TRIANGLE_FAN, 14, 4)


      window.requestAnimationFrame(animate)
   }

   // ---  MOUSE EVENTS   --- //
   let drag = false;
   let old_x; let old_y;
   let rot_x = 0; let rot_y = 0;

   let mouseDown = function (e) {
      drag = true;
      old_x = e.pageX;
      old_y = e.pageY;
      e.preventDefault();
   }
   let mouseUp = function (e) {
      drag = false;
      e.preventDefault();
   }
   let mouseMove = function (e) {
      if (!drag) {
         return false;
      }

      let newX = old_x - e.pageX;
      let newY = old_y - e.pageY;

      rot_x += newX * 2 * Math.PI / canvas.width / 1.5;
      rot_y += newY * 2 * Math.PI / canvas.height / 1.5;

      old_x = e.pageX
      old_y = e.pageY

      e.preventDefault()
   }

   canvas.addEventListener('mousedown', mouseDown, false)
   canvas.addEventListener('mouseup', mouseUp, false)
   canvas.addEventListener('mouseout', mouseUp, false)
   canvas.addEventListener('mousemove', mouseMove, false)

   animate(0)
}


// document.addEventListener('keydown', (e) => {
//    if (e.keyCode === 32) {
//       let pMatrix = [], vMatrix = [], mMatrix = [];
//       for (let i = 0; i < 16; i++) {
//          if (i % 4 === 0) {
//             pMatrix.push([])
//             vMatrix.push([])
//             mMatrix.push([])
//          }
//          pMatrix[Math.floor(i / 4)].push(PROJMATRIX[i])
//          vMatrix[Math.floor(i / 4)].push(VIEWMATRIX[i])
//          mMatrix[Math.floor(i / 4)].push(MODELMATRIX[i])
//       }
//       console.log('PROJMATRIX  ', pMatrix);
//       console.log('VIEWMATRIX  ', vMatrix);
//       console.log('MODELMATRIX  ', mMatrix);
//    }
// })

document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
})
