function Project1(canvasId) {
  // #region setup variables
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
  var vertexShaderHandle = null;
  var fragmentShaderHandle = null;
  var programHandle = null,
    mvpMatrixHandle,
    positionHandle,
    colorHandle;
  // setup shaders
  SHADER_LOADER.load(
    function(data) {
      vertexShaderHandle = loadShader(gl, data.particles.vertex, gl.VERTEX_SHADER);
      fragmentShaderHandle = loadShader(gl, data.particles.fragment, gl.FRAGMENT_SHADER);
      programHandle = linkProgram(gl, vertexShaderHandle, fragmentShaderHandle);
      mvpMatrixHandle = gl.getUniformLocation(programHandle, "u_MVPMatrix");
      positionHandle = gl.getAttribLocation(programHandle, "a_Position");
      colorHandle = gl.getAttribLocation(programHandle, "a_Color");
      setup()

      render();
    }
  );
  var triangleColorBufferObject1 = gl.createBuffer();
  // end setup shaders
  // #endregion setup variables

  // start setup properties
  self.lines = [];
  // says how many times to transform the triangle
  self.transformCount = 0;
  // end setup properties

  var breakUpLine = function(line, finalPoint, invert) {
    // break up into four more lines
    // section 1
    var length = line.length();
    var lineDirection = line.direction();
    // make line 1/3 length of line along original line
    var one3rdLength = length / 3;
    var seg1Point1 = line.point1;
    var seg1Point2 = new Vector3(
      seg1Point1.x + (lineDirection.x * one3rdLength),
      seg1Point1.y + (lineDirection.y * one3rdLength),
      seg1Point1.z + (lineDirection.z * one3rdLength)
    );
    var seg1 = new Line(
      seg1Point1,
      seg1Point2,
      gl.createBuffer()
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, seg1.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, seg1.position, gl.STATIC_DRAW);
    var halfAThirdOfLength = one3rdLength;
    var theta = -45;
    if (!invert) {
      theta = -theta;
    }
    var directionRotated = new Vector3(
      lineDirection.x * Math.cos(theta) -
      lineDirection.y * Math.sin(theta),
      lineDirection.x * Math.sin(theta) +
      lineDirection.y * Math.cos(theta),
      0
    );
    var seg2Point1 = seg1.point2;
    var seg2Point2 = new Vector3(
      seg1Point2.x + (directionRotated.x * halfAThirdOfLength),
      seg1Point2.y + (directionRotated.y * halfAThirdOfLength),
      0
    );
    var seg2 = new Line(
      seg2Point1,
      seg2Point2,
      gl.createBuffer()
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, seg2.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, seg2.position, gl.STATIC_DRAW);
    var theta = -theta;
    var directionUnRotated = new Vector3(
      lineDirection.x * Math.cos(theta) -
      lineDirection.y * Math.sin(theta),
      lineDirection.x * Math.sin(theta) +
      lineDirection.y * Math.cos(theta),
      0
    )
    var seg3Point1 = seg2.point2;
    var seg3Point2 = new Vector3(
      seg2Point2.x + (directionUnRotated.x * halfAThirdOfLength),
      seg2Point2.y + (directionUnRotated.y * halfAThirdOfLength),
      0
    );
    var seg3 = new Line(
      seg3Point1,
      seg3Point2,
      gl.createBuffer()
    )
    gl.bindBuffer(gl.ARRAY_BUFFER, seg3.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, seg3.position, gl.STATIC_DRAW);
    var seg4Point1 = seg3.point2;
    var seg4Point2 = null;
    seg4Point2 = new Vector3(
      (seg1Point2.x + lineDirection.x * one3rdLength) + (lineDirection.x * one3rdLength), (seg1Point2.y + lineDirection.y * one3rdLength) + (lineDirection.y * one3rdLength),
      0
    );
    var seg4 = new Line(
      seg4Point1,
      seg4Point2,
      gl.createBuffer()
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, seg4.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, seg4.position, gl.STATIC_DRAW);
    // replace original line in list by the 4 new lines
    var indexOfOriginal = 0;
    for (var i = 0; i < self.lines.length; i++) {
      var curLine = self.lines[i];
      if (curLine == line) {
        indexOfOriginal = i;
      }
    }
    self.lines[indexOfOriginal] = seg1;
    self.lines.splice(indexOfOriginal + 1, 0, seg2);
    self.lines.splice(indexOfOriginal + 2, 0, seg3);
    self.lines.splice(indexOfOriginal + 3, 0, seg4);
  }

  var setup = function() {
    self.lines = [];
    mat4.frustum(
      projectionMatrix,
      -ratio, // left
      ratio, // right
      -1.0, // bottom
      1.0, // top
      1.0, // near
      10.0 // far
    );
    // set clear clearColor
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    // create eye
    eye[0] = 0.0;
    eye[1] = 100.0;
    eye[2] = 1.5;
    center[0] = 0.0;
    center[1] = 0.0;
    center[2] = -5.0;
    up[0] = 0.0;
    up[1] = 1.0;
    up[2] = 0.0;
    gl.useProgram(programHandle);
    // gl.bindBuffer(gl.ARRAY_BUFFER, linePositionBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, linePositions, gl.STATIC_DRAW);
    // initialize the base triangle
    var baseLine = new Line(
      new Vector3(-0.5, -0.5, 0.0),
      new Vector3(0.5, -0.5, 0.0),
      gl.createBuffer()
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, baseLine.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, baseLine.position, gl.STATIC_DRAW);
    self.lines.push(baseLine);
    var leftLine = new Line(
      new Vector3(-0.5, -0.5, 0.0),
      new Vector3(0.0, 0.5, 0.0),
      gl.createBuffer()
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, leftLine.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, leftLine.position, gl.STATIC_DRAW);
    self.lines.push(leftLine);
    var rightLine = new Line(
      new Vector3(0.0, 0.5, 0.0),
      new Vector3(0.5, -0.5, 0.0),
      gl.createBuffer()
    )
    gl.bindBuffer(gl.ARRAY_BUFFER, rightLine.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, rightLine.position, gl.STATIC_DRAW);
    self.lines.push(rightLine);
    var triangle1Colors = new Float32Array([
      1.0, 0.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0,
      0.0, 1.0, 0.0, 1.0
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBufferObject1);
    gl.bufferData(gl.ARRAY_BUFFER, triangle1Colors, gl.STATIC_DRAW);
  };

  var drawLines = function() {
    for (var i = 0; i < self.lines.length; i++) {
      var line = self.lines[i];
      mat4.identity(modelMatrix);
      gl.enableVertexAttribArray(positionHandle);
      gl.bindBuffer(gl.ARRAY_BUFFER, line.buffer);
      gl.vertexAttribPointer(positionHandle, 3, gl.FLOAT, false, 0, 0);
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

  self.performTransformation = function() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    setup();
    for (var i = 0; i < self.transformCount; i++) {
      var currentRecursionDepth = i + 1;
      for (var j = 0; j < self.lines.length; j += 4) {
        breakUpLine(self.lines[j],
          null, Math.pow(4, currentRecursionDepth) > j);
      }
    }
  }

  function render(time) {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    viewMatrix = mat4.lookAt(viewMatrix,
      eye,
      center,
      up
    )
    // Draw the triangle facing straight on.
    drawLines();
    gl.flush();
    window.requestAnimFrame(render, canvas);
  }
}

function Vector3(x, y, z) {
  var self = this;
  self.x = x;
  self.y = y;
  self.z = z;
}

function Line(vector1, vector2, buffer) {
  var self = this;
  self.point1 = vector1;
  self.point2 = vector2;
  self.position = new Float32Array([
    vector1.x, vector1.y, vector1.z,
    vector2.x, vector2.y, vector2.z
  ]);
  self.asVector = function() {
    return new Vector3(
      self.point2.x - self.point1.x,
      self.point2.y - self.point1.y,
      self.point2.z - self.point1.z
    );
  }
  self.length = function() {
    var lineAsVector = self.asVector();
    return Math.sqrt((lineAsVector.x * lineAsVector.x) +
      (lineAsVector.y * lineAsVector.y));
  }
  self.direction = function() {
    var lineAsVector = self.asVector();
    var lineLength = self.length();
    return new Vector3(
      lineAsVector.x / lineLength,
      lineAsVector.y / lineLength,
      lineAsVector.z / lineLength
    )
  }
  self.buffer = buffer;
}
