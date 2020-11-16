
var Ray = function(gl)
{
    // Parameters
    this.cursorSize = 32;
    this.dimension = 512;

    // Cursor brush
    this.cursor = 0;
    this.cursorWidth = Math.floor(this.dimension/this.cursorSize);
    this.cursorRange = this.dimension / this.cursorWidth;
    this.cursorRect = [ 0, 0, this.cursorRange, this.cursorRange ];

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

        uniforms.samplingSeed = this.samplingSeed;
            
        uniforms.mode = 0;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame.position.framebuffer);
        this.render(gl, materials['ray'], this.quad, gl.TRIANGLES);
        
        uniforms.mode = 1;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame.color.framebuffer);
        this.render(gl, materials['ray'], this.quad, gl.TRIANGLES);
        
        uniforms.mode = 2;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame.normal.framebuffer);
        this.render(gl, materials['ray'], this.quad, gl.TRIANGLES);
        
        this.cursor = (this.cursor + 1) % (this.cursorWidth * this.cursorWidth);
    }
    
    this.render = function(gl, material, geometry, mode)
    {
		gl.useProgram(material.program);
		twgl.setBuffersAndAttributes(gl, material, geometry);
		twgl.setUniforms(material, uniforms);
		twgl.drawBufferInfo(gl, geometry, mode);
    }
}