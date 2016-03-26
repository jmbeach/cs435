// CS 435, project 3, Jared Beach
// Program contains classes for representing words with
// cylinders
function Square(opts) {
  var self = this;
  self.size = opts.size;
  var canvas = opts.canvas;
  var w = canvas.clientWidth;
  var h = canvas.clientHeight;
  var camera = opts.camera;
  self.offset = opts.offset;
  var height = opts.height;
  var fovy = 120.0; // degrees
  var aspect = w / h;
  var near = 1;
  var far = 60;
  var P = perspective(fovy, aspect, near, far);
  var gl = opts.gl;
  self.program = opts.program;
  // create 4 points
  self.vertices = [
    vec2(-1.0 * self.size, 0.5 * self.size),
    vec2(-1.0 * self.size, -1.0 * self.size),
    vec2(1.0 * self.size, 0.5 * self.size),
    vec2(1.0 * self.size, -1.0 * self.size)
  ];
  self.uniforms = {
    MV: gl.getUniformLocation(self.program, "MV"),
    P: gl.getUniformLocation(self.program, "P"),
  };
  self.draw = function() {
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(self.vertices),gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }
  self.update = function(angle) {
    var axis = [1.0, 1.0, 1.0];
    var M = mult(translate(self.offset), rotate(angle, axis));
    var MV = mult(camera.viewMatrix, M);
    gl.useProgram(self.program);
    gl.uniformMatrix4fv(self.uniforms.P, false, flatten(P));
    gl.uniformMatrix4fv(self.uniforms.MV, false, flatten(MV));
  };
}
// Viewing transformation parameters
function Cylinder(opts) {
  var canvas = opts.canvas;
  var w = canvas.clientWidth;
  var h = canvas.clientHeight;
  var camera = opts.camera;
  var height = opts.height;
  var fovy = 120.0; // degrees
  var aspect = w / h;
  var near = 1;
  var far = 60;
  var P = perspective(fovy, aspect, near, far);
  var self = this;
  var gl = opts.gl;
  self.program = opts.program;
  self.offset = opts.offset;
  self.positions = [0.0, 0.0, 0.0];
  self.indices = [];
  self.positions.componentCount = 3;
  var sideCount = 100;
  var dTheta = 2.0 * Math.PI / sideCount;
  for (var i = 0; i < sideCount; i++) {
    var theta = i * dTheta;
    var x = Math.cos(theta);
    var y = Math.sin(theta);
    var z = 0.0;
    self.positions.push(x, y, z)
  }
  for (var i = 0; i < sideCount; i++) {
    var theta = i * dTheta;
    var x = Math.cos(theta);
    var y = Math.sin(theta);
    var z = height;
    self.positions.push(x, y, z)
  }
  self.positions.push(0.0, 0.0, 1.0);
  self.indices.push(0.0, 1.0);
  for (var i = sideCount; i > 0; i--) {
    self.indices.push(i);
  }
  self.indices.push(sideCount * 2 + 1)
  for (var i = 0; i < sideCount; i++) {
    self.indices.push(i + sideCount + 1);
  }
  self.indices.push(sideCount + 1);
  self.indices.push(1, sideCount + 1);
  for (var i = 1; i < sideCount + 1; i++) {
    self.indices.push(sideCount + 1 - i);
    self.indices.push(sideCount * 2 + 1 - i)
  }
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(self.positions), gl.STATIC_DRAW);
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(self.indices), gl.STATIC_DRAW);
  var position = gl.getAttribLocation(self.program, "vPosition");
  self.uniforms = {
    MV: gl.getUniformLocation(self.program, "MV"),
    P: gl.getUniformLocation(self.program, "P"),
  };
  self.draw = function() {
    // gl.useProgram(self.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(position, self.positions.componentCount, gl.FLOAT,
      gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(position)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    var count = sideCount + 2;
    var offset = 0;
    gl.drawElements(gl.TRIANGLE_FAN, count, gl.UNSIGNED_SHORT,
      offset);
    offset += count * 2;
    count = sideCount + 2;
    gl.drawElements(gl.TRIANGLE_FAN, count, gl.UNSIGNED_SHORT,
      offset);
    offset += count * 2;
    count = sideCount * 2 + 2;
    gl.drawElements(gl.TRIANGLE_STRIP, count, gl.UNSIGNED_SHORT,
      offset);
  }
  self.update = function(angle) {
    var axis = [1.0, 1.0, 1.0];
    var M = mult(translate(self.offset), rotate(angle, axis));
    var MV = mult(camera.viewMatrix, M);
    gl.useProgram(self.program);
    gl.uniformMatrix4fv(self.uniforms.P, false, flatten(P));
    gl.uniformMatrix4fv(self.uniforms.MV, false, flatten(MV));
  };
  self.hide = function() {
    var axis = [1.0, 1.0, 1.0];
    var M = mult(translate([-9999,-9999,-9999]), rotate(0, axis));
    var MV = mult(camera.viewMatrix, M);
    gl.useProgram(self.program);
    gl.uniformMatrix4fv(self.uniforms.P, false, flatten(P));
    gl.uniformMatrix4fv(self.uniforms.MV, false, flatten(MV));
  }
}

