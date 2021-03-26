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

let context, gl, shaderProgram;

const StartWebGL = (vertexShaderText, fragmentShaderText) => {

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

   let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
   let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

   shaderProgram = createProgram(gl, vertexShader, fragmentShader);

   let gui = myGUI();
   let MouseContr = new MouseController(context);

   let u_Pmatrix = gl.getUniformLocation(shaderProgram, 'u_Pmatrix');
   let u_Vmatrix = gl.getUniformLocation(shaderProgram, 'u_Vmatrix');
   let u_Mmatrix = gl.getUniformLocation(shaderProgram, 'u_Mmatrix');
   let u_Nmatrix = gl.getUniformLocation(shaderProgram, 'u_Nmatrix');
   let  u_source_direction = gl.getUniformLocation(shaderProgram,'u_source_direction');
   let  u_view_direction = gl.getUniformLocation(shaderProgram,'u_view_direction');
   let  u_shininess = gl.getUniformLocation(shaderProgram,'u_shininess');

   let a_Position = gl.getAttribLocation(shaderProgram, 'a_Position');
   let a_uv = gl.getAttribLocation(shaderProgram, 'a_uv');
   let a_normal = gl.getAttribLocation(shaderProgram, 'a_normal');

   let u_sampler = gl.getUniformLocation(shaderProgram, 'samplerTex');

   gl.enableVertexAttribArray(a_Position)
   gl.enableVertexAttribArray(a_uv)
   gl.enableVertexAttribArray(a_normal)

   gl.useProgram(shaderProgram)
   gl.uniform1i(u_sampler, 0)

   // *******  Create Textures  ****
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
      })

   // ************ Create MATRIX   ************

   let  PROJMATRIX = glMatrix.mat4.create();
   glMatrix.mat4.identity(PROJMATRIX);
   let  fovy =  40 * Math.PI / 180;
   glMatrix.mat4.perspective(PROJMATRIX,fovy,gl.canvas.width/gl.canvas.height,1,100);

   let  MODELMATRIX   = glMatrix.mat4.create();
   let  VIEWMATRIX    = glMatrix.mat4.create();
   let  NORMALMATRIX  = glMatrix.mat4.create();
   let  NORMALMATRIX_HELPER  = glMatrix.mat4.create();
   let  VIEWMATRIX_CAMERA    = glMatrix.mat4.create();

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
   let animate;

   animate = function (time) {

      window.requestAnimationFrame(animate)

      if (!gl.model) return false;
      //---------- translate  --------------------------------------------//
      MouseContr.dX *= AMORTIZATION; MouseContr.dY *= AMORTIZATION;
      MouseContr.theta += MouseContr.dX; MouseContr.phi += MouseContr.dY;

      Z = Z + MouseContr.dZ; if(Z<1.0){Z=1.0}
      //----------------------------------------------------------------------------------
      glMatrix.mat4.identity(VIEWMATRIX);
      glMatrix.mat4.lookAt(VIEWMATRIX,[gui.view_directionX, gui.view_directionY, gui.view_directionZ],[0.0, 0.0, 0.0],[0.0, 1.0, 0.0]);
      // glMatrix.mat4.rotateX(VIEWMATRIX,VIEWMATRIX , MouseContr.phi);
      //  glMatrix.mat4.rotateY(VIEWMATRIX,VIEWMATRIX , MouseContr.theta);
      glMatrix.mat4.identity(VIEWMATRIX_CAMERA);
      // glMatrix.mat4.rotateX(VIEWMATRIX_CAMERA,VIEWMATRIX_CAMERA , -MouseContr.phi);
      // glMatrix.mat4.rotateY(VIEWMATRIX_CAMERA,VIEWMATRIX_CAMERA , -MouseContr.theta);


      //----------------- NORMALMATRIX_HELPER --------------------------------------------
      glMatrix.mat4.identity(MODELMATRIX);
      glMatrix.mat4.scale(MODELMATRIX,MODELMATRIX ,[1.0,Z,1.0]);
      // glMatrix.mat4.multiply(MODELMATRIX,MODELMATRIX,VIEWMATRIX);
      glMatrix.mat4.invert(NORMALMATRIX_HELPER,MODELMATRIX);
      glMatrix.mat4.transpose(NORMALMATRIX_HELPER,NORMALMATRIX_HELPER);


      glMatrix.mat4.identity(MODELMATRIX);

      let model_translate = glMatrix.vec3.create();
      glMatrix.vec3.set(model_translate,gui.model_X,gui.model_Y,gui.model_Z);
      glMatrix.mat4.translate(MODELMATRIX,MODELMATRIX,model_translate);
      glMatrix.mat4.rotateX(MODELMATRIX,MODELMATRIX , MouseContr.phi);
      glMatrix.mat4.rotateY(MODELMATRIX,MODELMATRIX , MouseContr.theta);
      glMatrix.mat4.scale(MODELMATRIX,MODELMATRIX ,[1.0,Z,1.0]);

      glMatrix.mat4.invert(NORMALMATRIX,MODELMATRIX);
      glMatrix.mat4.transpose(NORMALMATRIX,NORMALMATRIX);

      gl.useProgram(shaderProgram)
      //----------------------------------------------------------------------------------
      gl.clearColor(0.5, 0.5, 0.5, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      //----------------------------------------------------------------------------------

      gl.useProgram(shaderProgram);
      gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX);
      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX);
      gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX);
      gl.uniformMatrix4fv(u_Nmatrix, false, NORMALMATRIX);

      //-------------------------- Lighting ----------------------------------------------
      let source_direction = glMatrix.vec3.create();
      glMatrix.vec3.set(source_direction,gui.source_directionX,gui.source_directionY,gui.source_directionZ);

      gl.uniform3fv(u_source_direction, source_direction);
      gl.uniform1f(u_shininess, gui.shininess);

      let view_direction = glMatrix.vec3.create();
      glMatrix.vec3.set(view_direction,gui.view_directionX, gui.view_directionY, gui.view_directionZ);
      glMatrix.vec3.transformMat4(view_direction,view_direction,VIEWMATRIX_CAMERA);
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
      if(gui.normal){
         VertexNormalHelper(gl,shaderProgram_Normal,PROJMATRIX,VIEWMATRIX,MODELMATRIX,NORMALMATRIX_HELPER);
      }
      //------------------------- AXIS -------------------------------------------------
      if(gui.axis){
         loadAxisHelper(gl,shaderProgram_Axis,PROJMATRIX,VIEWMATRIX,MODELMATRIX);
      }

      gl.flush();
      render()
   }

   window.requestAnimationFrame(time => animate(time))
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
