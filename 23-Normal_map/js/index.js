const InitWebGL = (e) => {
   let VSText, FSText;
   loadTextResource(`shaders/vertexShader.glsl`)
      .then(result => {
         VSText = result;
         return loadTextResource(`shaders/fragmentShader.glsl`)
      })
      .then(result => {
         FSText = result;
         StartWebGL(VSText, FSText);
      })
      .catch(err => {
         alert('Error with loading resources. See console for details!')
         console.log(err);
      })
}

let context, gl;

const StartWebGL = (VSText, FSText) => {

   context = document.getElementById('canvas').getContext('2d');

   bufferGL = document.createElement('canvas');
   gl = bufferGL.getContext('webgl');

   if (!gl) {
      alert('Your browser does not support WebGL')
      return false;
   }

   bufferGL.width = 1000
   bufferGL.height = 1000
   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
   resize();

   // Math in the Vertex shader
   let vertexShader = createShader(gl, gl.VERTEX_SHADER, VSText, 'V');
   let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FSText, 'F');

   let shaderProgram = createProgram(gl, vertexShader, fragmentShader);

   let u_Pmatrix = gl.getUniformLocation(shaderProgram, 'u_Pmatrix');
   let u_Mmatrix = gl.getUniformLocation(shaderProgram, 'u_Mmatrix');
   let u_Vmatrix = gl.getUniformLocation(shaderProgram, 'u_Vmatrix');
   let u_Nmatrix = gl.getUniformLocation(shaderProgram, 'u_Nmatrix');
   let u_source_direction = gl.getUniformLocation(shaderProgram, 'u_source_direction');
   // let u_view_direction = gl.getUniformLocation(shaderProgram, 'u_view_direction');
   let u_shininess = gl.getUniformLocation(shaderProgram, 'u_shininess');

   let a_Position = gl.getAttribLocation(shaderProgram, 'a_Position');
   let a_uv = gl.getAttribLocation(shaderProgram, 'a_uv');
   let a_normal = gl.getAttribLocation(shaderProgram, 'a_normal');
   let a_tangent = gl.getAttribLocation(shaderProgram, 'a_tangent');
   let a_bitangent = gl.getAttribLocation(shaderProgram, 'a_bitangent');

   let u_sampler = gl.getUniformLocation(shaderProgram, 'samplerTex');
   let u_samplerNormalMap = gl.getUniformLocation(shaderProgram, 'samplerNormalMap');
   let u_samplerSpecularMap = gl.getUniformLocation(shaderProgram, 'samplerSpecularMap');

   let u_diffuse = gl.getUniformLocation(shaderProgram, 'u_diffuse');
   let u_normalPower = gl.getUniformLocation(shaderProgram, 'u_normalPower');

   gl.useProgram(shaderProgram);

   gl.uniform1i(u_sampler, 0);
   gl.uniform1i(u_samplerNormalMap, 1);
   gl.uniform1i(u_samplerSpecularMap, 2);

   let gui = myGUI();
   let MouseContr = new MouseController(context);


   // *******  Create Textures  ****
   let tex = loadTexture(gl, 'textures/tex2_DIFFUSE.jpg')
   let tex_normal = loadTexture(gl, 'textures/tex2_NORMAL.jpg')
   let tex_spec = loadTexture(gl, 'textures/tex2_SPECULAR.jpg')

   // **********   MODEL   ************
   let ModelMain;

   loadTextResource('models/sphere.json')
      .then(model => JSON.parse(model))
      .then(model => {
         ModelMain = loadBuffer(gl, model.meshes[0]);

         gl.model = model
         window.requestAnimationFrame(time => animate(time))
      })

   // ************ Create MATRIX   ************

   let PROJMATRIX = glMatrix.mat4.create();
   glMatrix.mat4.identity(PROJMATRIX);
   let fovy = 40 * Math.PI / 180;
   glMatrix.mat4.perspective(PROJMATRIX, fovy, gl.canvas.width / gl.canvas.height, 1, 100);

   let MODELMATRIX = glMatrix.mat4.create();
   let VIEWMATRIX = glMatrix.mat4.create();
   let VIEWMATRIX_CAMERA = glMatrix.mat4.create();

   let NORMALMATRIX = glMatrix.mat4.create();
   let NORMALMATRIX_HELPER = glMatrix.mat4.create();

   let camera = new Camera(gl, '')
   let CAMERA_Controller = new CameraController(camera, gui)

   //  **** NORMAL ***
   let shaderProgram_Normal = loadNormalShaders(gl)

   // **** AXIS ***
   let shaderProgram_Axis = loadAxisShaders(gl)

   // **** RENDER  ***
   gl.enable(gl.DEPTH_TEST);
   gl.depthFunc(gl.LEQUAL);
   gl.clearDepth(1.0);

   let Z = 0;
   let AMORTIZATION = 0.8;
   let x = 0.0;

   function animate(time) {
      CAMERA_Controller.updateMatrix()

      //---------- translate  --------------------------------------------//
      MouseContr.dX *= AMORTIZATION;
      MouseContr.dY *= AMORTIZATION;
      MouseContr.theta += MouseContr.dX;
      MouseContr.phi += MouseContr.dY;

      Z = Z + MouseContr.dZ;
      if (Z < 1.0) {
         Z = 1.0
      }
      //----------------------------------------------------------------------------------
      // glMatrix.mat4.identity(VIEWMATRIX);
      // glMatrix.mat4.lookAt(VIEWMATRIX, [gui.view_directionX, gui.view_directionY, gui.view_directionZ], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
      // glMatrix.mat4.identity(VIEWMATRIX_CAMERA);
      VIEWMATRIX = camera.vMatrix;

      //----------------- NORMALMATRIX_HELPER --------------------------------------------
      glMatrix.mat4.identity(MODELMATRIX);
      glMatrix.mat4.scale(MODELMATRIX, MODELMATRIX, [1.0, Z, 1.0]);

      // ------------------ NORMALMATRIX_HELPER  -----------------
      // Needs to try to move to the bottom
      glMatrix.mat4.invert(NORMALMATRIX_HELPER, MODELMATRIX);
      glMatrix.mat4.transpose(NORMALMATRIX_HELPER, NORMALMATRIX_HELPER);


      glMatrix.mat4.identity(MODELMATRIX);

      let model_translate = glMatrix.vec3.create();
      glMatrix.vec3.set(model_translate, gui.model_X, gui.model_Y, gui.model_Z);
      glMatrix.mat4.translate(MODELMATRIX, MODELMATRIX, model_translate);

      x += 0.005;
      glMatrix.mat4.rotateX(MODELMATRIX, MODELMATRIX, MouseContr.phi);
      // glMatrix.mat4.rotateY(MODELMATRIX, MODELMATRIX, x);
      glMatrix.mat4.rotateY(MODELMATRIX, MODELMATRIX, MouseContr.theta);
      glMatrix.mat4.scale(MODELMATRIX, MODELMATRIX, [1.0, Z, 1.0]);

      // ------------------ NORMALMATRIX ----------------------------
      glMatrix.mat4.invert(NORMALMATRIX, MODELMATRIX);
      glMatrix.mat4.transpose(NORMALMATRIX, NORMALMATRIX);

      //----------------------------------------------------------------------------------
      gl.clearColor(0.5, 0.5, 0.5, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      //----------------------------------------------------------------------------------

      gl.useProgram(shaderProgram);
      gl.enableVertexAttribArray(a_Position)
      gl.enableVertexAttribArray(a_uv)
      gl.enableVertexAttribArray(a_normal)
      gl.enableVertexAttribArray(a_tangent)
      gl.enableVertexAttribArray(a_bitangent)

      gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX);
      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX);
      gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX);
      gl.uniformMatrix4fv(u_Nmatrix, false, NORMALMATRIX);

      const diffuse = (gui.diffuse == true) ? 1.0 : 0.0;
      gl.uniform1f(u_diffuse, diffuse);
      gl.uniform1f(u_normalPower, gui.normalPower);

      //-------------------------- Lighting ----------------------------------------------
      let source_direction = glMatrix.vec3.create();
      glMatrix.vec3.set(source_direction, gui.source_directionX, gui.source_directionY, gui.source_directionZ);

      gl.uniform3fv(u_source_direction, source_direction);
      gl.uniform1f(u_shininess, gui.shininess);

      // let view_direction = glMatrix.vec3.create();
      // glMatrix.vec3.set(view_direction, gui.view_directionX, gui.view_directionY, gui.view_directionZ);
      // glMatrix.vec3.transformMat4(view_direction, view_direction, VIEWMATRIX_CAMERA);
      // gl.uniform3fv(u_view_direction, view_direction);


      if (tex.webGLtexture) {
         gl.activeTexture(gl.TEXTURE0);
         gl.bindTexture(gl.TEXTURE_2D, tex.webGLtexture);
      }
      if (tex_normal.webGLtexture) {
         gl.activeTexture(gl.TEXTURE1);
         gl.bindTexture(gl.TEXTURE_2D, tex_normal.webGLtexture);
      }
      if (tex_spec.webGLtexture) {
         gl.activeTexture(gl.TEXTURE2);
         gl.bindTexture(gl.TEXTURE_2D, tex_spec.webGLtexture);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, ModelMain.TRIANGLE_VERTEX);
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * (3), 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, ModelMain.TRIANGLE_NORMAL);
      gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 4 * (3), 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, ModelMain.TRIANGLE_TANGENT);
      gl.vertexAttribPointer(a_tangent, 3, gl.FLOAT, false, 4 * (3), 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, ModelMain.TRIANGLE_BITANGENT);
      gl.vertexAttribPointer(a_bitangent, 3, gl.FLOAT, false, 4 * (3), 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, ModelMain.TRIANGLE_UV);
      gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 4 * (2), 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ModelMain.TRIANGLE_FACES);
      gl.drawElements(gl.TRIANGLES, ModelMain.ModelIndiceslength, gl.UNSIGNED_SHORT, 0);

      gl.flush();

      gl.disableVertexAttribArray(a_Position);
      gl.disableVertexAttribArray(a_uv);
      gl.disableVertexAttribArray(a_normal);
      gl.disableVertexAttribArray(a_tangent);
      gl.disableVertexAttribArray(a_bitangent);

      //------------------------- NORMAL -------------------------------------------------
      if (gui.normal) {
         VertexNormalHelper(gl, shaderProgram_Normal, PROJMATRIX, VIEWMATRIX, MODELMATRIX, NORMALMATRIX_HELPER);
      }
      //------------------------- AXIS -------------------------------------------------
      if (gui.axis) {
         loadAxisHelper(gl, shaderProgram_Axis, PROJMATRIX, VIEWMATRIX, MODELMATRIX);
      }

      gl.flush();
      render()
      window.requestAnimationFrame(animate)
   }
}

function resize(e) {
   const windowWidth = document.documentElement.clientWidth;
   const windowHeight = document.documentElement.clientHeight;
   const sideSize = windowWidth < windowHeight ? windowWidth : windowHeight;
   context.canvas.width = context.canvas.height = sideSize;
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
