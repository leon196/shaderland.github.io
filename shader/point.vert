precision mediump float;

attribute vec4 position;
attribute vec4 color;

uniform mat4 viewProjection;
uniform float time;
uniform vec2 resolution;

varying vec4 vColor;

const float PI = 3.1415;

mat2 rotation (float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }
float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }

void main ()
{
	gl_Position = viewProjection * position;
	gl_PointSize = 1.;
	vColor = color;
}