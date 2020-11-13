// Leon Denise 2020/10/01

window.onload = function() {

var button = document.getElementById('button');
button.innerHTML = 'loading';

// shaders file to load
loadFiles('shader/',['screen.vert','screen.frag','test.frag','geometry.vert','color.frag','ray.frag','point.vert'], function(shaders)
{
	const gl = document.getElementById('canvas').getContext('webgl');
	gl.getExtension('OES_texture_float');
	const m4 = twgl.m4;

	// frames point cloud
	var compute = true;
	var currentFrame = 0;
	const width = 32;
	const height = 32;
	const count = 1;
	const attachments = [ 
		{ format: gl.RGBA, type: gl.FLOAT, minMag: gl.NEAREST }
	]
	const frames = { position: [], color: [], normal: [] };
	for (var index = 0; index < count; ++index)
	{
		frames.position.push(twgl.createFramebufferInfo(gl, attachments, width, height));
		frames.color.push(twgl.createFramebufferInfo(gl, attachments, width, height));
		frames.normal.push(twgl.createFramebufferInfo(gl, attachments, width, height));
	}
	
	// point cloud
	// const clones = twgl.createBufferInfoFromArrays(gl, geometry.clone(twgl.primitives.createPlaneVertices(1, 1, 1, 1), width * height));
	// const clones = twgl.createBufferInfoFromArrays(gl, geometry.clone(primitive.quad, width * height));
	// const clones = twgl.createBufferInfoFromArrays(gl, geometry.points(width * height));
	var geometries = [];
	var attributes = null;
	var currentGeometry = 0;
	
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
		'point': ['point.vert', 'color.frag'],
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
		target: [0,0,0],
		ray: [0,0,0],
	};

	var pointSize = 0.0001;

	loadMaterials();

	function render(elapsed)
	{
		// time
		elapsed /= 1000;
		var deltaTime = elapsed - uniforms.time;
		// uniforms.time = elapsed;

		mouse.update();
		camera.update();

		var updatePointSize = mouse.delta.z != 0;
		pointSize = Math.max(0.0001, Math.min(0.1, pointSize - mouse.delta.z * 0.0002));
		mouse.delta.z = 0.0;

		// var distance = arrayLength(uniforms.camera, camera.position);
		uniforms.camera = mixArray(uniforms.camera, camera.position, 0.1);
		uniforms.target = mixArray(uniforms.target, camera.target, 0.1);
		uniforms.ray = mixArray(uniforms.ray, camera.ray, 0.1);
		uniforms.view = m4.inverse(m4.lookAt(uniforms.camera, uniforms.target, [0, 1, 0]));
		uniforms.viewProjection = m4.multiply(projection, uniforms.view);

		// if (compute)
		// if (keyboard.Space.down)
		// if (distance > 0.1)
		{
			// draw position
			uniforms.mode = 0;
			setFramebuffer(frames.position[currentFrame])
			draw(materials['ray'], quad, gl.TRIANGLES);

			// read position
			var positions = new Float32Array(width * height * 4);
			gl.bindFramebuffer(gl.FRAMEBUFFER, frames.position[currentFrame].framebuffer);
			gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, positions);

			// draw color
			uniforms.mode = 1;
			setFramebuffer(frames.color[currentFrame])
			draw(materials['ray'], quad, gl.TRIANGLES);

			// read color
			var colors = new Float32Array(width * height * 4);
			gl.bindFramebuffer(gl.FRAMEBUFFER, frames.color[currentFrame].framebuffer);
			gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, colors);

			// draw normal
			uniforms.mode = 2;
			setFramebuffer(frames.normal[currentFrame])
			draw(materials['ray'], quad, gl.TRIANGLES);

			// read normal
			var normals = new Float32Array(width * height * 4);
			gl.bindFramebuffer(gl.FRAMEBUFFER, frames.normal[currentFrame].framebuffer);
			gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, normals);
			
			// reset geometry
			if (attributes === null || updatePointSize)
			{
				attributes = geometry.pointcloud(positions, colors, normals, pointSize);
				geometries = [];
				currentGeometry = 0;
			}
			// create new geometry for 256*256 vertices limit
			else if (attributes.position.length/3 + width*height > 256*256)
			{
				attributes = geometry.pointcloud(positions, colors, normals, pointSize);
				geometries.push({});
				if (currentGeometry == 10) geometries.shift();
				else ++currentGeometry;
			}
			// merge points in geometry
			else
			{
				attributes = geometry.mergePointcloud(attributes, positions, colors, normals, pointSize);
			}

			geometries[currentGeometry] = twgl.createBufferInfoFromArrays(gl, attributes);

			currentFrame = (currentFrame + 1) % count;

			uniforms.time += deltaTime;
			uniforms.tick++;
		}
		
		// prepare render
		setFramebuffer(scene);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		
		// render scene
		for (var index = 0; index < geometries.length; ++index)
		{
			draw(materials['point'], geometries[index], gl.TRIANGLES);
		}
		
		uniforms.framePosition = frames.position[currentFrame].attachments[0];
		uniforms.frameColor = frames.color[currentFrame].attachments[0];
		uniforms.frameNormal = frames.normal[currentFrame].attachments[0];
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