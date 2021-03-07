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

let gl, program, vertexArray = [];

const StartWebGL = function (vertexShaderText, fragmentShaderText) {
   let canvas = document.getElementById('example-canvas')
   gl = canvas.getContext('webgl')

   if (!gl) {
      alert('Your browser does not support WebGL')
      return;
   }

   canvas.width = gl.canvas.clientWidth
   canvas.height = gl.canvas.clientHeight

   canvas.addEventListener('mousedown', function (event) {
      onMouseDown(event, canvas)
   })

   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

   let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText)
   let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText)

   program = createProgram(gl, vertexShader, fragmentShader)

   draw()
}

let draw = function () {
   let vertexBuffer = gl.createBuffer()
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW)

   // Достаем аттрибут для позиции
   let positionAttribLocation = gl.getAttribLocation(program, 'vertexPosition')

   let vertices_number = vertexArray.length / 2;

   gl.vertexAttribPointer(
      positionAttribLocation, // ссылка на атрибут
      2,  // кол-во элементов на 1 итерацию
      gl.FLOAT, // тип данных
      gl.FALSE, // нормализация
      // кол-во элэментов массива на 1 вершину (можно передавать еще и цвет: [X,Y,R,G,B,A])
      2 * Float32Array.BYTES_PER_ELEMENT, // тут 4 - кол-во байтов в одном символе
      0 * Float32Array.BYTES_PER_ELEMENT // отступ для каждой вершины
   )

   gl.enableVertexAttribArray(positionAttribLocation)


   gl.clearColor(0.75, 0.9, 1.0, 1.0);

   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
   gl.enable(gl.DEPTH_TEST)

   gl.useProgram(program)
   gl.drawArrays(gl.POINTS, 0, vertices_number)
   gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices_number)
}

function onMouseDown(event, canvas) {
   let x = event.clientX;
   let y = event.clientY;

   let middle_X = gl.canvas.width / 2;
   let middle_Y = gl.canvas.height / 2;

   let rect = canvas.getBoundingClientRect();

   x = ((x - rect.left) - middle_X) / middle_X
   y = (middle_Y - (y - rect.top)) / middle_Y

   vertexArray.push(x)
   vertexArray.push(y)

   draw()
}

document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
})
