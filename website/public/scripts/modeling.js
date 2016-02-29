// Projection transformation parameters

// Viewing transformation parameters
function Cylinder(opts) {
  var canvas = opts.canvas;
  var w = canvas.clientWidth;
  var h = canvas.clientHeight;
  var fovy = 120.0; // degrees
  var aspect = w / h;
  var near = 1.0;     // near clipping plane's distance
  var far = 20.0;     // far clipping plane's distance
  var V = translate(0.0, 0.0, -0.5*(near + far));
  var P = perspective(fovy, aspect, near, far);
  var self = this;
  var gl = opts.gl;
  self.program = opts.program;
  self.positions = [0.0,0.0,0.0];
  self.indices = [];
  self.positions.componentCount = 3;
  var sideCount = 100;
  var dTheta = 2.0 *Math.PI/sideCount;
  for (var i = 0; i < sideCount; i++) {
    var theta = i *dTheta;
    var x = Math.cos(theta);
    var y = Math.sin(theta);
    var z = 0.0;
    self.positions.push(x,y,z)
  }
  for (var i = 0; i < sideCount; i++) {
    var theta = i *dTheta;
    var x = Math.cos(theta);
    var y = Math.sin(theta);
    var z = 1.0;
    self.positions.push(x,y,z)
  }
  self.positions.push(0.0,0.0,1.0);
  self.indices.push(0.0,1.0);
  for (var i=sideCount; i > 0; i--) {
    self.indices.push(i);
  }
  self.indices.push(sideCount*2+1)
  for (var i = 0; i < sideCount; i++) {
    self.indices.push(i+sideCount+1);
  }
  self.indices.push(sideCount+1);
  self.indices.push(1,sideCount+1);
  for (var i = 1; i < sideCount+1; i++) {
    self.indices.push(sideCount+1-i);
    self.indices.push(sideCount*2+1-i)
  }
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(self.positions),gl.STATIC_DRAW);
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(self.indices) ,gl.STATIC_DRAW);
  var position = gl.getAttribLocation(self.program,"vPosition");
  self.uniforms = {
    MV : gl.getUniformLocation(self.program, "MV"),
    P : gl.getUniformLocation(self.program, "P"),
  };
  self.draw=function() {
    gl.useProgram(self.program);

    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
    gl.vertexAttribPointer(position,self.positions.componentCount,gl.FLOAT,
      gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(position)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    var count = sideCount+2;
    var offset = 0;
    gl.drawElements(gl.TRIANGLE_FAN, count, gl.UNSIGNED_SHORT,
      offset);
    offset += count * 2;
    count = sideCount+2;
    gl.drawElements(gl.TRIANGLE_FAN,count,gl.UNSIGNED_SHORT,
      offset);
    offset+=count*2;
    count = sideCount*2+2;
    gl.drawElements(gl.TRIANGLE_STRIP, count, gl.UNSIGNED_SHORT,
      offset);
  }
  self.update = function (angle) {
    var axis = [ 1.0, 1.0, 1.0 ];
    var M = mult(translate(self.offset), rotate(angle, axis));
    var MV = mult(V, M);
    gl.useProgram(self.program);
    gl.uniformMatrix4fv(self.uniforms.P, false, flatten(P));
    gl.uniformMatrix4fv(self.uniforms.MV, false, flatten(MV));
  };
}
function Paragraph(opts) {
  var self = this;
  var id = opts.id;
  var sel = "#"+id;
  var p = $(sel);
  self.text = function() {return p.text().trim().toUpperCase();}
}
function Word(word) {

}
function Character(singleChar) {
  var self = this;
  self.representedChar = singleChar.toUpperCase();
  self.matrixRepresentation = [ [0,0,0,0,0], [0,0,0,0,0],
    [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0],
    [0,0,0,0,0]
  ];
  switch(self.representedChar) {
    case "A":
      self.matrixRepresentation = [
        [0,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1]
      ];
      break;
    case "B":
      self.matrixRepresentation = [
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0]
      ];
      break;
  }
}
function Modeling() {
  var self = this;
  var canvas,
    gl,
    vPosition,
    theta = 0.0,
    thetaLoc;
  var angle = 0.0;
  var dAngle = Math.PI / 10.0;
  self.shapes = [];
  self.dragingShape = null;
  self.paragraph = new Paragraph({id:"paragraph"});
  var setup = function() {
    canvas = document.getElementById("canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    gl.enable(gl.DEPTH_TEST);
    // configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 0.8, 1, 1.0);
    // load shaders
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    self.cyl = new Cylinder({gl:gl,
      program:initShaders(gl,"Cylinder-vertex-shader","Cylinder-fragment-shader"),
      canvas:canvas
    });
    self.cyl.offset = [ 1.0,  1.0, 3.0 ];


    // console.log(cyl);
    // associate shader variables with buffer
    thetaLoc = gl.getUniformLocation(program, "theta");
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
  }
  setup();
  var mousePositionToPoint = function(x, y) {
    return vec2((x - (canvas.width / 2)) / (canvas.width / 2), -(y - (canvas.height / 2)) / (canvas.height / 2));
  }
  var onMouseMove = function(event) {
    // console.log(mousePositionToPoint(event.offsetX,event.offsetY));
    var point = mousePositionToPoint(event.offsetX, event.offsetY);
  }
  $(canvas).mousemove(function(event) {
    onMouseMove(event);
  });
  $(canvas).mousedown(function(event) {
    onMouseDown(event);
  })
  $(canvas).mouseup(function(event) {
    onMouseUp();
  });
  $(canvas).click(function(event) {
    var point = mousePositionToPoint(event.offsetX, event.offsetY);
  });
  var onMouseDown = function(event) {
    var point = mousePositionToPoint(event.offsetX, event.offsetY);
  }
  var onMouseUp = function() {
      // on mouse up, dragging shape becomes null
      self.dragingShape = null;
    }
    // called every frame
  var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    angle += dAngle;

    self.cyl.update(angle);
    self.cyl.draw();

    // call render again
    window.requestAnimFrame(render);
  }
  render();

}
