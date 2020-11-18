// Leon Denise 2020/10/01

window.onload = function() {

var button = document.getElementById('button');
var debug = document.getElementById('debug');
button.innerHTML = 'loading';

// shaders file to load
loadFiles('shader/',['screen.vert','screen.frag','test.frag','geometry.vert','color.frag','ray.frag','point.vert','line.vert','pointcloud.vert'], function(shaders)
{
	const gl = document.getElementById('canvas').getContext('webgl');
	gl.getExtension('OES_texture_float');
	const m4 = twgl.m4;

	const grid = twgl.createBufferInfoFromArrays(gl, geometry.grid([10,10], [10,10]));
	const ray = new Ray(gl);
	const points = twgl.createBufferInfoFromArrays(gl, geometry.points2(128));
	const pointClouds = [];
	const count = 32;
	for (var i = 0; i < count; ++i) pointClouds.push(new PointCloud(gl, ray));
	var current = 0;
	const scene = twgl.createFramebufferInfo(gl);
	const quad = twgl.createBufferInfoFromArrays(gl, primitive.quad);
	const feedback = new Float32Array(4);

	uniforms.blueNoise = twgl.createTexture(gl, { src: "asset/bluenoise1.jpg" });

	loadMaterials();

	function render(elapsed)
	{
		// time
		elapsed /= 1000;
		var deltaTime = elapsed - uniforms.time;
		
		uniforms.time = elapsed;
		uniforms.tick++;

		// input
		mouse.update();

		// point size
		uniforms.pointSize = Math.max(.001, Math.min(0.1, uniforms.pointSize - mouse.delta.z * 0.001));
		mouse.delta.z = 0.0;

		if (keyboard.R.down || keyboard.P.down)
		{
			pointClouds.forEach(pointCloud => pointCloud.reset());
		}
		if (keyboard.P.down)
		{
			uniforms.seed = Math.random() * 1000;
		}

		// camera
		camera.update(deltaTime);

		// if (uniforms.tick < 2 || uniforms.tick % 10 == 0)
		// if (uniforms.tick < 2 || keyboard.Space.down || keyboard.R.down)
		{
			keyboard.Space.down = false;
			uniforms.frameResolution = [ray.dimension, ray.dimension];
			uniforms.fieldOfView = 1.;
			ray.update(gl);
			
			uniforms.framePosition = ray.frame.position.attachments[0];
			uniforms.frameColor = ray.frame.color.attachments[0];
			uniforms.frameNormal = ray.frame.normal.attachments[0];
			uniforms.frameFeedback = ray.frame.feedback.attachments[0];

			// pointClouds[current].update(gl, ray);
			// if ((uniforms.tick * ray.cursorSize * ray.cursorSize) % (128*128) == 0)
			// {
			// 	current = (current + 1) % pointClouds.length;
			// }
			
			// gl.bindFramebuffer(gl.FRAMEBUFFER, ray.frame.feedback.framebuffer);
			// gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, feedback);
			// camera.volumeNormal = [feedback[0], feedback[1], feedback[2]];
			// camera.volumeDistance = feedback[3];
		}
		
		
		// prepare render
		setFramebuffer(scene);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		
		// render scene
		draw(materials["line"], grid, gl.LINES);
		// pointClouds.forEach(pointCloud => {
		// 	draw(materials['pointcloud'], pointCloud.buffer, gl.TRIANGLES);
		// });

		draw(materials['point'], points, gl.POINTS);
		
		// final render
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		
		// post process
		uniforms.scene = scene.attachments[0];
		draw(materials['screen'], quad, gl.TRIANGLES);
		
		// loop
		requestAnimationFrame(render);

		// debug.innerHTML = "FPS: " + Math.round(1./deltaTime);
		// debug.innerHTML += "<br/>" + formatBigNumber(pointClouds.length*256*256) + " vertices";
		// debug.innerHTML += "<br/>" + formatBigNumber(pointClouds.length*256*256/2) + " triangles";
		// debug.innerHTML += "<br/>" + camera.volumeNormal[0].toFixed(2) + " " + camera.volumeNormal[1].toFixed(2) + " " + camera.volumeNormal[2].toFixed(2);
		// debug.innerHTML += "<br/>" + camera.volumeDistance;
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
		camera.resize(gl.canvas.width, gl.canvas.height);
		uniforms.resolution = [gl.canvas.width, gl.canvas.height];
	}

	function loadMaterials()
	{
		Object.keys(materialMap).forEach(function(key) {
			var program = twgl.createProgramInfo(gl,
				[shaders[materialMap[key][0]], shaders[materialMap[key][1]]]);
			if (program !== null) materials[key] = program;
		});
	}

	function formatBigNumber(number)
	{
		var n = "" + number;
		var s = "";
		for (var c = 0; c < n.length; ++c) {
			s += n[c];//n.length - c - 1];
			if (c % 3 == 0) s += " ";
		}
		return s;
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