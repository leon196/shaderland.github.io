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
	const pointCloud = new PointCloud(gl, 256*256);
	const scene = twgl.createFramebufferInfo(gl);
	const quad = twgl.createBufferInfoFromArrays(gl, primitive.quad);

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

		// new seed
		var updateSeed = keyboard.R.down;
		if (updateSeed)
		{
			uniforms.seed = Math.random() * 1000;
			keyboard.R.down = false;
		}

		// point size
		uniforms.pointSize = Math.max(1, Math.min(10, uniforms.pointSize - mouse.delta.z * 0.1));
		mouse.delta.z = 0.0;

		// camera
		camera.update(deltaTime);

		// if (compute)
		// if (keyboard.Space.down)
		// if (distance > 0.1)
		{
			pointCloud.update(gl);
			
			uniforms.framePosition = pointCloud.frame.position.attachments[0];
			uniforms.frameColor = pointCloud.frame.color.attachments[0];
			uniforms.frameNormal = pointCloud.frame.normal.attachments[0];
		}
		
		// prepare render
		setFramebuffer(scene);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		
		// render scene
		draw(materials["line"], grid, gl.LINES);
		draw(materials['pointcloud'], pointCloud.buffer, gl.TRIANGLES);
		
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