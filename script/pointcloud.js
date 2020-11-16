
var PointCloud = function(gl, ray)
{
    const v3 = twgl.v3;

    // Quantities
    this.vertexCount = 256*256;
    this.pointCount = this.vertexCount/4;
    this.dimension = Math.sqrt(this.pointCount);

    this.spot = v3.normalize([Math.random()*2-1, Math.random()*2-1, Math.random()*2-1]);

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
    this.positionsRange = new Float32Array(ray.cursorRange*ray.cursorRange*4);
    this.normalsRange = new Float32Array(ray.cursorRange*ray.cursorRange*4);
    this.colorsRange = new Float32Array(ray.cursorRange*ray.cursorRange*4);

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

    this.update = function(gl, ray)
    {
        const rect = ray.cursorRect;
        gl.bindFramebuffer(gl.FRAMEBUFFER, ray.frame.position.framebuffer);
        gl.readPixels(rect[0], rect[1], rect[2], rect[3], gl.RGBA, gl.FLOAT, this.positionsRange);
        gl.bindFramebuffer(gl.FRAMEBUFFER, ray.frame.color.framebuffer);
        gl.readPixels(rect[0], rect[1], rect[2], rect[3], gl.RGBA, gl.FLOAT, this.colorsRange);
        gl.bindFramebuffer(gl.FRAMEBUFFER, ray.frame.normal.framebuffer);
        gl.readPixels(rect[0], rect[1], rect[2], rect[3], gl.RGBA, gl.FLOAT, this.normalsRange);
        
        var size = uniforms.pointSize;
        const position = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0];

        for (var i = 0; i < ray.cursorRange*ray.cursorRange; ++i)
        {
            var index = (ray.cursor * ray.cursorRange*ray.cursorRange)%(128*128) + i;
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
        
    };

    this.reset = function()
    {
        for (var i = 0; i < this.positions.length; ++i)
        {
            this.positions[i] = 1;
        }
        twgl.setAttribInfoBufferFromArray(gl, this.buffer.attribs.position, this.positions);
    }
}