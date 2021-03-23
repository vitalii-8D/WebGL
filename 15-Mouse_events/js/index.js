const InitWebGL = () => {
   let VSText, FSText;
   loadTextResource('shaders/vertexShader.glsl')
      .then(result => {
         VSText = result;
         return loadTextResource('shaders/fragmentShader.glsl')
      })
      .then(result => {
         FSText = result;
         return StartWebGL(VSText, FSText)
      })
      .catch(err => {
         alert('Error with loading resources. See console for details!')
         console.log(err);
      })
}

let context, gl, program;

const StartWebGL = (vertexShaderText, fragmentShaderText) => {

   context = document.getElementById('canvas').getContext('2d');

   // We draw on this fixed-size canvas
   bufferGL = document.createElement('canvas');
   gl = bufferGL.getContext('webgl');

   let button = document.getElementById('update')

   if (!gl) {
      alert('Your browser does not support WebGL')
      return false;
   }

   bufferGL.width = 800
   bufferGL.height = 800
   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
   resize();

   let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
   let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

   program = createProgram(gl, vertexShader, fragmentShader);

   let u_Pmatrix = gl.getUniformLocation(program, 'u_Pmatrix');
   let u_Vmatrix = gl.getUniformLocation(program, 'u_Vmatrix');
   let u_Mmatrix = gl.getUniformLocation(program, 'u_Mmatrix');

   let a_Position = gl.getAttribLocation(program, 'a_Position');
   let a_uv = gl.getAttribLocation(program, 'a_uv');

   let u_sampler = gl.getUniformLocation(program, 'sampler');
   // Определяем текстурный слот. 0 - номер текстурного слота. Может быть несколько слотов.
   gl.uniform1i(u_sampler, 0) // При рендере можем менять слот.

   gl.enableVertexAttribArray(a_Position)
   gl.enableVertexAttribArray(a_uv)

   let triangle_vertex = [
      -1, -1, -1, 0.0, 0.0,
      1, -1, -1, 1.0, 0.0,
      1, 1, -1, 1.0, 1.0,
      -1, 1, -1, 0.0, 1.0,

      -1, -1, 1, -0.5, -0.5,
      1, -1, 1, 1.5, -0.5,
      1, 1, 1, 1.5, 1.5,
      -1, 1, 1, -0.5, 1.5,

      -1, -1, -1, 0, 0,
      -1, 1, -1, 1, 0,
      -1, 1, 1, 1, 1,
      -1, -1, 1, 0, 1,

      1, -1, -1, 0, 0,
      1, 1, -1, 1, 0,
      1, 1, 1, 1, 1,
      1, -1, 1, 0, 1,

      -1, -1, -1, 0, 0,
      -1, -1, 1, 1, 0,
      1, -1, 1, 1, 1,
      1, -1, -1, 0, 1,

      -1, 1, -1, 0, 0,
      -1, 1, 1, 1, 0,
      1, 1, 1, 1, 1,
      1, 1, -1, 0, 1,
   ];

   let TRIANGLE_VERTEX = gl.createBuffer()
   gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), gl.STATIC_DRAW)

   let triangle_face = [
      0, 1, 2,
      0, 2, 3,

      4, 5, 6,
      4, 6, 7,

      8, 9, 10,
      8, 10, 11,

      12, 13, 14,
      12, 14, 15,

      16, 17, 18,
      16, 18, 19,

      20, 21, 22,
      20, 22, 23,
   ];

   let TRIANGLE_FACES = gl.createBuffer()
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_face), gl.STATIC_DRAW)

   // Не получилось
   let ground_vertex = [
      -3, -1.001, -3, 0, 0,
      -3, -1.001, 3, 1, 0,
      3, -1.001, 3, 1, 1,
      3, -1.001, -3, 0, 1,
   ]

   let GROUND_VERTEX = gl.createBuffer()
   gl.bindBuffer(gl.ARRAY_BUFFER, GROUND_VERTEX)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ground_vertex), gl.STATIC_DRAW)

   let ground_faces = [
      0, 1, 2,
      0, 2, 3
   ]
   let GROUND_FACES = gl.createBuffer()
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, GROUND_FACES)
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ground_faces), gl.STATIC_DRAW)

   gl.enable(gl.DEPTH_TEST);
   gl.depthFunc(gl.LEQUAL);
   gl.clearDepth(1.0);

   let texture = loadTexture(gl, "textures/box.jpg")
   let ground_texture = loadTexture(gl, "textures/texture.png")

   // ------ MATRIX

   let PROJMATRIX = mat4.perspective(40, gl.canvas.width / gl.canvas.height, 1, 200)
   let MODELMATRIX = mat4.create()
   let VIEWMATRIX = mat4.create()

   mat4.identity(MODELMATRIX)
   mat4.identity(VIEWMATRIX)
   mat4.lookAt([4.0, 3.0, 15.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], VIEWMATRIX)

   let MODELMATRIX_GROUND = mat4.create()
   mat4.identity(MODELMATRIX_GROUND)

   let old_time = 0;
   let dt = 0;

   gl.activeTexture(gl.TEXTURE0)

   // Controller
   const controller = new Controller()

   let animate = function (time) {
      dt = time - old_time;
      old_time = time;

      controller.checkFriction()

      //- ---- --  RENDER ---- ---------------
      gl.clearColor(0.7, 0.7, 0.7, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      mat4.rotateY(MODELMATRIX, controller.dX)
      mat4.rotateX(MODELMATRIX, controller.dY)
      mat4.translate(MODELMATRIX, controller.transVec)

      gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX)
      gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX)
      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX)


      if (texture.webGLtexture) {
         gl.bindTexture(gl.TEXTURE_2D, texture.webGLtexture)
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * 5, 0)
      gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 4 * 5, 4 * 3)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
      gl.drawElements(gl.TRIANGLES, triangle_face.length, gl.UNSIGNED_SHORT, 0)


      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX_GROUND)

      // GROUND
      if (ground_texture.webGLtexture) {
         gl.bindTexture(gl.TEXTURE_2D, ground_texture.webGLtexture)
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, GROUND_VERTEX)
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * 5, 0)
      gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 4 * 5, 4 * 3)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, GROUND_FACES)
      gl.drawElements(gl.TRIANGLES, ground_faces.length, gl.UNSIGNED_SHORT, 0)

      gl.flush();

      render();
      window.requestAnimationFrame(animate)
   }

   window.requestAnimationFrame(time => animate(time))
}

function resize(e) {
   const windowWidth = document.documentElement.clientWidth;
   const windowHeight = document.documentElement.clientHeight;
   const sideSize = windowWidth < windowHeight ? windowWidth : windowHeight;
   canvas.width = canvas.height = sideSize;
}

function render() {
   context.drawImage(
      gl.canvas,
      0, 0, gl.canvas.width, gl.canvas.height,
      0, 0, context.canvas.width, context.canvas.height)
}

window.addEventListener('resize', resize);
document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
}, {once: true})
