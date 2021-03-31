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

   return program;
}

function loadBuffer(gl,meshes) {

   let modelbuffer = {

      TRIANGLE_VERTEX:0,
      TRIANGLE_UV:0,
      TRIANGLE_NORMAL:0,
      TRIANGLE_FACES:0,
      ModelIndiceslength:0,

   };

   let ModelVertices   =  meshes.vertices;
   let ModelIndices    =  [].concat.apply([], meshes.faces);
   let ModelTexCoords  =  meshes.texturecoords[0];
   let ModelNormal     =  meshes.normals;
   modelbuffer.ModelIndiceslength = ModelIndices.length;

   modelbuffer.TRIANGLE_VERTEX = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER,modelbuffer.TRIANGLE_VERTEX);
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ModelVertices),gl.STATIC_DRAW);

   // modelbuffer.TRIANGLE_VERTEX = TRIANGLE_VERTEX;

   modelbuffer.TRIANGLE_UV = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER,modelbuffer.TRIANGLE_UV);
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ModelTexCoords),gl.STATIC_DRAW);

   modelbuffer.TRIANGLE_NORMAL = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER,modelbuffer.TRIANGLE_NORMAL);
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ModelNormal),gl.STATIC_DRAW);

   modelbuffer.TRIANGLE_FACES = gl.createBuffer();
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,modelbuffer.TRIANGLE_FACES);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(ModelIndices),gl.STATIC_DRAW);

   gl.modelbufferPlane = modelbuffer;
   return modelbuffer;

}
