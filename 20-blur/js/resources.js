let loadResource = (url) => {
   return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest()
      request.open('GET', url)

      request.onload = function () {
         if (request.status >= 200 && request.status <300) {
            resolve(request.responseText)
         } else {
            reject('Something was wrong with loading resources!')
         }
      }

      request.send()
   })
}

let createShader = (gl, type, text) => {
   let shader = gl.createShader(type)
   gl.shaderSource(shader, text)
   gl.compileShader(shader)

   let isCompiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
   if (!isCompiled) {
      console.error('Something was wrong with shader ' + gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
   }

   return shader;
}

let createProgram = (gl, vertexS, fragmentS) => {
   let program = gl.createProgram()
   gl.attachShader(program, vertexS)
   gl.attachShader(program, fragmentS)

   gl.linkProgram(program)
   gl.validateProgram(program)

   let isValid = gl.getProgramParameter(program, gl.VALIDATE_STATUS)
   if (!isValid) {
      console.error('Something was wrong with shader ' + gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
   }

   return program;
}

let loadTexture = (gl, url) => {
   let image = new Image()
   image.src = url;
   image.webGLtexture = false;

   image.onload = function () {
      let texture = gl.createTexture()
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
         // Yes, it's a power of 2. Generate mips.
         gl.generateMipmap(gl.TEXTURE_2D);
      } else {
         // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }

      gl.bindTexture(gl.TEXTURE_2D, null)

      image.webGLtexture = texture
   }

   return image;
}

function isPowerOf2(value) {
   return (value & (value - 1)) === 0;
}
