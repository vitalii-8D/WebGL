const InitWebGL = (e) => {
   let VSText1, FSText1, VSText2, FSText2;
   loadTextResource(`shaders/vertexShader.glsl`)
      .then(result => {
         VSText1 = result;
         return loadTextResource(`shaders/fragmentShader.glsl`)
      })
      .then(result => {
         FSText1 = result;
         return loadTextResource(`shaders/vertexShader_shadow.glsl`)
      })
      .then(result => {
         VSText2 = result;
         return loadTextResource(`shaders/fragmentShader_shadow.glsl`)
      })
      .then(result => {
         FSText2 = result;
         return StartWebGL(VSText1, FSText1, VSText2, FSText2)
      })
      .catch(err => {
         alert('Error with loading resources. See console for details!')
         console.log(err);
      })
}

let context, gl, shaderProgram;

const StartWebGL = (VSText, FSText, VSText_shadow, FSText_shadow) => {

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

   let gui = myGUI();
   let MouseContr = new MouseController(context);

   let vertexShader_shadow = createShader(gl, gl.VERTEX_SHADER, VSText_shadow);
   let fragmentShader_shadow = createShader(gl, gl.FRAGMENT_SHADER, FSText_shadow);

   let vertexShader = createShader(gl, gl.VERTEX_SHADER, VSText);
   let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FSText);

   // Shadow program
   let shaderProgram_shadow = createProgram(gl, vertexShader_shadow, fragmentShader_shadow);

   let a_Position_shadow = gl.getAttribLocation(shaderProgram_shadow, 'a_Position');
   let u_Pmatrix_shadow = gl.getUniformLocation(shaderProgram_shadow, 'u_Pmatrix');
   let u_Mmatrix_shadow = gl.getUniformLocation(shaderProgram_shadow, 'u_Mmatrix');
   let u_Vmatrix_shadow = gl.getUniformLocation(shaderProgram_shadow, 'u_Vmatrix');
   let v_Depth = gl.getAttribLocation(shaderProgram_shadow, 'v_Depth');

   // Main program
   let shaderProgram = createProgram(gl, vertexShader, fragmentShader)

   let a_Position = gl.getAttribLocation(shaderProgram, 'a_Position');
   let a_uv = gl.getAttribLocation(shaderProgram, 'a_uv');
   let a_normal = gl.getAttribLocation(shaderProgram, 'a_normal');

   let u_Pmatrix = gl.getUniformLocation(shaderProgram, 'u_Pmatrix');
   let u_Mmatrix = gl.getUniformLocation(shaderProgram, 'u_Mmatrix');
   let u_Vmatrix = gl.getUniformLocation(shaderProgram, 'u_Vmatrix');
   let u_Nmatrix = gl.getUniformLocation(shaderProgram, 'u_Nmatrix');

   let u_Lmatrix = gl.getUniformLocation(shaderProgram, 'u_Lmatrix');
   let u_PLmatrix = gl.getUniformLocation(shaderProgram, 'u_PLmatrix');

   let v_uv = gl.getAttribLocation(shaderProgram, 'v_uv');
   let v_normal = gl.getAttribLocation(shaderProgram, 'v_normal');
   let v_vertPos = gl.getAttribLocation(shaderProgram, 'v_vertPos');
   let v_LightPos = gl.getAttribLocation(shaderProgram, 'v_LightPos');

   let u_sampler = gl.getUniformLocation(shaderProgram, 'samplerTex')
   let u_samplerShadowMap = gl.getUniformLocation(shaderProgram, 'samplerShadowMap')

   let u_shininess = gl.getUniformLocation(shaderProgram, 'u_shininess')
   let u_source_direction = gl.getUniformLocation(shaderProgram, 'u_source_direction')
   let u_view_direction = gl.getUniformLocation(shaderProgram, 'u_view_direction')
   let u_CameraShadow = gl.getUniformLocation(shaderProgram, 'u_CameraShadow')

   gl.useProgram(shaderProgram)
   gl.uniform1i(u_sampler, 0)
   gl.uniform1i(u_samplerShadowMap, 1)

   // *******  Create TEXTURE  ****
   let tex = loadTexture(gl, 'textures/paper.jpg')

   // **********   MODEL   ************
   let ModelVertices, ModelIndices, ModelTexCoords, ModelNormal,
      TRIANGLE_VERTEX, TRIANGLE_UV, TRIANGLE_FACES, TRIANGLE_NORMAL;

   loadTextResource('models/knot.json')
      .then(model => JSON.parse(model))
      .then(model => {
         ModelVertices = model.meshes[0].vertices;
         ModelIndices = [].concat.apply([], model.meshes[0].faces);
         ModelTexCoords = model.meshes[0].texturecoords[0];
         ModelNormal = model.meshes[0].normals;

         TRIANGLE_VERTEX = gl.createBuffer()
         gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelVertices), gl.STATIC_DRAW)

         TRIANGLE_UV = gl.createBuffer()
         gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_UV)
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelTexCoords), gl.STATIC_DRAW)

         TRIANGLE_NORMAL = gl.createBuffer()
         gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_NORMAL)
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ModelNormal), gl.STATIC_DRAW)

         TRIANGLE_FACES = gl.createBuffer()
         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
         gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ModelIndices), gl.STATIC_DRAW)

         gl.model = model
         window.requestAnimationFrame(time => animate(time))
      })
   // *********************   RENDER TO TEXTURE   ******************
   let SHADOW_MAP_SIZE = 1024;
   let fb = gl.createFramebuffer();
   gl.bindFramebuffer(gl.FRAMEBUFFER, fb)

   let rb = gl.createRenderbuffer()
   gl.bindRenderbuffer(gl.RENDERBUFFER, rb)
   gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, SHADOW_MAP_SIZE, SHADOW_MAP_SIZE)

   let texture_shadow_map = gl.createTexture()
   gl.bindTexture(gl.TEXTURE_2D, texture_shadow_map)

   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SHADOW_MAP_SIZE, SHADOW_MAP_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

   gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture_shadow_map, 0)
   gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb)

   gl.bindTexture(gl.TEXTURE_2D, null)
   gl.bindRenderbuffer(gl.RENDERBUFFER, null)
   gl.bindFramebuffer(gl.FRAMEBUFFER, null)
   

   // ************ Create MATRIX   ************

   let PROJMATRIX = glMatrix.mat4.create();
   glMatrix.mat4.identity(PROJMATRIX);
   let fovy = 40 * Math.PI / 180;
   glMatrix.mat4.perspective(PROJMATRIX, fovy, gl.canvas.width / gl.canvas.height, 1, 100);

   let MODELMATRIX = glMatrix.mat4.create();
   let VIEWMATRIX = glMatrix.mat4.create();
   let NORMALMATRIX = glMatrix.mat4.create();
   let NORMALMATRIX_HELPER = glMatrix.mat4.create();
   let VIEWMATRIX_CAMERA = glMatrix.mat4.create();

   //  **** NORMAL ***
   let shaderProgram_Normal;
   shaderProgram_Normal = loadNormalShaders(gl)

   // **** AXIS ***
   let shaderProgram_Axis;
   shaderProgram_Axis = loadAxisShaders(gl)

   // **** RENDER  ***
   gl.enable(gl.DEPTH_TEST);
   gl.depthFunc(gl.LEQUAL);
   gl.clearDepth(1.0);

   let Z = 0;
   let AMORTIZATION = 0.9;

   // let animate;

   function animate(time) {


      // if (!gl.model) return false;
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
      glMatrix.mat4.identity(VIEWMATRIX);
      glMatrix.mat4.lookAt(VIEWMATRIX, [gui.view_directionX, gui.view_directionY, gui.view_directionZ], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
      // glMatrix.mat4.rotateX(VIEWMATRIX,VIEWMATRIX , MouseContr.phi);
      //  glMatrix.mat4.rotateY(VIEWMATRIX,VIEWMATRIX , MouseContr.theta);
      glMatrix.mat4.identity(VIEWMATRIX_CAMERA);
      // glMatrix.mat4.rotateX(VIEWMATRIX_CAMERA,VIEWMATRIX_CAMERA , -MouseContr.phi);
      // glMatrix.mat4.rotateY(VIEWMATRIX_CAMERA,VIEWMATRIX_CAMERA , -MouseContr.theta);


      //----------------- NORMALMATRIX_HELPER --------------------------------------------
      glMatrix.mat4.identity(MODELMATRIX);
      glMatrix.mat4.scale(MODELMATRIX, MODELMATRIX, [1.0, Z, 1.0]);
      // glMatrix.mat4.multiply(MODELMATRIX,MODELMATRIX,VIEWMATRIX);
      glMatrix.mat4.invert(NORMALMATRIX_HELPER, MODELMATRIX);
      glMatrix.mat4.transpose(NORMALMATRIX_HELPER, NORMALMATRIX_HELPER);


      glMatrix.mat4.identity(MODELMATRIX);

      let model_translate = glMatrix.vec3.create();
      glMatrix.vec3.set(model_translate, gui.model_X, gui.model_Y, gui.model_Z);
      glMatrix.mat4.translate(MODELMATRIX, MODELMATRIX, model_translate);
      glMatrix.mat4.rotateX(MODELMATRIX, MODELMATRIX, MouseContr.phi);
      glMatrix.mat4.rotateY(MODELMATRIX, MODELMATRIX, MouseContr.theta);
      glMatrix.mat4.scale(MODELMATRIX, MODELMATRIX, [1.0, Z, 1.0]);

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

      gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX);
      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX);
      gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX);
      gl.uniformMatrix4fv(u_Nmatrix, false, NORMALMATRIX);

      //-------------------------- Lighting ----------------------------------------------
      let source_direction = glMatrix.vec3.create();
      glMatrix.vec3.set(source_direction, gui.source_directionX, gui.source_directionY, gui.source_directionZ);

      gl.uniform3fv(u_source_direction, source_direction);
      gl.uniform1f(u_shininess, gui.shininess);

      let view_direction = glMatrix.vec3.create();
      glMatrix.vec3.set(view_direction, gui.view_directionX, gui.view_directionY, gui.view_directionZ);
      glMatrix.vec3.transformMat4(view_direction, view_direction, VIEWMATRIX_CAMERA);
      gl.uniform3fv(u_view_direction, view_direction);


      if (tex.webGLtexture) {
         gl.activeTexture(gl.TEXTURE0);
         gl.bindTexture(gl.TEXTURE_2D, tex.webGLtexture);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * (3), 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_NORMAL);
      gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 4 * (3), 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_UV);
      gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 4 * (2), 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
      gl.drawElements(gl.TRIANGLES, ModelIndices.length, gl.UNSIGNED_SHORT, 0);


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

   // window.requestAnimationFrame(time => animate(time))

   document.getElementById('btn1').onclick = switchMainProgram
   document.getElementById('btn2').onclick = switchMainProgram
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
