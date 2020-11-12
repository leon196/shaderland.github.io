// Leon Denise 2020/10/01

window.onload = function() {

var button = document.getElementById('button');
button.innerHTML = 'loading';

// shaders file to load
loadFiles('shader/',['screen.vert','screen.frag','test.frag','geometry.vert','color.frag','ray.frag'], function(shaders)
{
	const gl = document.getElementById('canvas').getContext('webgl');
	gl.getExtension('OES_texture_float');
	const v3 = twgl.v3;
	const m4 = twgl.m4;

	// geometry
	const quad = twgl.createBufferInfoFromArrays(gl, primitive.quad);
	const clones = twgl.createBufferInfoFromArrays(gl, geometry.clone(twgl.primitives.createPlaneVertices(1, 1, 1, 1), 256*256));

	// camera
	var fieldOfView = 60;
	var eye = [0.1, 0.1, 2];
	var camera = m4.lookAt(eye, [0, 0, 0], [0, 1, 0]);
	var projection = m4.perspective(fieldOfView * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.01, 100.0);

	const attachments = [
		{ format: gl.RGBA, type: gl.FLOAT, minMag: gl.NEAREST }
	]
	const width = 256;
	const height = 256;
	const frame = twgl.createFramebufferInfo(gl, attachments, width, height);
	const scene = twgl.createFramebufferInfo(gl);
	var compute = true;

	var materials = {};
	var materialMap = {
		'geometry': ['geometry.vert', 'color.frag'],
		'test': ['screen.vert', 'test.frag'],
		'ray': ['screen.vert', 'ray.frag'],
		'screen': ['screen.vert', 'screen.frag'],
	};

	var uniforms = {
		time: 0,
		resolution: [gl.canvas.width, gl.canvas.height],
		view: m4.inverse(camera),
		viewProjection: m4.multiply(projection, m4.inverse(camera)),
		camera: eye,
	};

	loadMaterials();

	function render(elapsed)
	{
		// time
		elapsed /= 1000;
		var deltaTime = elapsed - uniforms.time;
		uniforms.time = elapsed;

		mouse.update();

		// camera
		var radius = 3.+mouse.drag.z;
		var height = 0.1-mouse.drag.y / 100.;
		var angle = - 3.14 / 2 - mouse.drag.x / 100;
		uniforms.camera = [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
		camera = m4.lookAt(uniforms.camera, [0, 0, 0], [0, 1, 0]);
		uniforms.view = m4.inverse(camera);
		uniforms.viewProjection = m4.multiply(projection, uniforms.view);

		if (compute)
		{
			// rays
			gl.bindFramebuffer(gl.FRAMEBUFFER, frame.framebuffer);
			gl.clearColor(0, 0, 0, 1);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.viewport(0, 0, frame.width, frame.height);
			draw(materials['ray'], quad, gl.TRIANGLES);
			uniforms.frame = frame.attachments[0];
			compute = false;
		}

		// prepare render
		gl.bindFramebuffer(gl.FRAMEBUFFER, scene.framebuffer);
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		
		// render scene
		draw(materials['geometry'], clones, gl.TRIANGLES);

		uniforms.scene = scene.attachments[0];

		// final render
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		// post process
		draw(materials['screen'], quad, gl.TRIANGLES);
		
		// loop
		requestAnimationFrame(render);
	}

	function draw(material, geometry, mode)
	{
		gl.useProgram(material.program);
		twgl.setBuffersAndAttributes(gl, material, geometry);
		twgl.setUniforms(material, uniforms);
		twgl.drawBufferInfo(gl, geometry, mode);
	}

	function onWindowResize()
	{
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		twgl.resizeFramebufferInfo(gl, scene);
		uniforms.resolution = [gl.canvas.width, gl.canvas.height];
		projection = m4.perspective(fieldOfView * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.01, 100.0);
	}

	function loadMaterials()
	{
		Object.keys(materialMap).forEach(function(key) {
			var program = twgl.createProgramInfo(gl,
				[shaders[materialMap[key][0]], shaders[materialMap[key][1]]]);
			if (program !== null) materials[key] = program;
		});
	}

	// shader hot-reload
	socket = io('http://localhost:5776');
	socket.on('change', function(data) { 
		if (data.path.includes("shader/")) {
			const url = data.path.substr("shader/".length);
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
};