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
   gl.uniform1i(u_sampler, 0) // При рендере можем менять слот.

   gl.enableVertexAttribArray(a_Position)
   gl.enableVertexAttribArray(a_uv)

   let triangle_vertex = [
      -1, -1, -1, 0.0, 0.0,
      1, -1, -1,  1.0, 0.0,
      1, 1, -1,   1.0, 1.0,
      -1, 1, -1,  0.0, 1.0,

      -1, -1, 1,  -0.5, -0.5,
      1, -1, 1,   1.5, -0.5,
      1, 1, 1,    1.5, 1.5,
      -1, 1, 1,   -0.5, 1.5,

      -1, -1, -1,  0,0,
      -1, 1, -1,   1,0,
      -1, 1, 1,    1,1,
      -1, -1, 1,   0,1,

      1, -1, -1,  0,0,
      1, 1, -1,   1,0,
      1, 1, 1,    1,1,
      1, -1, 1,   0,1,

      -1, -1, -1,  0,0,
      -1, -1, 1,   1,0,
      1, -1, 1,    1,1,
      1, -1, -1,   0,1,

      -1, 1, -1,  0,0,
      -1, 1, 1,   1,0,
      1, 1, 1,    1,1,
      1, 1, -1,   0,1,
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

   gl.enable(gl.DEPTH_TEST);
   gl.depthFunc(gl.LEQUAL);
   gl.clearDepth(1.0);

   //   - - - -- -  VIDEO  --
   // will set to true when video can be copied to texture
   var copyVideo = false;

   function setupVideo(url) {
      const video = document.createElement('video');

      var playing = false;
      var timeupdate = false;

      video.autoplay = true;
      video.muted = true;
      video.loop = true;

      // Waiting for these 2 events ensures
      // there is data in the video

      video.addEventListener('playing', function() {
         playing = true;
         checkReady();
      }, true);

      video.addEventListener('timeupdate', function() {
         timeupdate = true;
         checkReady();
      }, true);

      video.src = url;
      video.play();

      function checkReady() {
         if (playing && timeupdate) {
            copyVideo = true;
         }
      }

      return video;
   }

   function initTexture(gl) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Because video has to be download over the internet
      // they might take a moment until it's ready so
      // put a single pixel in the texture so we can
      // use it immediately.
      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 1;
      const height = 1;
      const border = 0;
      const srcFormat = gl.RGBA;
      const srcType = gl.UNSIGNED_BYTE;
      const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
         width, height, border, srcFormat, srcType,
         pixel);

      // Turn off mips and set  wrapping to clamp to edge so it
      // will work regardless of the dimensions of the video.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      return texture;
   }

   function updateTexture(gl, texture, video) {
      const level = 0;
      const internalFormat = gl.RGBA;
      const srcFormat = gl.RGBA;
      const srcType = gl.UNSIGNED_BYTE;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
         srcFormat, srcType, video);
   }
   // ----- // Video

   let PROJMATRIX = mat4.perspective(40, gl.canvas.width / gl.canvas.height, 1, 200)
   let MODELMATRIX = mat4.create()
   let VIEWMATRIX = mat4.create()

   mat4.identity(MODELMATRIX)
   mat4.identity(VIEWMATRIX)
   mat4.lookAt([0.0, 0.0, 10.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], VIEWMATRIX)

   let old_time = 0;
   let dt = 0;

   // Video INIT
   const texture = initTexture(gl);

   const video = setupVideo('textures/video.mp4');

   let animate = function (time) {
      // console.log(tex);
      dt = time - old_time;
      old_time = time;

      if (copyVideo) {
         updateTexture(gl, texture, video);
      }

      gl.clearColor(0.7, 0.7, 0.7, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      mat4.rotateX(MODELMATRIX, 0.0007 * dt)
      mat4.rotateY(MODELMATRIX, 0.0007 * dt)

      gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX)
      gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX)
      gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX)

      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 4 * 5, 0)
      gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 4 * 5, 4*3)


      gl.drawElements(gl.TRIANGLES, triangle_face.length, gl.UNSIGNED_SHORT, 0)
      // gl.drawElements(gl.LINES, triangle_face.length, gl.UNSIGNED_SHORT, 0)

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
      0, 0, canvas.width, canvas.height)
}

window.addEventListener('resize', resize);
document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
}, {once: true})
