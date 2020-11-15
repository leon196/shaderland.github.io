// Leon Denise 2020/10/01

window.onload = function() {

var button = document.getElementById('button');
var debug = document.getElementById('debug');
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
	const width = 512;
	const height = 512;
	const MAXIMUM_MESHES = 20;
	const count = Math.floor(width/32);
	const attachments = [ 
		{ format: gl.RGBA, type: gl.FLOAT, minMag: gl.NEAREST }
	]
	const frames = {
		position: twgl.createFramebufferInfo(gl, attachments, width, height),
		color: twgl.createFramebufferInfo(gl, attachments, width, height),
		normal: twgl.createFramebufferInfo(gl, attachments, width, height)
	}
	
	// point cloud
	// const clones = twgl.createBufferInfoFromArrays(gl, geometry.clone(twgl.primitives.createPlaneVertices(1, 1, 1, 1), width * height));
	// const clones = twgl.createBufferInfoFromArrays(gl, geometry.clone(primitive.quad, width * height));
	// const clones = twgl.createBufferInfoFromArrays(gl, geometry.points(width * height));
	const meshCount = Math.ceil((width*height)/(256*256));
	console.log("mesh count is " + meshCount);
	console.log("vertex count is " + width*height);
	var geometries = [];
	for (var index = 0; index < meshCount; ++index)
	{
		var vertexCount = 256*256;
		if (index == meshCount-1) vertexCount = (width*height)-(meshCount-1)*256*256;
		console.log(vertexCount);
		geometries.push(twgl.createBufferInfoFromArrays(gl, geometry.points(vertexCount)));
	}
	var attributes = null;
	var currentGeometry = 0;
	
	// post process
	const scene = twgl.createFramebufferInfo(gl);
	const quad = twgl.createBufferInfoFromArrays(gl, primitive.quad);

	// camera
	var fieldOfView = 60;
	var projection = m4.perspective(fieldOfView * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.001, 100.0);

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
		camera: camera.position,
		target: camera.target,
		ray: camera.ray,
		pointSize: 4,
		blueNoise: twgl.createTexture(gl, { src: "asset/bluenoise1.jpg" }),
	};

	var pointSize = 0.001;

	loadMaterials();

	function render(elapsed)
	{
		// time
		elapsed /= 1000;
		var deltaTime = elapsed - uniforms.time;
		// uniforms.time = elapsed;

		mouse.update();
		camera.update(deltaTime);

		var updateSeed = keyboard.R.down;
		if (updateSeed)
		{
			uniforms.seed = Math.random() * 1000;
			keyboard.R.down = false;
		}

		var updatePointSize = mouse.delta.z != 0;
		// pointSize = Math.max(0.0001, Math.min(0.1, pointSize - mouse.delta.z * 0.0002));
		uniforms.pointSize = Math.max(1, Math.min(10, uniforms.pointSize - mouse.delta.z * 0.1));
		mouse.delta.z = 0.0;

		// var distance = arrayLength(uniforms.camera, camera.position);
		// var damping = Math.max(0, Math.min(1, deltaTime * 3));
		uniforms.camera = camera.position;//mixArray(uniforms.camera, camera.position, damping);
		uniforms.target = camera.target;//mixArray(uniforms.target, camera.target, damping);
		uniforms.ray = camera.ray;//mixArray(uniforms.ray, camera.ray, damping);
		uniforms.view = m4.inverse(m4.lookAt(uniforms.camera, uniforms.target, [0, 1, 0]));
		uniforms.viewProjection = m4.multiply(projection, uniforms.view);

		// if (compute)
		// if (keyboard.Space.down)
		// if (distance > 0.1)
		{
			const rect = [
				(currentFrame%count)*(width/count),
				Math.floor(currentFrame/count)*(height/count),
				width/count,
				height/count
			];
			
			uniforms.frameRect = rect;
			gl.viewport(rect[0], rect[1], rect[2], rect[3]);

			// draw position
			uniforms.mode = 0;
			gl.bindFramebuffer(gl.FRAMEBUFFER, frames.position.framebuffer);
			draw(materials['ray'], quad, gl.TRIANGLES);
			
			// draw color
			uniforms.mode = 1;
			gl.bindFramebuffer(gl.FRAMEBUFFER, frames.color.framebuffer);
			draw(materials['ray'], quad, gl.TRIANGLES);

			// draw normal
			uniforms.mode = 2;
			gl.bindFramebuffer(gl.FRAMEBUFFER, frames.normal.framebuffer);
			draw(materials['ray'], quad, gl.TRIANGLES);

			/*
			// reset geometry
			if (attributes === null || updatePointSize || updateSeed)
			{
				attributes = null;
				geometries = [];
				currentGeometry = 0;
			}
			// create new geometry for 256*256 vertices limit
			else if (attributes.position.length/3 + width*height > 256*256)
			{
				attributes = null;
				geometries.push({});
				if (currentGeometry == MAXIMUM_MESHES) geometries.shift();
				else ++currentGeometry;
			}
			attributes = geometry.pointcloud(attributes, positions, colors, normals, pointSize);

			geometries[currentGeometry] = twgl.createBufferInfoFromArrays(gl, attributes);
			*/
			currentFrame = (currentFrame + 1) % (count*count);

		}
		uniforms.framePosition = frames.position.attachments[0];
		uniforms.frameColor = frames.color.attachments[0];
		uniforms.frameNormal = frames.normal.attachments[0];
		
		// prepare render
		setFramebuffer(scene);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		
		// render scene
		for (var index = 0; index < geometries.length; ++index)
		{
			draw(materials['point'], geometries[index], gl.POINTS);
		}
		
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

		uniforms.time = elapsed;
		uniforms.tick++;
		
		// loop
		requestAnimationFrame(render);

		debug.innerHTML = "FPS: " + Math.round(1./deltaTime);

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
		projection = m4.perspective(fieldOfView * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.001, 100.0);
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