precision mediump float;

uniform sampler2D frame, frameBlur;
uniform vec2 resolution;
uniform float time;

varying vec2 texcoord;

float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }

void main() {
	gl_FragColor = texture2D(frame, texcoord);
	
}