function Paragraph(opts) {
  var self = this;
  var id = opts.id;
  var camera = opts.camera;
  var canvas = opts.canvas;
  var gl=opts.gl;
  var program=opts.program;
  var sel = "#" + id;
  var p = $(sel);
  self.text = function() {
    return p.text().trim().toUpperCase();
  }
  self.words = [];
  var wordList = self.text().split(" ");
  for (var i = 0; i < wordList.length; i++) {
    self.words.push(new Word(wordList[i],{canvas:canvas,camera:camera,gl:gl,program:program}));
  }
  var currentWordIndex = 0;
  self.currentWord = self.words[currentWordIndex];
  self.hideCurrentWord = function() {
    self.currentWord.hide();
  }
  self.showNextWord = function(angle) {
    currentWordIndex = (currentWordIndex + 1) % wordList.length;
    self.currentWord = self.words[currentWordIndex];
    self.currentWord.draw(angle)
  }
  self.drawCurrentWord = function(angle) {
    self.currentWord.draw(angle);
  }
}

function Word(word, opts) {
  var self = this;
  var gl = opts.gl;
  var canvas = opts.canvas;
  var program = opts.program;
  var camera = opts.camera;
  self.word = word;
  self.chars = [];
  for (var i = 0; i < word.length; i++) {
    self.chars.push(new Character(word[i], {
      xoffset: -((self.word.length / 12) * 40) + i * 7,
      gl: gl,
      canvas: canvas,
      program: program,
      camera: camera
    }));
  }
  self.draw = function(angle) {
    for (var i = 0; i < self.chars.length; i++) {
      self.chars[i].draw(angle);
    }
  }
  self.hide = function() {
    for (var i = 0; i < self.chars.length; i++) {
      self.chars[i].hide();
    }
  }
}

function Character(singleChar, opts) {
  var self = this;
  self.xOffset = opts.xoffset;
  var gl = opts.gl;
  var canvas = opts.canvas;
  var program = opts.program;
  var camera = opts.camera;
  self.representedChar = singleChar.toUpperCase();
  self.matrixRepresentation = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ];
  switch (self.representedChar) {
    case "A":
      self.matrixRepresentation = [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1]
      ];
      break;
    case "B":
      self.matrixRepresentation = [
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0]
      ];
      break;
    case "C":
      self.matrixRepresentation = [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0]
      ];
      break;
    case "D":
      self.matrixRepresentation = [
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0]
      ];
      break;
    case "E":
      self.matrixRepresentation = [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1]
      ];
      break;
    case "F":
      self.matrixRepresentation = [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0]
      ];
      break;
    case "G":
      self.matrixRepresentation = [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 1]
      ];
      break;
    case "H":
      self.matrixRepresentation = [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1]
      ];
      break;
    case "I":
      self.matrixRepresentation = [
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0]
      ];
      break;
    case "J":
      self.matrixRepresentation = [
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0]
      ];
      break;
    case "K":
      self.matrixRepresentation = [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 1, 0],
        [1, 0, 1, 0, 0],
        [1, 1, 0, 0, 0],
        [1, 0, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, 0, 1]
      ];
      break;
    case "L":
      self.matrixRepresentation = [
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1]
      ];
      break;
    case "M":
      self.matrixRepresentation = [
        [1, 0, 0, 0, 1],
        [1, 1, 0, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1]
      ];
      break;
    case "N":
      self.matrixRepresentation = [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1]
      ];
      break;
    case "O":
      self.matrixRepresentation = [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0]
      ];
      break;
    case "P":
      self.matrixRepresentation = [
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0]
      ];
      break;
    case "Q":
      self.matrixRepresentation = [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 1, 0],
        [0, 1, 1, 0, 1]
      ];
      break;
    case "R":
      self.matrixRepresentation = [
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0],
        [1, 0, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, 0, 1]
      ];
      break;
    case "S":
      self.matrixRepresentation = [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0]
      ];
      break;
    case "T":
      self.matrixRepresentation = [
        [1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0]
      ];
      break;
    case "U":
      self.matrixRepresentation = [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0]
      ];
      break;
    case "V":
      self.matrixRepresentation = [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0]
      ];
      break;
    case "W":
      self.matrixRepresentation = [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 1, 0, 1, 1],
        [1, 0, 0, 0, 1]
      ];
      break;
    case "X":
      self.matrixRepresentation = [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1]
      ];
      break;
    case "Y":
      self.matrixRepresentation = [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0]
      ];
      break;
    case "Z":
      self.matrixRepresentation = [
        [1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1]
      ]
      break;
  }
  self.cylinders = [];
  for (var i = 0; i < self.matrixRepresentation.length; i++) {
    var row = self.matrixRepresentation[i];
    for (var j = 0; j < row.length; j++) {
      var dot = row[j];
      if (dot == 0) {
        continue;
      }
      self.cylinders.push(new Cylinder({
        gl: gl,
        program: program,
        canvas: canvas,
        offset: [j + self.xOffset, -i, 3.0],
        camera: camera,
        height: 1
      }))
    }
  }
  self.draw = function(angle) {
    for (var i = 0; i < self.cylinders.length; i++) {
      var cylinder = self.cylinders[i];
      cylinder.update(angle);
      cylinder.draw();
    }
  }
  self.hide = function() {
    for (var i = 0; i < self.cylinders.length; i++) {
      var cylinder = self.cylinders[i];
      cylinder.hide();
      cylinder.draw();
    }
  }
}

