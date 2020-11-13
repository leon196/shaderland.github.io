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

	// frames point cloud
	var compute = true;
	var currentFrame = 0;
	const width = 256;
	const height = 256;
	const count = 10;
	const attachments = [ 
		{ format: gl.RGBA, type: gl.FLOAT, minMag: gl.NEAREST }
	]
	const frames = [];
	// const clones = [];
	for (var index = 0; index < count; ++index)
	{
		frames.push(twgl.createFramebufferInfo(gl, attachments, width, height));
		// clones.push(twgl.createBufferInfoFromArrays(gl, geometry.clone(twgl.primitives.createPlaneVertices(1, 1, 1, 1), width*height)));
	}
	
	// const clones = twgl.createBufferInfoFromArrays(gl, geometry.clone(twgl.primitives.createPlaneVertices(1, 1, 1, 1), width * height));
	const clones = twgl.createBufferInfoFromArrays(gl, geometry.points(width * height));
	
	// post process
	const scene = twgl.createFramebufferInfo(gl);
	const quad = twgl.createBufferInfoFromArrays(gl, primitive.quad);

	// camera
	var fieldOfView = 60;
	var eye = [0.1, 0.1, 2];
	var camera = m4.lookAt(eye, [0, 0, 0], [0, 1, 0]);
	var projection = m4.perspective(fieldOfView * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.01, 100.0);

	// materials
	var materials = {};
	var materialMap = {
		'geometry': ['geometry.vert', 'color.frag'],
		'test': ['screen.vert', 'test.frag'],
		'ray': ['screen.vert', 'ray.frag'],
		'screen': ['screen.vert', 'screen.frag'],
	};

	// uniforms
	var uniforms = {
		time: 0,
		tick: 0,
		count: count,
		seed: Math.random()*1000,
	};

	loadMaterials();

	function render(elapsed)
	{
		// time
		elapsed /= 1000;
		var deltaTime = elapsed - uniforms.time;
		uniforms.time = elapsed;

		// input
		mouse.update();

		// camera
		var radius = 3.+mouse.drag.z;
		var height = 0.1-mouse.drag.y / 100.;
		var angle = - 3.14 / 2 - mouse.drag.x / 100;
		var position = [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
		uniforms.camera = position;
		uniforms.target = [0,0,0];
		uniforms.view = m4.inverse(m4.lookAt(uniforms.camera, uniforms.target, [0, 1, 0]));
		uniforms.viewProjection = m4.multiply(projection, uniforms.view);


		if (compute)
		{
			// rays
			const frame = frames[currentFrame];
			gl.bindFramebuffer(gl.FRAMEBUFFER, frame.framebuffer);
			gl.clearColor(0, 0, 0, 1);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.viewport(0, 0, frame.width, frame.height);
			draw(materials['ray'], quad, gl.TRIANGLES);
			// currentFrame = (currentFrame + 1) % count;
			if (++currentFrame == count)
			{
				compute = false;
			}
		}
		else
		{
			if (keyboard.Space.down)
			{
				compute = true;
				currentFrame = 0;
			}
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
		for (var index = 0; index < count; ++index)
		{
			uniforms.frame = frames[index].attachments[0];
			draw(materials['geometry'], clones, gl.POINTS);
		}

		var animatedFrame = Math.floor((Math.sin(elapsed * 4.) * 0.5 + 0.5) * count);
		uniforms.frame = frames[animatedFrame].attachments[0];
		uniforms.scene = scene.attachments[0];
		uniforms.currentFrame = currentFrame;

		// final render
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		// post process
		draw(materials['screen'], quad, gl.TRIANGLES);
		
		uniforms.tick++;
		
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