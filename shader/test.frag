precision mediump float;

uniform vec2 resolution;

varying vec2 texcoord;

void main()
{
    vec2 p = (texcoord*2.-1.)*vec2(resolution.x/resolution.y, 1);
	gl_FragColor = vec4(smoothstep(1./100., 0.,length(p)-.5),0,0,1);
}