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
  self.centerAtPoint= function (x,y) {
    // console.log(x + " and " +y)
    self.vertices[0][0] = -1.0 * self.size + x;
    self.vertices[1][0] = -1.0 * self.size + x;
    self.vertices[2][0] = 1.0 * self.size + x;
    self.vertices[3][0] = 1.0 * self.size + x;
    self.vertices[0][1] = 1.0 * self.size + y;
    self.vertices[1][1] = -1.0 * self.size + y;
    self.vertices[2][1] = 1.0 * self.size + y;
    self.vertices[3][1] = -1.0 * self.size + y;
  }
  var minPoint = function(i) {
    var min = self.vertices[0][i];
    if (self.vertices[1][i] < min) {
      min = self.vertices[1][i];
    }
    if (self.vertices[2][i] < min) {
      min = self.vertices[2][i];
    }
    if (self.vertices[3][i] < min) {
      min = self.vertices[3][i];
    }
    return min;
  }
  var maxPoint = function(i) {
    var max = self.vertices[0][i];
    if (self.vertices[1][i] > max) {
      max = self.vertices[1][i];
    }
    if (self.vertices[2][i] > max) {
      max = self.vertices[2][i];
    }
    if (self.vertices[3][i] > max) {
      max = self.vertices[3][i];
    }
    return max;
  }
  self.isInside = function(x,y) {
    // if it is not too far left
    if (x >= minPoint(0)) {
      // if it is not too far right
      if (x <= maxPoint(0)) {
        // if it is not too high
        if (y >= minPoint(1)) {
          // if it is not too low
          if (y <= maxPoint(1)) {
            return true;
          }
        }
      }
    }
    return false;
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
  self.centerAtPoint = function(x,y) {
    self.vertices[0][0] = -1.0 * self.size + (x+self.size/2);
    self.vertices[1][0] = -1.0 * self.size + (x+self.size/2);
    self.vertices[2][0] = 1.0 * self.size + (x+self.size/2);
    self.vertices[0][1] = -1.0 * self.size + (y + self.size/2);
    self.vertices[1][1] = 1.0 * self.size + (y+self.size/2);
    self.vertices[2][1] = -1.0 * self.size + (y+self.size/2);
  }
  // Inspired by answer http://stackoverflow.com/questions/2049582/how-to-determine-a-point-in-a-2d-triangle
  self.isInside = function(x,y) {
    var toTest = vec2(x,y);
    var distanceX = toTest[0]-self.vertices[2][0];
    var distanceY = toTest[1]-self.vertices[2][1];
    var distanceX2to1 = self.vertices[2][0] - self.vertices[1][0];
    var distanceY1to2 = self.vertices[1][1]-self.vertices[2][1];
    var distance = distanceY1to2 * (self.vertices[0][0]-self.vertices[2][0])+
      distanceX2to1*(self.vertices[0][1]-self.vertices[2][1]);
    var sum = distanceY1to2*distanceX+distanceX2to1*distanceY;
    var total = (self.vertices[2][1]-self.vertices[0][1])*distanceX+
      (self.vertices[0][0]-self.vertices[2][0])*distanceY;
    if (distance < 0){
      return sum <= 0 && total <= 0 && sum+total >= distance;
    }
    return sum>=0 && total >=0 && sum+total<=distance;
  }
  var rotateVertex = function(vertex, degrees) {
    var tempX = vertex[0];
    var tempY = vertex[1];
    vertex[0] = tempX*Math.cos(degrees)-tempY*Math.sin(degrees);
    vertex[1] = tempY*Math.cos(degrees)+tempX*Math.sin(degrees);
  }
  self.rotate = function(degrees) {
    rotateVertex(self.vertices[0],degrees);
    rotateVertex(self.vertices[1],degrees);
    rotateVertex(self.vertices[2],degrees);
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
  self.dragingShape = null;
  var setup = function() {
    canvas = document.getElementById("canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    // configure WebGL
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(0.5,1.0,1.0,1.0);
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
  var mousePositionToPoint = function(x,y) {
    return vec2((x-(canvas.width/2))/(canvas.width/2),
      -(y-(canvas.height/2))/(canvas.height/2));
  }
  var onMouseMove =function(event) {
    // console.log(mousePositionToPoint(event.offsetX,event.offsetY));
    var point = mousePositionToPoint(event.offsetX,event.offsetY);
    // console.log(point);
    if (self.dragingShape) {
      self.dragingShape.centerAtPoint(point[0],point[1]);
    }
    // self.square.centerAtPoint(point[0],point[1]);
    // self.largeTriangle1.centerAtPoint(point[0],point[1])
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
  var onMouseDown = function(event) {
    var point = mousePositionToPoint(event.offsetX,event.offsetY);
    // console.log(point);
    // console.log(self.square.isInside(point[0],point[1]));
    // console.log(self.largeTriangle1.isInside(point[0],point[1]));
    // examine each shape
    // the first shape which is being clicked gets set as dragingShape
    if (self.square.isInside(point[0],point[1])) {
      self.dragingShape = self.square;
    }
    else if (self.largeTriangle1.isInside(point[0],point[1])) {
      self.dragingShape = self.largeTriangle1;
    }
  }
  var onMouseUp=function() {
    // on mouse up, dragging shape becomes null
    self.dragingShape = null;
  }
  // called every frame
  var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    theta+=0.0001;
    self.largeTriangle1.rotate(theta);
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
