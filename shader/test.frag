precision mediump float;

varying vec2 texcoord;

void main()
{
	gl_FragColor = vec4(texcoord,0,1);
}