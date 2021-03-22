const loadTextResource = function (url) {
   return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();

      request.open('GET', url, true);

      request.onload = function () {
         if (request.status >= 200 && request.status < 300) {
            resolve(request.responseText);
         } else {
            reject(`Error: HTTP status - ${request.status} on resource ${url}`)
         }
      }

      request.send();
   })
}

const createShader = function (gl, type, source) {
   let shader = gl.createShader(type)

   gl.shaderSource(shader, source)

   gl.compileShader(shader)

   if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('Error compile shader!')
      console.error(gl.getShaderInfoLog(shader));
      return false;
   }

   return shader;
}

const createProgram = function (gl, vertexShader, fragmentShader) {
   let program = gl.createProgram()

   gl.attachShader(program, vertexShader)
   gl.attachShader(program, fragmentShader)

   gl.linkProgram(program)
   gl.validateProgram(program)

   if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      console.error('Error validate program', gl.getProgramInfoLog(program))
      return false;
   }

   return program;
}
