function Square(options) {
  var self = this;
  self.size = options.size;
  // create 4 points
  self.vertices = [
    vec2(-1.0 * self.size, 1.0 * self.size),
    vec2(-1.0 * self.size, -1.0 * self.size),
    vec2(1.0 * self.size, 1.0 * self.size),
    vec2(1.0 * self.size, -1.0 * self.size)
  ];
  self.loadIntoBuffer = function(gl) {
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(self.vertices),gl.STATIC_DRAW);
  }
}
function RightTriangle(options) {
  var self = this;
  self.size = options.size;
  self.vertices = [
    vec2(-1.0 * self.size, -1.0 * self.size),
    vec2(-1.0 * self.size, 1.0 * self.size),
    vec2(1.0 * self.size, -1.0 * self.size)
  ];
  self.loadIntoBuffer = function(gl) {
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(self.vertices),gl.STATIC_DRAW);
  }
}
function Tangram() {
  var self = this;
  var canvas,
    gl,
    vPosition,
    theta = 0.0,
    thetaLoc;
  self.shapes = [];
  var setup = function() {
    canvas = document.getElementById("canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    // configure WebGL
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(1.0,1.0,1.0,1.0);
    // load shaders
    var program = initShaders(gl,"vertex-shader","fragment-shader");
    gl.useProgram(program);
    // load a shape into buffer
    self.largeTriangle1 = new RightTriangle({size:0.5});
    self.square = new Square({size:0.25});
    // associate shader variables with buffer
    thetaLoc = gl.getUniformLocation(program,"theta");
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
  }
  setup();
  // called every frame
  var render = function() {
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // theta+=0.1;
    // gl.uniform1f(thetaLoc,theta);
    self.largeTriangle1.loadIntoBuffer(gl);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,3);
    self.square.loadIntoBuffer(gl);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    // gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    // gl.drawArrays(gl.TRIANGLE_STRIP,0,3);
    // call render again
    window.requestAnimFrame(render);
  }
  render();
}
