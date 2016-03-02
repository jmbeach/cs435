// Viewing transformation parameters
function Cylinder(opts) {
  var canvas = opts.canvas;
  var w = canvas.clientWidth;
  var h = canvas.clientHeight;
  var camera = opts.camera;
  var fovy = 120.0; // degrees
  var aspect = w / h;
  var near = 1.0; // near clipping plane's distance
  var far = 60.0; // far clipping plane's distance
  var V = translate(0.0, 0.0, -0.5 * (near + far));
  // this is the key
  V = mult(V,rotate(20,[0,1,0]));
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
    var z = 1.0;
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
    var MV = mult(V, M);
    gl.useProgram(self.program);
    gl.uniformMatrix4fv(self.uniforms.P, false, flatten(P));
    gl.uniformMatrix4fv(self.uniforms.MV, false, flatten(MV));
  };
}

function Paragraph(opts) {
  var self = this;
  var id = opts.id;
  var sel = "#" + id;
  var p = $(sel);
  self.text = function() {
    return p.text().trim().toUpperCase();
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
        camera: camera
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
}

function Camera(opts) {
  var canvas = opts.canvas;
  var aspect = canvas.clientWidth / canvas.clientHeight;
  var self = this;
  var radius = 200;
  self.cameraAngleRadians = 0;
  self.projectionMatrix = null;
  var fieldOfView = Math.radians(60);
  var makePerspective = function(fieldOfViewInRadians, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ];
  };

  var makeTranslation = function(tx, ty, tz) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1
    ];
  }

  var matrixMultiply = function(a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
      a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
      a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
      a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
      a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
      a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
      a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
      a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
      a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
      a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
      a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
      a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
      a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
      a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
      a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
      a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33
    ];
  };
  var makeXRotation = function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1
    ];
  };

  var makeYRotation = function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1
    ];
  };

  var makeZRotation = function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c, s, 0, 0, -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  }

  var makeScale = function(sx, sy, sz) {
    return [
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      0, 0, 0, 1,
    ];
  }

  var makeInverse = function(m) {
    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0 = m22 * m33;
    var tmp_1 = m32 * m23;
    var tmp_2 = m12 * m33;
    var tmp_3 = m32 * m13;
    var tmp_4 = m12 * m23;
    var tmp_5 = m22 * m13;
    var tmp_6 = m02 * m33;
    var tmp_7 = m32 * m03;
    var tmp_8 = m02 * m23;
    var tmp_9 = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
      (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
      (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
      (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
      (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
        (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
        (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
        (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
        (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
        (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
        (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
        (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
        (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
        (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
        (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
        (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
        (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
    ];
  }
  self.projectionMatrix = makePerspective(fieldOfView,aspect,1,2000);
  var cameraMatrix = makeTranslation(0, 0, radius * 1.5);
  cameraMatrix = matrixMultiply(cameraMatrix, makeYRotation(self.cameraAngleRadians));
  self.viewMatrix = makeInverse(cameraMatrix);
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
  self.paragraph = new Paragraph({
    id: "paragraph"
  });
  // called every frame
  var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.useProgram(self.program);


    angle += dAngle;
    // if(true) theta[axis] += 2.0;
    // gl.uniform3fv(thetaLoc, theta);

    self.car.draw(angle);

    // call render again
    window.requestAnimFrame(render);
  }
  var setup = function() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    self.gl = gl;
    if (!gl) {
      alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    self.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(initShaders(gl, "Cylinder-vertex-shader", "Cylinder-fragment-shader"));
    self.camera = new Camera({canvas:canvas});
    self.car = new Word("Testing", {
      gl: gl,
      canvas: canvas,
      program: initShaders(gl, "Cylinder-vertex-shader", "Cylinder-fragment-shader"),
      camera: self.camera
    });
    vPosition = gl.getAttribLocation(self.program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    // gl.useProgram( program );


    // thetaLoc = gl.getUniformLocation(program, "theta");
    render();
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
}
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
