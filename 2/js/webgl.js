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

const StartWebGL = function (vertexShaderText, fragmentShaderText) {
   // Достаем canvas и контекст webgl
   let canvas = document.getElementById('example-canvas')
   let gl = canvas.getContext('webgl')

   if (!gl) {
      alert('Your browser does not support WebGL')
      return;
   }
   // Меняем пиксельный размер canvas в соответствии с заданным в CSS
   // По умолчанию 300х150
   canvas.width = gl.canvas.clientWidth
   canvas.height = gl.canvas.clientHeight
// Настраиваем область видимости
// По умолчанию 300х150
   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

   // Создаем шейдеры
   let vertexShader = gl.createShader(gl.VERTEX_SHADER)
   let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

   // Выставляем источник шейдеров
   gl.shaderSource(vertexShader, vertexShaderText)
   gl.shaderSource(fragmentShader, fragmentShaderText)

   // Компилируем и проверяем на ошибки
   gl.compileShader(vertexShader)
   if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      alert('Error compile shader!')
      console.error(gl.getShaderInfoLog(vertexShader));
   }
   gl.compileShader(fragmentShader)
   if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      alert('Error compile shader!')
      console.error(gl.getShaderInfoLog(fragmentShader));
      console.log(gl.getShaderInfoLog(fragmentShader));
      console.log(fragmentShader);
   }

   // Создаем програму и присоединяем шейдеры
   let program = gl.createProgram()
   gl.attachShader(program, vertexShader)
   gl.attachShader(program, fragmentShader)

   // Свяжем шейдеры с програмой и проверим на валидность
   gl.linkProgram(program)
   gl.validateProgram(program)

   if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      console.error('Error validate program', gl.getProgramInfoLog(program))

      return;
   }
   // Создаем буфер
   let vertexBuffer = gl.createBuffer()
   // Связываем буфер с точкой связи
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

   let vertexArray = [
      // X, Y
      0.0, 0.3,
      0.2, 0.5,
      0.0, 0.0,

      0.2, 0.5,
      0.4, 0.5,
      0.0, 0.0,

      0.4, 0.5,
      0.6, 0.3,
      0.0, 0.0,

      0.6, 0.3,
      0.6, 0.1,
      0.0, 0.0,

      0.6, 0.1,
      0.0, -0.6,
      0.0, 0.0,

      0.0, -0.6,
      -0.6, 0.1,
      0.0, 0.0,

      -0.6, 0.1,
      -0.6, 0.3,
      0.0, 0.0,

      -0.6, 0.3,
      -0.4, 0.5,
      0.0, 0.0,

      -0.4, 0.5,
      -0.2, 0.5,
      0.0, 0.0,

      -0.2, 0.5,
      0.0, 0.3,
      0.0, 0.0,
   ]
//gl.ARRAY_BUFFER = точка связи
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW)

   let positionAttribLocation = gl.getAttribLocation(program, 'vertexPosition')

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

   // Установим цвет для холста после очистки буфера цвета
   gl.clearColor(0.75, 0.9, 1.0, 1.0);
   // Очистим буфер цвета
   gl.clear(gl.COLOR_BUFFER_BIT)

   gl.useProgram(program)
   gl.drawArrays(
      gl.TRIANGLES, // Примитив с помощью которого будем рисовать
      0, // С какого елемента в масиве начать (с какоц вершины)
      30 // Число вершин которые нужно отрисовать
   )
}

document.addEventListener('DOMContentLoaded', () => {
   InitWebGL();
})
