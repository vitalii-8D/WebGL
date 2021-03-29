let vs, fs, fs_1, fs_2, fs_3;

let InitWebGL = () => {
   let Pvs = loadResource('shaders/vs.glsl')
   let Pfs = loadResource('shaders/fs.glsl')
   let Pfs_1 = loadResource('shaders/fs_1.glsl')
   let Pfs_2 = loadResource('shaders/fs_2.glsl')
   let Pfs_3 = loadResource('shaders/fs_3.glsl')

   Promise.all([Pvs, Pfs, Pfs_1, Pfs_2, Pfs_3])
      .then(data => {
         vs = data[0]
         fs = data[1]
         fs_1 = data[2]
         fs_2 = data[3]
         fs_3 = data[4]

         StartWebGL()
      })
}

function StartWebGL() {
   let canvas = document.getElementById('canvas')
   let gl = canvas.getContext('webgl');

   canvas.width = canvas.clientWidth
   canvas.height = canvas.clientHeight

   gl.viewport(0, 0, canvas.width, canvas.height)

   let vertexShader = createShader(gl, gl.VERTEX_SHADER, vs)
   let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs)

   let program = createProgram(gl, vertexShader, fragmentShader)
   gl.useProgram(program)

   let a_Position = gl.getAttribLocation(program, 'a_Position')
   let a_uv = gl.getAttribLocation(program, 'a_uv')
   let sampler = gl.getUniformLocation(program, 'sampler')
   let u_texSize = gl.getUniformLocation(program, 'u_texSize')

   gl.uniform1i(sampler, 0)

   let triangle_vertex = [
      -1, 1, -1, 1,
      -1, -1, -1, -1,
      1, -1, 1, -1,
      1, 1, 1, 1
   ]
   let TRIANGLE_VERTEX = gl.createBuffer()
   gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), gl.STATIC_DRAW)

   let triangle_faces = [
      0, 1, 2,
      0, 2, 3
   ]
   let TRIANGLE_FACES = gl.createBuffer()
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_faces), gl.STATIC_DRAW)

   let tex = loadTexture(gl, 'textures/box.jpg')
   let radios = document.getElementsByName("shader");

   let vertexShaderText = vs;
   let fragmentShaderText = fs;
   let currentMode = 'original';
   let size;

   let animate = () => {

      for (let i = 0; i < radios.length; i++) {
         if (radios[i].checked) {
            let newMode = radios[i].value;
            console.log(newMode);
            if (newMode === currentMode) {
               break;
            } else {
               switch (newMode) {
                  case 'original': {
                     fragmentShaderText = fs;
                  } break;
                  case 'blur-1': {
                     fragmentShaderText = fs_1;
                  } break;
                  case 'blur-2': {
                     fragmentShaderText = fs_2;
                  } break;
                  case 'blur-3': {
                     fragmentShaderText = fs_3;
                  } break;
                  default: console.error('shader mode is unknown')
               }
               currentMode = newMode

               vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText)
               fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText)

               program = createProgram(gl, vertexShader, fragmentShader)
               gl.useProgram(program)

               a_Position = gl.getAttribLocation(program, 'a_Position')
               a_uv = gl.getAttribLocation(program, 'a_uv')
               sampler = gl.getUniformLocation(program, 'sampler')
               texSize = gl.getUniformLocation(program, 'texSize')

               gl.uniform1i(sampler, 0)
            }
         }
      }

      gl.clearColor(0.5, 0.5, 0.5, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      if (tex.webGLtexture) {
         size = glMatrix.vec2.create();
         gl.uniform2fv(u_texSize, glMatrix.vec2.set(size, 1024, 1024))

         gl.activeTexture(gl.TEXTURE0)
         gl.bindTexture(gl.TEXTURE_2D, tex.webGLtexture)
      }

      gl.enableVertexAttribArray(a_Position)
      gl.enableVertexAttribArray(a_uv)

      gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4*4, 0)
      gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 4*4, 2*4)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
      gl.drawElements(gl.TRIANGLES, triangle_faces.length, gl.UNSIGNED_SHORT, 0)

      gl.flush()

      window.requestAnimationFrame(time => {animate(time)})
   }

   window.requestAnimationFrame(time => {animate(time)})

}

window.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
})
