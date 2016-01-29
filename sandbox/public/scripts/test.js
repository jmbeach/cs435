function Test(canvasId) {
  // begin setup
  var canvas = document.getElementById(canvasId);
  var gl = WebGLUtils.setupWebGL(canvas, {
    depth: false
  });
  var trianglePositioins = new Float32Array([-0.5, -0.25, 0.0,
    0.5, -0.25, 0.0,
    0.0, 0.559016994, 0.0
  ]);
  var triangle1Colors = new Float32Array([
    1.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 0.0, 1.0
  ]);
  // This triangle is yellow, cyan, and magenta.
  triangle2Colors = new Float32Array([
    // R, G, B, A
    1.0, 1.0, 0.0, 1.0,
    0.0, 1.0, 1.0, 1.0,
    1.0, 0.0, 1.0, 1.0
  ]);

  // This triangle is white, gray, and black.
  triangle3Colors = new Float32Array([
    // R, G, B, A
    1.0, 1.0, 1.0, 1.0,
    0.5, 0.5, 0.5, 1.0,
    0.0, 0.0, 0.0, 1.0
  ]);
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
  mat4.frustum(-ratio, // left
    ratio, // right
    -1.0, // bottom
    1.0, // top
    1.0, // near
    10.0, // far
    projectionMatrix
  )

  // set clear clearColor
  gl.clearColor(0.5, 0.5, 0.5, 1.0);

  // create eye
  var eye = vec3.create();
  eye[0] = 0.0;
  eye[1] = 0.0;
  eye[2] = 1.5;
  var center = vec3.create();
  center[0] = 0.0;
  center[1] = 0.0;
  center[2] = -5.0;
  var up = vec3.create();
  up[0] = 0.0;
  up[1] = 1.0;
  up[2] = 0.0;

  mat4.lookAt(eye, center, up, viewMatrix);

  // setup shaders
  var vertexShaderHandle = loadShader(gl, "vertex_shader", gl.VERTEX_SHADER);
  var fragmentShaderHandle = loadShader(gl, "fragment_shader", gl.FRAGMENT_SHADER);
  var programHandle = linkProgram(gl, vertexShaderHandle, fragmentShaderHandle);
  var mvpMatrixHandle = gl.getUniformLocation(programHandle, "u_MVPMatrix");
  var positionHandle = gl.getAttribLocation(programHandle, "a_Position");
  var colorHandle = gl.getAttribLocation(programHandle, "a_Color");

  gl.useProgram(programHandle);

  var trianglePositionBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePositionBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, trianglePositioins, gl.STATIC_DRAW);

  var triangleColorBufferObject1 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBufferObject1);
  gl.bufferData(gl.ARRAY_BUFFER, triangle1Colors, gl.STATIC_DRAW);
  // window.requestAnimFrame(render, canvas);
  triangleColorBufferObject2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBufferObject2);
  gl.bufferData(gl.ARRAY_BUFFER, triangle2Colors, gl.STATIC_DRAW);

  triangleColorBufferObject3 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBufferObject3);
  gl.bufferData(gl.ARRAY_BUFFER, triangle3Colors, gl.STATIC_DRAW);
  // end setup

  function render(time) {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Do a complete rotation every 10 seconds.
    var time = Date.now() % 10000;
    var angleInDegrees = (360.0 / 10000.0) * time;
    var angleInRadians = angleInDegrees / 57.2957795;

    var xyz = vec3.create();

    // Draw the triangle facing straight on.
    mat4.identity(modelMatrix);
    mat4.rotateZ(modelMatrix, angleInRadians);
    drawTriangle(triangleColorBufferObject1);

    // Draw one translated a bit down and rotated to be flat on the ground.
    mat4.identity(modelMatrix);
    xyz[0] = 0;
    xyz[1] = -1;
    xyz[2] = 0;
    mat4.translate(modelMatrix, xyz);
    mat4.rotateX(modelMatrix, 90 / 57.2957795);
    xyz[0] = 0;
    xyz[1] = 0;
    xyz[2] = 1;
    mat4.rotate(modelMatrix, angleInRadians, xyz);
    drawTriangle(triangleColorBufferObject2);

    // Draw one translated a bit to the right and rotated to be facing to the left.
    mat4.identity(modelMatrix);
    xyz[0] = 1;
    xyz[1] = 0;
    xyz[2] = 0;
    mat4.translate(modelMatrix, xyz);
    mat4.rotateY(modelMatrix, 90 / 57.2957795);
    xyz[0] = 0;
    xyz[1] = 0;
    xyz[2] = 1;
    mat4.rotate(modelMatrix, angleInRadians, xyz);
    drawTriangle(triangleColorBufferObject3);

    // Send the commands to WebGL
    gl.flush();

    // Request another frame
    window.requestAnimFrame(render, canvas);
  }

  // Draws a triangle from the given vertex data.
  var drawTriangle = function(triangleColorBufferObject) {
    var positionDataSize = 3;
    var colorDataSize = 4;
    // Pass in the position information
    gl.enableVertexAttribArray(positionHandle);
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePositionBufferObject);
    gl.vertexAttribPointer(positionHandle, positionDataSize, gl.FLOAT, false,
      0, 0);

    // Pass in the color information
    // gl.enableVertexAttribArray(colorHandle);
    // gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBufferObject);
    // gl.vertexAttribPointer(colorHandle, colorDataSize, gl.FLOAT, false,
    //   0, 0);

    // This multiplies the view matrix by the model matrix, and stores the result in the modelview matrix
    // (which currently contains model * view).
    mat4.multiply(viewMatrix, modelMatrix, mvpMatrix);

    // This multiplies the modelview matrix by the projection matrix, and stores the result in the MVP matrix
    // (which now contains model * view * projection).
    mat4.multiply(projectionMatrix, mvpMatrix, mvpMatrix);

    gl.uniformMatrix4fv(mvpMatrixHandle, false, mvpMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  render();
}
