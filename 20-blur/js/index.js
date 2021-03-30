let vs, fs, fs_1, fs_2, fs_3, fs_4;

let InitWebGL = () => {
   let Pvs = loadResource('shaders/vs.glsl')
   let Pfs = loadResource('shaders/fs.glsl')
   let Pfs_1 = loadResource('shaders/fs_1.glsl')
   let Pfs_2 = loadResource('shaders/fs_2.glsl')
   let Pfs_3 = loadResource('shaders/fs_3.glsl')
   let Pfs_4 = loadResource('shaders/fs_4.glsl')

   Promise.all([Pvs, Pfs, Pfs_1, Pfs_2, Pfs_3, Pfs_4])
      .then(data => {
         vs = data[0]
         fs = data[1]
         fs_1 = data[2]
         fs_2 = data[3]
         fs_3 = data[4]
         fs_4 = data[5]

         StartWebGL()
      })
}

function StartWebGL() {
   let canvas = document.getElementById('canvas')
   let gl = canvas.getContext('webgl');

   canvas.width = canvas.clientWidth
   canvas.height = canvas.clientHeight

   gl.viewport(0, 0, canvas.width, canvas.height)

   let tex = loadTexture(gl, 'textures/box.jpg')

   let animate = function () {

      let VSHADER_SOURCE = vs
      let FSHADER_SOURCE = fs

      const radio = document.getElementsByName("shader");

      for (let i = 0; i < radio.length; i++) {
         if (radio[i].checked) {
            if (radio[i].value == 'original') {
               VSHADER_SOURCE = vs
               FSHADER_SOURCE = fs
            } else if (radio[i].value == 'blur-1') {
               VSHADER_SOURCE = vs
               FSHADER_SOURCE = fs_1;
            } else if (radio[i].value == 'blur-2') {
               VSHADER_SOURCE = vs
               FSHADER_SOURCE = fs_2;
            } else if (radio[i].value == 'blur-3') {
               VSHADER_SOURCE = vs
               FSHADER_SOURCE = fs_3;
            } else if (radio[i].value == 'blur-4') {
               VSHADER_SOURCE = vs
               FSHADER_SOURCE = fs_4;
            }
         }
      }

      const VS = createShader(gl, gl.VERTEX_SHADER, VSHADER_SOURCE)

      const FS = createShader(gl, gl.FRAGMENT_SHADER, FSHADER_SOURCE)

      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, VS);
      gl.attachShader(shaderProgram, FS);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
         let info = gl.getProgramInfoLog(shaderProgram);
         throw new Error('Could not compile WebGL program. \n\n' + info);
      }

      const vertex_arr =
         [
            -0.9, -0.9,
            -0.9, 0.9,
            0.9, 0.9,
            0.9, -0.9,
         ];


      const BUFFER_VERTEX = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, BUFFER_VERTEX);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_arr), gl.STATIC_DRAW);

      const uv_arr =
         [
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
         ];

      const BUFFER_UV = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, BUFFER_UV);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv_arr), gl.STATIC_DRAW);

      const face_arr = [0, 1, 2, 0, 2, 3];
      const BUFFER_INDEX = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, BUFFER_INDEX);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(face_arr), gl.STATIC_DRAW);

      //-- RENDER-- //
      gl.useProgram(shaderProgram);

      let a_Position = gl.getAttribLocation(shaderProgram, 'a_Position');
      let a_UV = gl.getAttribLocation(shaderProgram, 'a_UV');
      let u_tex = gl.getUniformLocation(shaderProgram, 'u_tex');
      let u_textureSize = gl.getUniformLocation(shaderProgram, 'u_textureSize');
      //u_textureSize
      //  gl.uniform2f(u_textureSize,tex.webGLtexture.width,tex.webGLtexture.height);
      gl.uniform1i(u_tex, 0);
      if (tex.webGLtexture) {

         let texsize = glMatrix.vec2.create();
         gl.uniform2fv(u_textureSize, glMatrix.vec2.set(texsize, tex.width, tex.height));
         gl.activeTexture(gl.TEXTURE0);
         gl.bindTexture(gl.TEXTURE_2D, tex.webGLtexture);
      }
      gl.enableVertexAttribArray(a_Position);
      gl.enableVertexAttribArray(a_UV);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.5, 0.5, 0.5, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.bindBuffer(gl.ARRAY_BUFFER, BUFFER_VERTEX);
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4 * (2), 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, BUFFER_UV);
      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 4 * (2), 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, BUFFER_INDEX);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      gl.flush();
      window.requestAnimationFrame(animate);
   }
   window.requestAnimationFrame(animate);
}

window.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
})
