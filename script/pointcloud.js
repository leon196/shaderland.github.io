
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
    this.centers = new Float32Array(this.vertexCount*4);
    this.normals = new Float32Array(this.vertexCount*4);
    this.colors = new Float32Array(this.vertexCount*4);
    
    for (var i = 0; i < this.positions.length; ++i)
    {
        this.positions[i] = 1;
    }

    // Range arrays to read frame buffer
    this.positionsRange = new Float32Array(ray.cursorRange*ray.cursorRange*4);
    this.centersRange = new Float32Array(ray.cursorRange*ray.cursorRange*4);
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
        center: { data:this.centers, numComponents: 4, drawType: gl.DYNAMIC_DRAW },
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
        
        var pointSize = (0.5+0.5*Math.pow(Math.random(), 3))*uniforms.pointSize;
        const position = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0];
        const stretch = [1, 1];

        for (var i = 0; i < ray.cursorRange*ray.cursorRange; ++i)
        {
            var index = (ray.cursor * ray.cursorRange*ray.cursorRange)%(128*128) + i;
            var pos = [ this.positionsRange[i*4], this.positionsRange[i*4+1], this.positionsRange[i*4+2] ];
            var z = [ this.normalsRange[i*4], this.normalsRange[i*4+1], this.normalsRange[i*4+2] ];
            var x = v3.normalize(v3.cross(z, [0,1,0]));
            var y = v3.normalize(v3.cross(x, z));

            const size = pointSize;// * Math.pow(v3.distance(camera.position, pos)/10., .5);
            var bias = 0.;//Math.random()*0.01;///size;
            
            for (var v = 0; v < 4; ++v)
            {
                const ii = index*4*4 + v*4;
                const xx = position[v*3]*stretch[0];
                const yy = position[v*3+1]*stretch[1];
                this.positions[ii + 0] = pos[0] + (x[0]*xx + y[0]*yy) * size + z[0] * bias;
                this.positions[ii + 1] = pos[1] + (x[1]*xx + y[1]*yy) * size + z[1] * bias;
                this.positions[ii + 2] = pos[2] + (x[2]*xx + y[2]*yy) * size + z[2] * bias;
                for (var c = 0; c < 4; ++c)
                {
                    this.colors[ii+c] = this.colorsRange[i*4+c];
                }
                for (var c = 0; c < 3; ++c)
                {
                    this.normals[ii+c] = z[c];
                    this.centers[ii+c] = pos[c];
                }
            }
        }
        
        twgl.setAttribInfoBufferFromArray(gl, this.buffer.attribs.position, this.positions);
        twgl.setAttribInfoBufferFromArray(gl, this.buffer.attribs.center, this.centers);
        twgl.setAttribInfoBufferFromArray(gl, this.buffer.attribs.color, this.colors);
        twgl.setAttribInfoBufferFromArray(gl, this.buffer.attribs.normal, this.normals);
        
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