// CS 435, project 4, Jared Beach
// Program contains classes for representing scene
// with walls, spotlights, and observation stations
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
  var far = 200;
  var P = perspective(fovy, aspect, near, far);
  var gl = opts.gl;
  self.program = opts.program;
  // create 4 points
  self.vertices = [
    vec2(-1.0 * self.size, 1 * self.size),
    vec2(-1.0 * self.size, -1.0 * self.size),
    vec2(1.0 * self.size, 1 * self.size),
    vec2(1.0 * self.size, -1.0 * self.size)
  ];
  self.uniforms = {
    MV: gl.getUniformLocation(self.program, "MV"),
    P: gl.getUniformLocation(self.program, "P"),
  };
  self.draw = function() {
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(self.vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  self.update = function(angle,optAxis) {
    var axis = [1.0, 1.0, 1.0];
		if (optAxis) {
			axis = optAxis;
		}
    var M = mult(translate(self.offset), rotate(angle, axis));
    var MV = mult(camera.viewMatrix, M);
    gl.useProgram(self.program);
    gl.uniformMatrix4fv(self.uniforms.P, false, flatten(P));
    gl.uniformMatrix4fv(self.uniforms.MV, false, flatten(MV));
  };
}


function Camera(opts) {
  var self = this;
  var near = opts.near;
  var far = opts.far;
  self.viewMatrix = translate(0.0, 0.0, -0.5 * (near + far));
  // this is the key
  self.rotateY = function(angle) {
    self.viewMatrix = mult(self.viewMatrix, rotate(angle, [0, 1, 0]));
  }
  self.rotateX = function(angle) {
    self.viewMatrix = mult(self.viewMatrix, rotate(angle, [1, 0, 0]));
  }
  self.rotateZ = function(angle) {
    self.viewMatrix = mult(self.viewMatrix, rotate(angle, [0, 0, 1]));
  }
}

function Spotlight(opts) {
  var self = this;
}

function SpotlightScene() {
  var self = this;
  var canvas,
    gl,
    vPosition,
    theta = 0.0,
    thetaLoc,
		normalsArray = [];


  self.theta = [45.0, 45.0, 45.0];
  var angle = 0.0;
  var dAngle = Math.PI / 2.0;
  self.shapes = [];
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
    gl.useProgram(initShaders(gl, "vertex-shader", "fragment-shader"));
    self.camera = new Camera({
      near: 1,
      far: 160
    });

    self.botLeft = new Square({
      canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [-40, -40, 0],
      size: 20,
      camera: self.camera
    });
		self.shapes.push({shape:self.botLeft});
		self.topLeft = new Square({
      canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [-40, 0, 0],
      size: 20,
      camera: self.camera
    });
		self.shapes.push({shape: self.topLeft});
		self.topMid = new Square({
      canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [0, 0, 0],
      size: 20,
      camera: self.camera
    });
		self.shapes.push({shape: self.topMid});
		self.topRight = new Square({
      canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [40, 0, 0],
      size: 20,
      camera: self.camera
    });
		self.shapes.push({shape: self.topRight});
		self.botRight = new Square({
      canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [40, -40, 0],
      size: 20,
      camera: self.camera
    });
		self.shapes.push({shape: self.botRight});
		self.leftWall1 = new Square({
			canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [-60, 0, 20],
      size: 20,
      camera: self.camera
		});
		self.shapes.push({shape: self.leftWall1,angle:90, axis:[0,1,0]});
		self.leftWall2 = new Square({
			canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [-60, -40, 20],
      size: 20,
      camera: self.camera
		});
		self.shapes.push({shape: self.leftWall2,angle:90, axis:[0,1,0]});
		self.rightWall1 = new Square({
			canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [60, 0, 20],
      size: 20,
      camera: self.camera
		});
		self.shapes.push({shape: self.rightWall1, angle:90, axis:[0,1,0]});
		self.rightWall2 = new Square({
			canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [60, -40, 20],
      size: 20,
      camera: self.camera
		});
		self.shapes.push({shape: self.rightWall2, angle:90, axis:[0,1,0]});
		self.insideLeftWall = new Square({
			canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [-20, -40, 20],
      size: 20,
      camera: self.camera
		});
		self.shapes.push({shape: self.insideLeftWall, angle:90, axis:[0,1,0]});
		self.insideRightWall = new Square({
			canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [20, -40, 20],
      size: 20,
      camera: self.camera
		});
		self.shapes.push({shape: self.insideRightWall, angle:90, axis:[0,1,0]});
		self.leftBottomWall = new Square({
			canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [-40, -60, 20],
      size: 20,
      camera: self.camera
		});
		self.shapes.push({shape: self.leftBottomWall, angle:90, axis:[1,0,0]});
		self.midBottomWall = new Square({
			canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [0, -20, 20],
      size: 20,
      camera: self.camera
		});
		self.shapes.push({shape: self.midBottomWall, angle:90, axis:[1,0,0]});
		self.rightBottomWall = new Square({
			canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [40, -60, 20],
      size: 20,
      camera: self.camera
		});
		self.shapes.push({shape: self.rightBottomWall, angle:90, axis:[1,0,0]});
		self.leftTopWall = new Square({
			canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [-40, 20, 20],
      size: 20,
      camera: self.camera
		});
		self.shapes.push({shape: self.leftTopWall, angle:90, axis:[1,0,0]});
		self.midTopWall = new Square({
			canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [0, 20, 20],
      size: 20,
      camera: self.camera
		});
		self.shapes.push({shape: self.midTopWall, angle:90, axis:[1,0,0]});
		self.rightTopWall = new Square({
			canvas: canvas,
      gl: gl,
      program: self.program,
      offset: [40, 20, 20],
      size: 20,
      camera: self.camera
		});
		self.shapes.push({shape: self.rightTopWall, angle:90, axis:[1,0,0]});
    vPosition = gl.getAttribLocation(self.program, "aVertexPosition");
    gl.enableVertexAttribArray(vPosition);
  }
  setup();

  var mousePositionToPoint = function(x, y) {
    return vec2(
			(x - (canvas.width / 2)) / (canvas.width / 2),
			-(y - (canvas.height / 2)) / (canvas.height / 2)
		);
  }
  var cameraY = 0;
  var wordInterval = 100;
  var frame = 0;
  var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT);
		for (var i = 0; i < self.shapes.length; i++) {
			var toUpdate = self.shapes[i]
			if (!toUpdate.angle) {
				toUpdate.angle = 0;
			}
			toUpdate.shape.update(toUpdate.angle,toUpdate.axis);
			toUpdate.shape.draw();
		}
		cameraY++;
    frame++;
    // call render again
    window.requestAnimFrame(render);
  }
  render();
}
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
