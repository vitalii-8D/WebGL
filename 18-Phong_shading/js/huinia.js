const InitWebGL = (e) => {
   let VSText1, FSText1, VSText2, FSText2;
   loadTextResource(`shaders/vertexShader1.glsl`)
      .then(result => {
         VSText1 = result;
         return loadTextResource(`shaders/fragmentShader1.glsl`)
      })
      .then(result => {
         FSText1 = result;
         return loadTextResource(`shaders/vertexShader2.glsl`)
      })
      .then(result => {
         VSText2 = result;
         return loadTextResource(`shaders/fragmentShader2.glsl`)
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

const StartWebGL = function(vertexShaderText1, fragmentShaderText1, vertexShaderText2, fragmentShaderText2) {

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
   let vertexShader1 = createShader(gl, gl.VERTEX_SHADER, vertexShaderText1);
   let fragmentShader1 = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText1);
   // Math in the Fragment shader
   let vertexShader2 = createShader(gl, gl.VERTEX_SHADER, vertexShaderText2);
   let fragmentShader2 = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText2);

   // Math in vertex shader
   let program1 = createProgram(gl, vertexShader1, fragmentShader1);
   // Math in fragment shader
   let program2 = createProgram(gl, vertexShader2, fragmentShader2);

   let currentProgram = 1;
   shaderProgram = program1

   let s = {
      vertexMath: {
         program: program1,
         u_Pmatrix: gl.getUniformLocation(program1, 'u_Pmatrix'),
         u_Vmatrix: gl.getUniformLocation(program1, 'u_Vmatrix'),
         u_Mmatrix: gl.getUniformLocation(program1, 'u_Mmatrix'),
         u_Nmatrix: gl.getUniformLocation(program1, 'u_Nmatrix'),
         u_source_direction: gl.getUniformLocation(program1, 'u_source_direction'),
         u_view_direction: gl.getUniformLocation(program1, 'u_view_direction'),
         u_shininess: gl.getUniformLocation(program1, 'u_shininess'),
         a_Position: gl.getAttribLocation(program1, 'a_Position'),
         a_uv: gl.getAttribLocation(program1, 'a_uv'),
         a_normal: gl.getAttribLocation(program1, 'a_normal'),

         u_sampler: gl.getUniformLocation(program1, 'samplerTex'),
      },
      fragmentMath: {
         program: program2,
         u_Pmatrix: gl.getUniformLocation(program2, 'u_Pmatrix'),
         u_Vmatrix: gl.getUniformLocation(program2, 'u_Vmatrix'),
         u_Mmatrix: gl.getUniformLocation(program2, 'u_Mmatrix'),
         u_Nmatrix: gl.getUniformLocation(program2, 'u_Nmatrix'),
         u_source_direction: gl.getUniformLocation(program2, 'u_source_direction'),
         u_view_direction: gl.getUniformLocation(program2, 'u_view_direction'),
         u_shininess: gl.getUniformLocation(program2, 'u_shininess'),
         a_Position: gl.getAttribLocation(program2, 'a_Position'),
         a_uv: gl.getAttribLocation(program2, 'a_uv'),
         a_normal: gl.getAttribLocation(program2, 'a_normal'),

         u_sampler: gl.getUniformLocation(program2, 'samplerTex'),
      }
   }

   let switchMainProgram = (e) => {
      console.log(this)
      let shaderId = +e.target.getAttribute('shaderId')
      if (shaderId === currentProgram) return false;
      let program;

      window.cancelAnimationFrame(animate)

      if (shaderId === 1) {
         program = 'vertexMath'
      } else {
         program = 'fragmentMath'
      }

      setShaderVar(program)

      document.getElementById(`btn${currentProgram}`).style.backgroundColor = 'inherit'
      document.getElementById(`btn${shaderId}`).style.backgroundColor = 'limegreen'
      currentProgram = shaderId;

      window.requestAnimationFrame(time => animate(time))
   }
   switchMainProgram.bind(StartWebGL)

   let gui = myGUI();
   let MouseContr = new MouseController(context);

   let u_Pmatrix, u_Vmatrix, u_Mmatrix, u_Nmatrix, u_source_direction,
      u_view_direction, u_shininess, a_Position, a_uv, a_normal, u_sampler

   function setShaderVar(program) {
      shaderProgram = s[program].program;

      u_Pmatrix = s[program].u_Pmatrix
      u_Vmatrix = s[program].u_Vmatrix
      u_Mmatrix = s[program].u_Mmatrix
      u_Nmatrix = s[program].u_Nmatrix
      u_source_direction = s[program].u_source_direction
      u_view_direction = s[program].u_view_direction
      u_shininess = s[program].u_shininess

      if (a_Position) {
         gl.disableVertexAttribArray(a_Position)
         gl.disableVertexAttribArray(a_uv)
         gl.disableVertexAttribArray(a_normal)
      }

      a_Position = s[program].a_Position
      a_uv = s[program].a_uv
      a_normal = s[program].a_normal

      u_sampler = s[program].u_sampler

      gl.enableVertexAttribArray(a_Position)
      gl.enableVertexAttribArray(a_uv)
      gl.enableVertexAttribArray(a_normal)

      gl.useProgram(shaderProgram)
      gl.uniform1i(u_sampler, 0)
   }

   setShaderVar('vertexMath')

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
         window.requestAnimationFrame(time => animate(time))
      })

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
