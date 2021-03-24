let triangle_vertex = [
   -1, -1, -1, 0.0, 0.0,
   1, -1, -1, 1.0, 0.0,
   1, 1, -1, 1.0, 1.0,
   -1, 1, -1, 0.0, 1.0,

   -1, -1, 1, -0.5, -0.5,
   1, -1, 1, 1.5, -0.5,
   1, 1, 1, 1.5, 1.5,
   -1, 1, 1, -0.5, 1.5,

   -1, -1, -1, 0, 0,
   -1, 1, -1, 1, 0,
   -1, 1, 1, 1, 1,
   -1, -1, 1, 0, 1,

   1, -1, -1, 0, 0,
   1, 1, -1, 1, 0,
   1, 1, 1, 1, 1,
   1, -1, 1, 0, 1,

   -1, -1, -1, 0, 0,
   -1, -1, 1, 1, 0,
   1, -1, 1, 1, 1,
   1, -1, -1, 0, 1,

   -1, 1, -1, 0, 0,
   -1, 1, 1, 1, 0,
   1, 1, 1, 1, 1,
   1, 1, -1, 0, 1,
];
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
let ground_vertex = [
   -3, -1.001, -3, 0, 0,
   -3, -1.001, 3, 1, 0,
   3, -1.001, 3, 1, 1,
   3, -1.001, -3, 0, 1,
]
let ground_faces = [
   0, 1, 2,
   0, 2, 3
]

function getVertexCube(gl) {
   let TRIANGLE_VERTEX = gl.createBuffer()
   gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), gl.STATIC_DRAW)

   return TRIANGLE_VERTEX;
}
function getFacesCube(gl) {
   let TRIANGLE_FACES = gl.createBuffer()
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_face), gl.STATIC_DRAW)

   return TRIANGLE_FACES;
}

function getVertexGround(gl) {
   let GROUND_VERTEX = gl.createBuffer()
   gl.bindBuffer(gl.ARRAY_BUFFER, GROUND_VERTEX)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ground_vertex), gl.STATIC_DRAW)

   return GROUND_VERTEX
}
function getFacesGround(gl) {
   let GROUND_FACES = gl.createBuffer()
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, GROUND_FACES)
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ground_faces), gl.STATIC_DRAW)

   return GROUND_FACES
}
