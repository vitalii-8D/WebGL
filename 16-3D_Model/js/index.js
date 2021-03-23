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
   gl.uniform1i(u_sampler, 0)

   gl.enableVertexAttribArray(a_Position)
   gl.enableVertexAttribArray(a_uv)

   // let TRIANGLE_VERTEX = getVertexCube(gl)
   // let TRIANGLE_FACES = getFacesCube(gl)
   // let GROUND_VERTEX = getVertexGround(gl)
   // let GROUND_FACES = getFacesGround(gl)

   // **********   MODEL   ************
   let ModelVertices, ModelIndices, ModelTexCoords, ModelNormal, TRIANGLE_VERTEX, TRIANGLE_UV, TRIANGLE_FACES;

   loadTextResource('models/teapot.json')
      .then(model => JSON.parse(model))
      .then(model => {
         ModelVertices = model.meshes[1].vertices
         ModelIndices = [].concat.apply([], model.meshes[1].faces)
         ModelTexCoords = model.meshes[1].texturecoords[0]
         ModelNormal = model.meshes[1].normals
         console.log(ModelVertices);
         console.log(ModelIndices);
         console.log(ModelTexCoords);

         TRIANGLE_VERTEX = gl.createBuffer()
         gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelVertices), gl.STATIC_DRAW)

         TRIANGLE_UV = gl.createBuffer()
         gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_UV)
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelTexCoords), gl.STATIC_DRAW)

         TRIANGLE_FACES = gl.createBuffer()
         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
         gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ModelIndices), gl.STATIC_DRAW)

         gl.model = model
      })

   gl.enable(gl.DEPTH_TEST);
   gl.depthFunc(gl.LEQUAL);
   gl.clearDepth(1.0);

   let texture = loadTexture(gl, "textures/box.jpg")

   // ------ MATRIX

   let PROJMATRIX = mat4.perspective(40, gl.canvas.width / gl.canvas.height, 1, 200)
   let MODELMATRIX = mat4.create()
   let VIEWMATRIX = mat4.create()

   mat4.identity(MODELMATRIX)
   mat4.identity(VIEWMATRIX)
   mat4.lookAt([4.0, 3.0, 20.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], VIEWMATRIX)

   let old_time = 0;
   let dt = 0;

   // Controller
   const controller = new Controller()

   let animate = function (time) {
      dt = time - old_time;
      old_time = time;

      window.requestAnimationFrame(animate)

      if (!gl.model) return false;

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
         gl.activeTexture(gl.TEXTURE0)
         gl.bindTexture(gl.TEXTURE_2D, texture.webGLtexture)
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * 3, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_UV)
      gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 4 * 2, 0)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
      gl.drawElements(gl.TRIANGLES, ModelIndices.length, gl.UNSIGNED_SHORT, 0)

      gl.flush();

      render();
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
