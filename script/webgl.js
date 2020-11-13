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
	const frames = { position: [], color: [], normal: [] };
	for (var index = 0; index < count; ++index)
	{
		frames.position.push(twgl.createFramebufferInfo(gl, attachments, width, height));
		frames.color.push(twgl.createFramebufferInfo(gl, attachments, width, height));
		// frames.normal.push(twgl.createFramebufferInfo(gl, attachments, width, height));
	}
	
	// point cloud
	// const clones = twgl.createBufferInfoFromArrays(gl, geometry.clone(twgl.primitives.createPlaneVertices(1, 1, 1, 1), width * height));
	// const clones = twgl.createBufferInfoFromArrays(gl, geometry.clone(primitive.quad, width * height));
	const clones = twgl.createBufferInfoFromArrays(gl, geometry.points(width * height));
	
	// post process
	const scene = twgl.createFramebufferInfo(gl);
	const quad = twgl.createBufferInfoFromArrays(gl, primitive.quad);

	// camera
	var fieldOfView = 60;
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
		frameResolution: [width, height],
		seed: Math.random()*1000,
		camera: [0,0,0],
	};

	loadMaterials();

	function render(elapsed)
	{
		// time
		elapsed /= 1000;
		var deltaTime = elapsed - uniforms.time;
		// uniforms.time = elapsed;

		// input
		mouse.update();

		// camera
		// var radius = 3.+mouse.drag.z;
		// var height = -2-mouse.drag.y / 100.;
		// var angle = + 3.14 / 2 - mouse.drag.x / 100;
		// var position = [Math.cos(angle) * radius, height, Math.sin(angle) * radius];

		var m = m4.identity();
		m = m4.axisRotate(m, [0, 1, 0], mouse.drag.x / 1000);
		m = m4.axisRotate(m, [1,0,0], mouse.drag.y/1000);
		m = m4.translate(m, [0, 0, 0.1+Math.abs(2+mouse.drag.z)]);
		var position = m4.getTranslation(m);
		// console.log(position);
		var distance = arrayLength(uniforms.camera, position);
		uniforms.camera = mixArray(uniforms.camera, position, 0.5);
		uniforms.target = [0,0,0];
		uniforms.view = m4.inverse(m4.lookAt(uniforms.camera, uniforms.target, [0, 1, 0]));
		uniforms.viewProjection = m4.multiply(projection, uniforms.view);

		

		// if (compute)
		// {
		// if (keyboard.Space.down)
		// if (distance > 0.1)
		{
			// position
			uniforms.mode = 0;
			setFramebuffer(frames.position[currentFrame])
			draw(materials['ray'], quad, gl.TRIANGLES);

			// color
			uniforms.mode = 1;
			setFramebuffer(frames.color[currentFrame])
			draw(materials['ray'], quad, gl.TRIANGLES);

			currentFrame = (currentFrame + 1) % count;
			keyboard.Space.down = false;

			uniforms.time += deltaTime;
			uniforms.tick++;
		}
		// 	// until
		// 	if (++currentFrame == count)
		// 	{
		// 		compute = false;
		// 	}
		// }
		// else
		// {
		// 	if (keyboard.Space.down)
		// 	{
		// 		compute = true;
		// 		currentFrame = 0;
		// 	}
		// }
		
		// prepare render
		// gl.bindFramebuffer(gl.FRAMEBUFFER, scene.framebuffer);
		// gl.clearColor(0,0,0,1);
		// gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		// gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		setFramebuffer(scene);
		
		// render scene
		for (var index = 0; index < count; ++index)
		{
			uniforms.framePosition = frames.position[index].attachments[0];
			uniforms.frameColor = frames.color[index].attachments[0];
			draw(materials['geometry'], clones, gl.POINTS);
		}

		// var animatedFrame = Math.floor((Math.sin(elapsed * 4.) * 0.5 + 0.5) * count);
		// var animatedFrame = Math.floor((elapsed) % count);
		var previousFrame = (currentFrame + count - 1) % count;
		uniforms.framePosition = frames.position[previousFrame].attachments[0];
		uniforms.frameColor = frames.color[previousFrame].attachments[0];
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

	function setFramebuffer(frame)
	{
		gl.bindFramebuffer(gl.FRAMEBUFFER, frame.framebuffer);
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, frame.width, frame.height);
	}

	function setAtlas(frame)
	{
		gl.bindFramebuffer(gl.FRAMEBUFFER, frame.framebuffer);
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		var grid = [4,4];
		var x = currentFrame % grid[0];
		var y = Math.floor(currentFrame / grid[0]);
		var w = frame.width/grid[0];
		var h = frame.height/grid[1];
		gl.viewport(x*w, y*h, w, h);
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

	function mix(a, b, t)
	{
		return a + (b - a) * t;
	}

	function mixArray(arrayA, arrayB, t)
	{
		var a = [];
		for (var i = 0; i < arrayA.length; ++i) a[i] = mix(arrayA[i], arrayB[i], t);
		return a;
	}

	function arrayLength(arrayA, arrayB)
	{
		var x = arrayB[0] - arrayA[0];
		var y = arrayB[1] - arrayA[1];
		var z = arrayB[2] - arrayA[2];
		return Math.sqrt(x*x + y*y + z*z);
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