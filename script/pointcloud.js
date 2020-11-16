
var PointCloud = function(gl)
{
    const v3 = twgl.v3;

    // Parameters
    this.cursorSize = 32;

    // Quantities
    this.vertexCount = 256*256;
    this.pointCount = this.vertexCount/4;
    this.dimension = Math.sqrt(this.pointCount);
    
    // Cursor brush
    this.cursor = 0;
    this.cursorWidth = Math.floor(this.dimension/this.cursorSize);
    this.cursorRange = this.dimension / this.cursorWidth;
    this.cursorRect = [ 0, 0, this.cursorRange, this.cursorRange ];

    // Attribute arrays
    this.positions = new Float32Array(this.vertexCount*4);
    this.normals = new Float32Array(this.vertexCount*4);
    this.colors = new Float32Array(this.vertexCount*4);
    
    var size = 0.01;
    const position = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0];

    for (var i = 0; i < this.pointCount; ++i)
    {
        var pos = [ Math.random(), Math.random(), Math.random() ];
        var z = [ 0.001, 0.001, -1.0 ];
        var x = v3.normalize(v3.cross(z, [0,1,0]));
        var y = v3.normalize(v3.cross(x, z));
        const color = [Math.random(),Math.random(),Math.random(),Math.random()];
        for (var v = 0; v < 4; ++v)
        {
            const xx = position[v*3];
            const yy = position[v*3+1];
            const ii = i*4*4 + v*4;
            this.positions[ii + 0] = pos[0] + (x[0]*xx + y[0]*yy) * size;
            this.positions[ii + 1] = pos[1] + (x[1]*xx + y[1]*yy) * size;
            this.positions[ii + 2] = pos[2] + (x[2]*xx + y[2]*yy) * size;
            this.positions[ii + 3] = 1;
            this.colors[ii + 0] = color[0];
            this.colors[ii + 1] = color[1];
            this.colors[ii + 2] = color[2];
            this.colors[ii + 3] = color[3];
        }
    }

    // Range arrays to read frame buffer
    this.positionsRange = new Float32Array(this.cursorRange*this.cursorRange*4);
    this.normalsRange = new Float32Array(this.cursorRange*this.cursorRange*4);
    this.colorsRange = new Float32Array(this.cursorRange*this.cursorRange*4);

    this.indices = [];
    const indices = [0, 1, 2, 2, 3, 0];
    for (var index = 0; index < this.pointCount; ++index)
    {
        for (var t = 0; t < 6; ++t) this.indices.push(index * 4 + indices[t]);
    }

    this.attributes =
    {
        position: { data:this.positions, numComponents: 4, drawType: gl.DYNAMIC_DRAW },
        normal: { data:this.normals, numComponents: 4, drawType: gl.DYNAMIC_DRAW },
        color: { data:this.colors, numComponents: 4, drawType: gl.DYNAMIC_DRAW },
        indices: { data:this.indices, numComponents: 1 },
    };
    
    this.buffer = twgl.createBufferInfoFromArrays(gl, this.attributes);
    
    // Framebuffers
	const attachments = [ { format: gl.RGBA, type: gl.FLOAT, minMag: gl.NEAREST } ]
	this.frame = {
		position: twgl.createFramebufferInfo(gl, attachments, this.dimension, this.dimension),
		normal: twgl.createFramebufferInfo(gl, attachments, this.dimension, this.dimension),
		color: twgl.createFramebufferInfo(gl, attachments, this.dimension, this.dimension),
    }

    this.quad = twgl.createBufferInfoFromArrays(gl, primitive.quad);

    this.update = function(gl)
    {
        const rect = [
            Math.floor(this.cursor % this.cursorWidth) * this.cursorRange,
            Math.floor(this.cursor / this.cursorWidth) * this.cursorRange,
            this.cursorRange,
            this.cursorRange
        ];

        this.cursorRect = rect;
        
        gl.viewport(rect[0], rect[1], rect[2], rect[3]);
            
        uniforms.mode = 0;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame.position.framebuffer);
        this.render(gl, materials['ray'], this.quad, gl.TRIANGLES);
        gl.readPixels(rect[0], rect[1], rect[2], rect[3], gl.RGBA, gl.FLOAT, this.positionsRange);
        
        uniforms.mode = 1;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame.color.framebuffer);
        this.render(gl, materials['ray'], this.quad, gl.TRIANGLES);
        gl.readPixels(rect[0], rect[1], rect[2], rect[3], gl.RGBA, gl.FLOAT, this.colorsRange);
        
        uniforms.mode = 2;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame.normal.framebuffer);
        this.render(gl, materials['ray'], this.quad, gl.TRIANGLES);
        gl.readPixels(rect[0], rect[1], rect[2], rect[3], gl.RGBA, gl.FLOAT, this.normalsRange);
        
        var size = 0.01;
        const position = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0];

        for (var i = 0; i < this.cursorRange*this.cursorRange; ++i)
        {
            var index = this.cursor * this.cursorRange*this.cursorRange + i;
            var pos = [ this.positionsRange[i*4], this.positionsRange[i*4+1], this.positionsRange[i*4+2] ];
            var z = [ this.normalsRange[i*4], this.normalsRange[i*4+1], this.normalsRange[i*4+2] ];
            var x = v3.normalize(v3.cross(z, [0,1,0]));
            var y = v3.normalize(v3.cross(x, z));
            
            for (var v = 0; v < 4; ++v)
            {
                const ii = index*4*4 + v*4;
                const xx = position[v*3];
                const yy = position[v*3+1];
                this.positions[ii + 0] = pos[0] + (x[0]*xx + y[0]*yy) * size;
                this.positions[ii + 1] = pos[1] + (x[1]*xx + y[1]*yy) * size;
                this.positions[ii + 2] = pos[2] + (x[2]*xx + y[2]*yy) * size;
                this.colors[ii+0] = this.colorsRange[i*4+0];
                this.colors[ii+1] = this.colorsRange[i*4+1];
                this.colors[ii+2] = this.colorsRange[i*4+2];
                this.colors[ii+3] = this.colorsRange[i*4+3];
            }
        }
        
        twgl.setAttribInfoBufferFromArray(gl, this.buffer.attribs.position, this.positions);
        // twgl.setAttribInfoBufferFromArray(gl, this.buffer.attribs.normal, this.normals);
        twgl.setAttribInfoBufferFromArray(gl, this.buffer.attribs.color, this.colors);
        
        this.cursor = (this.cursor + 1) % (this.cursorWidth * this.cursorWidth);
    };
    
    this.render = function(gl, material, geometry, mode)
    {
		gl.useProgram(material.program);
		twgl.setBuffersAndAttributes(gl, material, geometry);
		twgl.setUniforms(material, uniforms);
		twgl.drawBufferInfo(gl, geometry, mode);
    }
}