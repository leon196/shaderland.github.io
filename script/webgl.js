// Leon Denise 
// Cookie Party Invitro 2019

window.onload = function () {

var button = document.getElementById('button');
button.innerHTML = 'loading';

// shaders file to load
loadFiles('shader/',['screen.vert','blur.frag','screen.frag','test.frag'], function(shaders)
{
	const gl = document.getElementById('canvas').getContext('webgl');
	const v3 = twgl.v3;
	const m4 = twgl.m4;

	// geometry
	const geometryQuad = twgl.createBufferInfoFromArrays(gl, {
		position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
	});

	// camera
	var fieldOfView = 80;
	var camera = m4.lookAt([1, 2, -4], [0, 0, 0], [0, 1, 0]);
	var projection = m4.perspective(fieldOfView * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.01, 100.0);

	// framebuffers
	var frameScreen = twgl.createFramebufferInfo(gl);
	var frameBlurA = twgl.createFramebufferInfo(gl);
	var frameBlurB = twgl.createFramebufferInfo(gl);
	var frameToResize = [frameScreen, frameBlurA, frameBlurB];

	var materials = {};
	var materialMap = {
		'blur': ['screen.vert', 'blur.frag'],
		'test': ['screen.vert', 'test.frag'],
		'screen': ['screen.vert', 'screen.frag']
	};

	var uniforms = {
		time: 0,
		resolution: [gl.canvas.width, gl.canvas.height],
		viewProjection: m4.multiply(projection, m4.inverse(camera)),
	};

	loadMaterials();


	function render(elapsed)
	{
		elapsed /= 1000;

		var deltaTime = elapsed - uniforms.time;
		uniforms.time = elapsed;

		// render scene
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameScreen.framebuffer);
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		// gl.enable(gl.BLEND);
		// gl.blendFunc(gl.ONE, gl.ONE);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// draw(materials['geometry'], geometryLine, gl.LINES);
		drawFrame(materials['test'], geometryQuad, frameScreen.framebuffer);

		// gaussian blur
		var iterations = 8;
		var writeBuffer = frameBlurA;
		var readBuffer = frameBlurB;
		for (var i = 0; i < iterations; i++) {
			var radius = (iterations - i - 1)
			if (i === 0) uniforms.frame = frameScreen.attachments[0];
			else uniforms.frame = readBuffer.attachments[0];
			uniforms.flip = true;
			uniforms.direction = i % 2 === 0 ? [radius, 0] : [0, radius];
			drawFrame(materials['blur'], geometryQuad, writeBuffer.framebuffer);
			var t = writeBuffer;
			writeBuffer = readBuffer;
			readBuffer = t;
		}

		// final composition
		uniforms.frame = frameScreen.attachments[0];
		uniforms.frameBlur = writeBuffer.attachments[0];
		drawFrame(materials['screen'], geometryQuad, null);

		requestAnimationFrame(render);
	}
	function drawFrame(shader, geometry, frame) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		draw(shader, geometry, gl.TRIANGLES);
	}
	function draw(shader, geometry, mode) {
		gl.useProgram(shader.program);
		twgl.setBuffersAndAttributes(gl, shader, geometry);
		twgl.setUniforms(shader, uniforms);
		twgl.drawBufferInfo(gl, geometry, mode);
	}
	function onWindowResize() {
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		for (var index = 0; index < frameToResize.length; ++index)
			twgl.resizeFramebufferInfo(gl, frameToResize[index]);
		uniforms.resolution = [gl.canvas.width, gl.canvas.height];
	}
	function loadMaterials() {
		Object.keys(materialMap).forEach(function(key) {
			materials[key] = twgl.createProgramInfo(gl,
				[shaders[materialMap[key][0]],shaders[materialMap[key][1]]]); });
	}

	// shader hot-reload
	socket = io('http://localhost:5776');
	socket.on('change', function(data) { 
		if (data.path.includes("demo/shader/")) {
			const url = data.path.substr("demo/shader/".length);
			loadFiles("shader/",[url], function(shade) {
				shaders[url] = shade[url];
				loadMaterials();
			});
		}
	});

	onWindowResize();
	window.addEventListener('resize', onWindowResize, false);
	requestAnimationFrame(render);
	button.innerHTML = '';
});
}