function Camera(opts) {
  var self = this;
  var near = opts.near;
  var far = opts.far;
  self.viewMatrix = translate(0.0, 0.0, -0.5 * (near + far));
  // this is the key
  self.rotateY = function(angle) {
    self.viewMatrix = mult(self.viewMatrix,rotate(angle,[0,1,0]));
  }
  self.rotateX = function(angle) {
    self.viewMatrix = mult(self.viewMatrix,rotate(angle,[1,0,0]));
  }
  self.rotateZ = function(angle) {
    self.viewMatrix = mult(self.viewMatrix,rotate(angle,[0,0,1]));
  }
}

function Modeling() {
  var self = this;
  var canvas,
    gl,
    vPosition,
    theta = 0.0,
    thetaLoc;
  self.theta = [45.0, 45.0, 45.0];
  var angle = 0.0;
  var dAngle = Math.PI / 2.0;
  self.shapes = [];
  self.dragingShape = null;
  // called every frame

  var setup = function() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    self.gl = gl;
    if (!gl) {
      alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 1, 0.5, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    self.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(initShaders(gl, "Cylinder-vertex-shader", "Cylinder-fragment-shader"));
    self.camera = new Camera({near:1,far:60});
    self.bigCamera = new Camera({near:1,far:35});
    self.bigCamera.rotateX(90);
    self.topCamera = new Camera({near:1,far:60});
    self.topCamera.rotateX(90)
    self.paragraph = new Paragraph({
      id: "paragraph",
      gl:gl,
      canvas:canvas,
      program: initShaders(gl, "Cylinder-vertex-shader", "Cylinder-fragment-shader"),
      camera: self.camera
    });
    self.bigCylinder = new Cylinder({
      camera:self.bigCamera,
      canvas:canvas,
      gl:gl,
      program:initShaders(gl, "Cylinder-vertex-shader", "Cylinder-fragment-shader"),
      offset:[0,-5,7.2],
      height: 15
    });
    self.topSquare = new Square({
      canvas:canvas,
      gl:gl,
      program:initShaders(gl, "Cylinder-vertex-shader", "Holder-fragment-shader"),
      offset:[0,5,7],
      size: 20,
      camera:self.topCamera
    });
    self.botCam = new Camera({
      near:1,far:60
    });
    self.botCam.rotateX(90);
    self.botomSquare = new Square({
      canvas:canvas,
      gl:gl,
      program:initShaders(gl, "Cylinder-vertex-shader", "Holder-fragment-shader"),
      offset:[0,8,22],
      size: 10,
      camera:self.botCam
    });
    vPosition = gl.getAttribLocation(self.program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    // gl.useProgram( program );


    // thetaLoc = gl.getUniformLocation(program, "theta");
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
  var cameraY = 0;
  var wordInterval = 100;
  var frame = 0;
  var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.useProgram(self.program);
    // cameraY+=0.001;
    // angle += dAngle;
    if (frame % wordInterval == 0 && frame != 0) {
      self.paragraph.hideCurrentWord();
      self.paragraph.showNextWord(angle);
    }

    self.paragraph.drawCurrentWord(angle);
    self.bigCylinder.update(0);
    self.bigCylinder.draw();
    self.topSquare.update(0);
    self.topSquare.draw();
    self.botomSquare.update(0)
    self.botomSquare.draw();
    // if(true) theta[axis] += 2.0;
    // gl.uniform3fv(thetaLoc, theta);
    // self.camera.setYRotation(cameraY);

    frame++;
    // call render again
    window.requestAnimFrame(render);
  }
  render();
}
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
