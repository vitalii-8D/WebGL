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
   // canvas.width = 400
   canvas.height = gl.canvas.clientHeight
   // canvas.height = 400

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
         -0.3, -0.3, 1.5,  1.0, 0.0, 0.0,
         -0.3,  0.3, 1.5,  1.0, 0.0, 0.0,
          0.3,  0.3, 1.5,  1.0, 0.0, 0.0,
          0.3, -0.3, 1.5,  1.0, 0.0, 0.0,

         -0.3, -0.3, 0.6,  0.0, 1.0, 0.0,
         -0.3,  0.3, 0.6,  0.0, 1.0, 0.0,
         0.3,  0.3, 0.6,   0.0, 1.0, 0.0,
         0.3, -0.3, 0.6,   0.0, 1.0, 0.0,

         -0.3, -0.3, 0.0,  0.0, 0.0, 1.0,
         -0.3,  0.3, 0.0,  0.0, 0.0, 1.0,
         0.3,  0.3, 0.0,   0.0, 0.0, 1.0,
         0.3, -0.3, 0.0,   0.0, 0.0, 1.0,

         0.4,  0.4, 2.5,  1.0, 1.0, 0.0,
         1.0,  0.4, 2.5,  1.0, 1.0, 0.0,
         1.0,  1.0, 2.5,  1.0, 1.0, 0.0,
         0.4,  1.0, 2.5,  1.0, 1.0, 0.0
      ]

   let vertexBuffer = gl.createBuffer()
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), gl.STATIC_DRAW)

   let triangle_face = [
      0, 1, 2, 0, 2, 3,
      4, 5, 6, 4, 6, 7,
      8, 9, 10, 8, 10, 11,
      12, 13, 14, 12, 14, 15
   ]

   let vertexFaces = gl.createBuffer()
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexFaces)
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_face), gl.STATIC_DRAW)

   // ---  MOUSE EVENTS   --- //
   let drag = false;
   let old_x; let old_y;
   let rot_x = 0; let rot_y = 0;

   // var PROJMATRIX = mat4.perspective(80, canvas.width / canvas.height, 1, 20);
   let PROJMATRIX = mat4.ortho(-3.0, 3.0, -3.0, 3.0, 1.0, 20.0)
   let VIEWMATRIX = mat4.create()
   let MODELMATRIX = mat4.create()

   gl.enable(gl.DEPTH_TEST)

   let anitate = function (time) {

      // --------------//

      mat4.identity(MODELMATRIX)
      mat4.identity(VIEWMATRIX)

      // Simple matrix
      mat4.translate(VIEWMATRIX, [0.0, 0.0, -5])

      // Look At matrix
      // var VIEWMATRIX_eye = mat4.create();
      // mat4.identity(VIEWMATRIX_eye);
      // mat4.translate(VIEWMATRIX_eye, [0.0, 0.0, 0.0]);
      //
      // var eye = vec3.create([0.0, 0.0, 5.0]);
      //
      // eye = mat4.multiplyVec3(VIEWMATRIX_eye, eye);
      //
      // var center = vec3.create([-1.0, -1.0, 0.0]);
      // var up = vec3.create([0.0, 1.0, 0.0]);
      // VIEWMATRIX = mat4.lookAt(eye, center, up);

      // Mouse rotation
      mat4.rotateY(VIEWMATRIX, -rot_x)
      mat4.rotateX(VIEWMATRIX, -rot_y)


      gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT)
      gl.clearColor(0.7, 0.7, 0.7, 1.0);

      // ------   Minutes  --------- \\
      mat4.translate(MODELMATRIX, [0.0, 0.0, 0.0])
      mat4.scale(MODELMATRIX, [1.0, 1.0, 1.0])

      gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX)
      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX)
      gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX)

      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * 6, 0)
      gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 4 * 6, 3 * 4)

      gl.drawElements(gl.TRIANGLES, 24, gl.UNSIGNED_SHORT, 0)


      window.requestAnimationFrame(anitate)
   }

   anitate(0)


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

      rot_x += newX * 2 * Math.PI / canvas.width;
      rot_y += newY * 2 * Math.PI / canvas.height;

      old_x = e.pageX
      old_y = e.pageY

      e.preventDefault()
   }

   canvas.addEventListener('mousedown', mouseDown, false)
   canvas.addEventListener('mouseup', mouseUp, false)
   canvas.addEventListener('mouseout', mouseUp, false)
   canvas.addEventListener('mousemove', mouseMove, false)
}


document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
})
