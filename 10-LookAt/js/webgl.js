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

let gl, shaderProgram;

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

   shaderProgram = createProgram(gl, vertexShader, fragmentShader)
   gl.useProgram(shaderProgram)

   var u_Pmatrix = gl.getUniformLocation(shaderProgram, 'u_Pmatrix');
   var u_Mmatrix = gl.getUniformLocation(shaderProgram, 'u_Mmatrix');
   var u_Vmatrix = gl.getUniformLocation(shaderProgram, 'u_Vmatrix');


   var a_Position = gl.getAttribLocation(shaderProgram, 'a_Position');
   var a_Color = gl.getAttribLocation(shaderProgram, 'a_Color');

   gl.enableVertexAttribArray(a_Position);
   gl.enableVertexAttribArray(a_Color);

   var triangle_vertex =
      [
         -1, -1, -1, 1, 1, 0,
         1, -1, -1, 1, 1, 0,
         1, 1, -1, 1, 1, 0,
         -1, 1, -1, 1, 1, 0,

         -1, -1, 1, 0, 0, 1,
         1, -1, 1, 0, 0, 1,
         1, 1, 1, 0, 0, 1,
         -1, 1, 1, 0, 0, 1,

         -1, -1, -1, 0, 1, 1,
         -1, 1, -1, 0, 1, 1,
         -1, 1, 1, 0, 1, 1,
         -1, -1, 1, 0, 1, 1,

         1, -1, -1, 1, 0, 0,
         1, 1, -1, 1, 0, 0,
         1, 1, 1, 1, 0, 0,
         1, -1, 1, 1, 0, 0,

         -1, -1, -1, 1, 0, 1,
         -1, -1, 1, 1, 0, 1,
         1, -1, 1, 1, 0, 1,
         1, -1, -1, 1, 0, 1,

         -1, 1, -1, 0, 1, 0,
         -1, 1, 1, 0, 1, 0,
         1, 1, 1, 0, 1, 0,
         1, 1, -1, 0, 1, 0


      ];

   var TRIANGLE_VERTEX = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), gl.STATIC_DRAW);


   var triangle_face = [0, 1, 2,
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
      20, 22, 23];

   var TRIANGLE_FACES = gl.createBuffer();
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_face), gl.STATIC_DRAW);


   // ---------------------------------------------------------------------


   var PROJMATRIX = mat4.perspective(40, canvas.width / canvas.height, 1, 100);
   var VIEWMATRIX = mat4.create();
   var MODELMATRIX = mat4.create();
   var VIEWMATRIX_eye = mat4.create();

   gl.enable(gl.DEPTH_TEST);

   var animate = function (time) {

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // ---------------------------------------------------------------------

      mat4.identity(MODELMATRIX);
      mat4.identity(VIEWMATRIX);

      mat4.identity(VIEWMATRIX_eye);

      //-------------------  VIEW --------------------------------------------


      mat4.rotateY(VIEWMATRIX_eye, time * 0.0005);
      mat4.translate(VIEWMATRIX_eye, [0.0, 0.0, 5.0]);

      var eye = vec3.create([0.0, 5.0, 5.0]);

      eye = mat4.multiplyVec3(VIEWMATRIX_eye, eye);

      var center = vec3.create([0.0, 0.0, 0.0]);
      var up = vec3.create([0.0, 1.0, 0.0]);
      VIEWMATRIX = mat4.lookAt(eye, center, up);


      // --------------------------------------------------------------

      gl.clearColor(0.5, 0.5, 0.5, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // ---------------------Cube Center-----------------------------------------

      mat4.identity(MODELMATRIX);
      mat4.translate(MODELMATRIX, [0.0, 0.5, 0.0]); //x y z
      mat4.scale(MODELMATRIX, [0.2, 1.2, 0.1]); //x y z

      gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
      gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX);
      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX);
      gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX);

      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * (3 + 3), 0);
      gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 4 * (3 + 3), 3 * 4);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
      gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);


      // --------------Cube------------------------------------------------
      var AngeleFace = 0;
      for (var i = 1; i <= 12; i++) {

         AngeleFace = (i * -6.0 * 5.0) * Math.PI / 180;
         mat4.identity(MODELMATRIX);
         mat4.rotateY(MODELMATRIX, AngeleFace);
         mat4.translate(MODELMATRIX, [2.5, 0.0, 0.0]); //x y z

         if (i % 3 == 0) {
            mat4.scale(MODELMATRIX, [0.15, 0.5, 0.1]); //x y z
         } else {
            mat4.scale(MODELMATRIX, [0.1, 0.3, 0.1]); //x y z
         }

         gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
         gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX);
         gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX);
         gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX);

         gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * (3 + 3), 0);
         gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 4 * (3 + 3), 3 * 4);

         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
         gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

      }


      gl.flush();

      window.requestAnimationFrame(animate);
   }
   animate(0);

}


document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
})
