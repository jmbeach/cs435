function Vector2(point1,point2) {
  var self = this;
  self.x = point2[0] - point1[0];
  self.y = point2[1] - point1[1];
  self.magnitude = function() {
    return Math.sqrt(self.x*self.x+self.y*self.y);
  }
  self.direction = function() {
    return vec2(self.x/self.magnitude(),self.y/self.magnitude());
  }
}
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
    var point = vec2(x,y);
    var aToB = new Vector2(self.center(),point);
    self.vertices[0][0] += aToB.x;
    self.vertices[1][0] += aToB.x;
    self.vertices[2][0] += aToB.x;
    self.vertices[3][0] += aToB.x;
    self.vertices[0][1] += aToB.y;
    self.vertices[1][1] += aToB.y;
    self.vertices[2][1] += aToB.y;
    self.vertices[3][1] += aToB.y;
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
  self.center = function() {
    var y = (maxPoint(1) + minPoint(1))/2;
    var x = (maxPoint(0)+ minPoint(0))/2;
    return vec2(x,y);
  }
  var bounds = function() {
    var asList = [];
    asList.push(new BoundingBox(self.vertices[0],self.vertices[1]));
    asList.push(new BoundingBox(self.vertices[1],self.vertices[2]));
    asList.push(new BoundingBox(self.vertices[2],self.vertices[3]));
    asList.push(new BoundingBox(self.vertices[3],self.vertices[0]));
    return asList;
  }
  // Inspired by blog post http://www.emanueleferonato.com/2012/03/09/algorithm-to-determine-if-a-point-is-inside-a-square-with-mathematics-no-hit-test-involved/
  var triangleArea = function(vertex1,vertex2,vertex3) {
    return (
      vertex3[0]*vertex2[1]-vertex2[0]*vertex3[1])-
      (vertex3[0]*vertex1[1]-vertex1[0]*vertex3[1]) +
      (vertex2[0]*vertex1[1]-vertex1[0]*vertex2[1]);
  }
  self.isInside = function(x,y) {
    var point = vec2(x,y);
    var a1 = triangleArea(self.vertices[0],self.vertices[1],point);
    var a2 = triangleArea(self.vertices[1],self.vertices[2],point);
    var a3 = triangleArea(self.vertices[2],self.vertices[3],point);
    var a4 = triangleArea(self.vertices[3],self.vertices[1],point);
    if (a1>0.2||a2>0.2||a3>0.2||a4>0.2)
    {
      return false;
    }
    return true;
  }
  var rotateVertex = function(vertex, radians) {
    var tempX = vertex[0];
    var tempY = vertex[1];
    vertex[0] = tempX*Math.cos(radians)-tempY*Math.sin(radians);
    vertex[1] = tempY*Math.cos(radians)+tempX*Math.sin(radians);
  }
  self.rotate = function(degrees) {
    var rads = (Math.PI/180)*degrees;
    // save center
    var currentCenter = self.center();
    // move to origin
    self.centerAtPoint(0,0);
    // rotate
    rotateVertex(self.vertices[0],rads);
    rotateVertex(self.vertices[1],rads);
    rotateVertex(self.vertices[2],rads);
    rotateVertex(self.vertices[3],rads);
    // move back
    self.centerAtPoint(currentCenter[0],currentCenter[1]);
  }
}
function Parallelogram(options) {
  var self = this;
  self.size = options.size;
  self.vertices = [
    vec2(-1.0*self.size,1.0*self.size),
    vec2(1.0*self.size,1.0*self.size),
    vec2(1*self.size,-1.0*self.size),
    vec2(3*self.size,-1.0*self.size),
  ]
  self.loadIntoBuffer = function(gl) {
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(self.vertices),gl.STATIC_DRAW);
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
  self.center = function() {
    var y = (maxPoint(1) + minPoint(1))/2;
    var x = (maxPoint(0)+ minPoint(0))/2;
    return vec2(x,y);
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
  }
  self.centerAtPoint= function (x,y) {
    // console.log(x + " and " +y)
    var point = vec2(x,y);
    var aToB = new Vector2(self.center(),point);
    self.vertices[0][0] += aToB.x;
    self.vertices[1][0] += aToB.x;
    self.vertices[2][0] += aToB.x;
    self.vertices[3][0] += aToB.x;
    self.vertices[0][1] += aToB.y;
    self.vertices[1][1] += aToB.y;
    self.vertices[2][1] += aToB.y;
    self.vertices[3][1] += aToB.y;
  }
  var rotateVertex = function(vertex, radians) {
    var tempX = vertex[0];
    var tempY = vertex[1];
    vertex[0] = tempX*Math.cos(radians)-tempY*Math.sin(radians);
    vertex[1] = tempY*Math.cos(radians)+tempX*Math.sin(radians);
  }
  self.rotate = function(degrees) {
    var rads = (Math.PI/180)*degrees;
    // save center
    var currentCenter = self.center();
    // move to origin
    self.centerAtPoint(0,0);
    // rotate
    rotateVertex(self.vertices[0],rads);
    rotateVertex(self.vertices[1],rads);
    rotateVertex(self.vertices[2],rads);
    rotateVertex(self.vertices[3],rads);
    // move back
    self.centerAtPoint(currentCenter[0],currentCenter[1]);
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
  self.center = function() {
    var cornerToEnd = new Vector2(self.vertices[1],self.vertices[2]);
    var pointBetweenCornerAndEnd = vec2(self.vertices[1][0]+cornerToEnd.x/2,self.vertices[1][1]+cornerToEnd.y/2);
    var toOtherPoint = new Vector2(pointBetweenCornerAndEnd,self.vertices[0]);
    var actualCenter = vec2(
      pointBetweenCornerAndEnd[0]+toOtherPoint.x/2,
      pointBetweenCornerAndEnd[1]+toOtherPoint.y/2);
    return actualCenter;
    // return pointBetweenCornerAndEnd;
  }
  self.centerAtPoint = function(x,y) {
    var point = vec2(x,y);
    var aToB = new Vector2(self.center(),point);
    self.vertices[0][0] += aToB.x;
    self.vertices[1][0] += aToB.x;
    self.vertices[2][0] += aToB.x;
    self.vertices[0][1] += aToB.y;
    self.vertices[1][1] += aToB.y;
    self.vertices[2][1] += aToB.y;
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
  var rotateVertex = function(vertex, rads) {
    var tempX = vertex[0];
    var tempY = vertex[1];
    vertex[0] = tempX*Math.cos(rads)-tempY*Math.sin(rads);
    vertex[1] = tempY*Math.cos(rads)+tempX*Math.sin(rads);
  }
  self.rotate = function(degrees) {
    var rads = degrees * (Math.PI/180);
    // save center
    var currentCenter = self.center();
    // move to origin
    self.centerAtPoint(0,0);
    // rotate
    rotateVertex(self.vertices[0],rads);
    rotateVertex(self.vertices[1],rads);
    rotateVertex(self.vertices[2],rads);
    // move back
    self.centerAtPoint(currentCenter[0],currentCenter[1]);
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
    self.largeTriangle1.rotate(-135);
    self.largeTriangle1.centerAtPoint(-0.288,-0.64);
    self.largeTriangle2 = new RightTriangle({size:0.5});
    self.largeTriangle2.rotate(135);
    self.largeTriangle2.centerAtPoint(-0.644,-0.28);
    self.square = new Square({size:0.25});
    self.square.rotate(45);
    self.square.centerAtPoint(-0.284,0.076)
    self.smallTriangle1 = new RightTriangle({size:0.25});
    self.smallTriangle1.rotate(45);
    self.smallTriangle1.centerAtPoint(-0.64,0.256);
    self.smallTriangle2 = new RightTriangle({size:0.25});
    self.smallTriangle2.rotate(-45);
    self.smallTriangle2.centerAtPoint(-0.104,-0.284);
    self.parallelogram = new Parallelogram({size:0.25});
    self.parallelogram.rotate(-45);
    self.parallelogram.centerAtPoint(0.26,-0.472);
    self.mediumTriangle = new RightTriangle({size:0.350})
    self.mediumTriangle.rotate(180);
    self.mediumTriangle.centerAtPoint(0.26,0.252);
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
  $(canvas).click(function(event) {
    var point = mousePositionToPoint(event.offsetX,event.offsetY);
    var shapeToRotate = null;
    if(self.square.isInside(point[0],point[1])) {
        shapeToRotate = self.square;
    }
    else if (self.largeTriangle1.isInside(point[0],point[1])) {
        shapeToRotate = self.largeTriangle1;
    }
    else if (self.largeTriangle2.isInside(point[0],point[1])) {
      shapeToRotate = self.largeTriangle2;
    }
    else if (self.smallTriangle1.isInside(point[0],point[1])) {
      shapeToRotate = self.smallTriangle1;
    }
    else if (self.smallTriangle2.isInside(point[0],point[1])) {
      shapeToRotate = self.smallTriangle2;
    }
    else if (self.parallelogram.isInside(point[0],point[1])) {
      shapeToRotate = self.parallelogram;
    }
    else if (self.mediumTriangle.isInside(point[0],point[1])) {
      shapeToRotate = self.mediumTriangle;
    }
    if (!shapeToRotate) {
      return;
    }
    // rotate counter-clockwise 5 degrees
    if (event.shiftKey) {
      shapeToRotate.rotate(5);
    }
    else if(event.ctrlKey || event.altKey) {
      shapeToRotate.rotate(-5);
    }
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
    else if (self.largeTriangle2.isInside(point[0],point[1])) {
      self.dragingShape = self.largeTriangle2;
    }
    else if (self.smallTriangle1.isInside(point[0],point[1])) {
      self.dragingShape = self.smallTriangle1;
    }
    else if (self.smallTriangle2.isInside(point[0],point[1])) {
      self.dragingShape = self.smallTriangle2;
    }
    else if (self.parallelogram.isInside(point[0],point[1])) {
      self.dragingShape = self.parallelogram;
    }
    else if (self.mediumTriangle.isInside(point[0],point[1])) {
      self.dragingShape = self.mediumTriangle;
    }
  }
  var onMouseUp=function() {
    // on mouse up, dragging shape becomes null
    self.dragingShape = null;
  }
  // called every frame
  var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    theta+=0.001;
    // self.largeTriangle1.rotate(theta);
    // self.square.rotate(theta);
    // gl.uniform1f(thetaLoc,theta);
    self.largeTriangle1.loadIntoBuffer(gl);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,3);
    self.largeTriangle2.loadIntoBuffer(gl);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,3);
    self.smallTriangle1.loadIntoBuffer(gl);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,3);
    self.smallTriangle2.loadIntoBuffer(gl);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,3);
    self.square.loadIntoBuffer(gl);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    self.parallelogram.loadIntoBuffer(gl);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    self.mediumTriangle.loadIntoBuffer(gl);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,3);
    // gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    // gl.drawArrays(gl.TRIANGLE_STRIP,0,3);
    // call render again
    window.requestAnimFrame(render);
  }
  render();
}
