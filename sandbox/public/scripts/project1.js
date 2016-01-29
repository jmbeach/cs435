function Vector3(x, y, z) {
  var self = this;
  self.x = x;
  self.y = y;
  self.z = z;
}

function Line(vector1, vector2, buffer) {
  var self = this;
  self.position = new Float32Array([
    vector1.x, vector1.y, vector1.z,
    vector2.x, vector2.y, vector2.z
  ]);
  self.buffer = buffer;
}

function Project1(canvasId) {
  // setup variables
  var self = this;
  var canvas = document.getElementById(canvasId);
  var gl = WebGLUtils.setupWebGL(canvas, {
    depth: false
  });
  gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
  // like our camera
  var viewMatrix = mat4.create();
  // moves models from object space to world space
  var modelMatrix = mat4.create();
  // used to project the scene onto a 2d viewport
  var projectionMatrix = mat4.create();
  // combined matrix passed into shader program
  var mvpMatrix = mat4.create();
  // setup projection matrix
  var ratio = canvas.clientWidth / canvas.clientHeight;
  // tells the projection matrix what to look at
  var eye = vec3.create();
  var center = vec3.create();
  var up = vec3.create();
  // setup shaders
  var vertexShaderHandle = loadShader(gl, "vertex_shader", gl.VERTEX_SHADER);
  var fragmentShaderHandle = loadShader(gl, "fragment_shader", gl.FRAGMENT_SHADER);
  var programHandle = linkProgram(gl, vertexShaderHandle, fragmentShaderHandle);
  var mvpMatrixHandle = gl.getUniformLocation(programHandle, "u_MVPMatrix");
  var positionHandle = gl.getAttribLocation(programHandle, "a_Position");
  var colorHandle = gl.getAttribLocation(programHandle, "a_Color");
  var triangleColorBufferObject1 = gl.createBuffer();
  // end setup shaders
  // end setup variables

  // start setup properties
  self.lines = [];
  // says how many times to transform the triangle
  self.transformCount = 0;
  // end setup properties


  var setup = function() {
    mat4.frustum(-ratio, // left
      ratio, // right
      -1.0, // bottom
      1.0, // top
      1.0, // near
      10.0, // far
      projectionMatrix
    );
    // set clear clearColor
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    // create eye
    eye[0] = 0.0;
    eye[1] = 0.0;
    eye[2] = 1.5;
    center[0] = 0.0;
    center[1] = 0.0;
    center[2] = -5.0;
    up[0] = 0.0;
    up[1] = 1.0;
    up[2] = 0.0;
    mat4.lookAt(eye, center, up, viewMatrix);
    gl.useProgram(programHandle);
    // gl.bindBuffer(gl.ARRAY_BUFFER, linePositionBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, linePositions, gl.STATIC_DRAW);
    // initialize the base triangle
    var baseLine = new Line(
      new Vector3(-1.0, -1.0, 0.0),
      new Vector3(1.0, -1.0, 0.0),
      gl.createBuffer()
    );
    console.log(baseLine);
    gl.bindBuffer(gl.ARRAY_BUFFER, baseLine.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, baseLine.position, gl.STATIC_DRAW);
    self.lines.push(baseLine);
    var leftLine = new Line(
      new Vector3(-1.0, -1.0, 0.0),
      new Vector3(0.0, 1.0, 0.0),
      gl.createBuffer()
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, leftLine.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, leftLine.position, gl.STATIC_DRAW);
    gl.col
    self.lines.push(leftLine);
    var triangle1Colors = new Float32Array([
      1.0, 0.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0,
      0.0, 1.0, 0.0, 1.0
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBufferObject1);
    gl.bufferData(gl.ARRAY_BUFFER, triangle1Colors, gl.STATIC_DRAW);
  };
  setup();

  var drawLines = function() {
    for (var i = 0; i < self.lines.length; i++) {
      var line = self.lines[i];
      mat4.identity(modelMatrix);
      gl.enableVertexAttribArray(positionHandle);
      gl.bindBuffer(gl.ARRAY_BUFFER, line.buffer);
      gl.vertexAttribPointer(positionHandle, 3, gl.FLOAT, false, 0, 0);
      // console.log(line);
      gl.enableVertexAttribArray(colorHandle);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBufferObject1);
      gl.vertexAttribPointer(colorHandle, 4, gl.FLOAT, false,
        0, 0);
      mat4.multiply(viewMatrix, modelMatrix, mvpMatrix);
      mat4.multiply(projectionMatrix, mvpMatrix, mvpMatrix);
      gl.uniformMatrix4fv(mvpMatrixHandle, false, mvpMatrix);
      gl.drawArrays(gl.LINES, 0, 2);
    }
  }

  function render(time) {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the triangle facing straight on.
    drawLines();

    gl.flush();
    window.requestAnimFrame(render, canvas);
  }
  render();
}
