const loadTextResource = (url) => new Promise(((resolve, reject) => {
   let request = new XMLHttpRequest();
   request.open('GET', url, true);

   request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
         resolve(request.responseText)
      }
      reject(`Error: HTTP status - ${request.status} on resource ${url}`)
   }

   request.send()
}))

const loadTexture = function (gl, url) {
   let image = new Image()
   image.src = url;
   image.webGLtexture = false

   image.onload = function (e) {

      let texture = gl.createTexture()
      // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      //    new Uint8Array([0, 0, 255, 255]));

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      // 0 - Значение текстуры в mip-map карте
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

      // Нужно текстуру определенного размера
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

const createShader = (gl, type, source) => {
   let shader = gl.createShader(type)
   gl.shaderSource(shader, source)
   gl.compileShader(shader)

   const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
   if (!success) {
      alert('Error compile shader!')
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader)
      return false;
   }

   return shader;
}

const createProgram = (gl, vertexShader, fragmentShader) => {
   let program = gl.createProgram()

   gl.attachShader(program, vertexShader)
   gl.attachShader(program, fragmentShader)

   gl.linkProgram(program)
   gl.validateProgram(program)

   const success = gl.getProgramParameter(program, gl.VALIDATE_STATUS)
   if (!success) {
      console.error('Error validate program', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return false;
   }
   gl.useProgram(program)

   return program;
}

class Controller {
   constructor() {
      let oThis = this;
      this.drag = false;
      this.friction = 1;

      this.oldX = 0;
      this.oldY = 0;

      this.dX = 0;
      this.dY = 0;

      this.transVec = [0.0, 0.0, 0.0]

      window.addEventListener('mousedown', (e) => oThis.controller(e))
      window.addEventListener('mouseup', (e) => oThis.controller(e))
      window.addEventListener('mousemove', (e) => oThis.controller(e))
      window.addEventListener('keydown', (e) => oThis.controller(e))
      window.addEventListener('keyup', (e) => oThis.controller(e))
   }

   controller = function (e) {
      if (e.type === 'mousedown') {
         this.drag = true;
         this.friction = 1;

         this.oldX = e.pageX;
         this.oldY = e.pageY;
      }
      if (e.type === 'mouseup') {
         this.drag = false
      }
      if (e.type === 'mousemove') {
         if (!this.drag) {
            return false;
         }
         this.dX = (e.pageX - this.oldX) * 2 * Math.PI / context.canvas.width
         this.dY = (e.pageY - this.oldY) * 2 * Math.PI / context.canvas.height

         this.oldX = e.pageX;
         this.oldY = e.pageY;
      }
      if (e.type === 'keydown') {
         switch (e.keyCode) {
            case 87: { // top
               this.transVec[2] = -0.5;
            } break;
            case 83: { // bottom
               this.transVec[2] = 0.5;
            } break;
            case 65: { // left
               this.transVec[0] = -0.5;
            } break;
            case 68: { // right
               this.transVec[0] = 0.5;
            } break;
            default: return false;
         }
      }
      if (e.type === 'keyup') {
         this.transVec = [0.0, 0.0, 0.0]
      }
   }

   checkFriction() {
      if (!this.drag) {
         this.dX *= 0.95;
         this.dY *= 0.95;
      }
   }
}

const loadJSONModel = (gl, url) => {
   let request = new XMLHttpRequest()
   request.open('GET', url, false)

   request.onload = function () {
      console.log('loaded');
      // if (request.status >= 200 && request.status < 300) {
      //    gl.model = JSON.parse(request.responseText)
      // } else {
      //    alert('Model load failed: ' + request.status + ' ' + request.statusText)
      // }
   }

   request.send()
}

