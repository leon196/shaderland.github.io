precision mediump float;

attribute vec4 position;
attribute vec4 color;
attribute vec3 normal;

uniform mat4 viewProjection, view;
uniform float time;
uniform vec2 resolution;
uniform vec3 camera;

varying vec4 vColor;

const float PI = 3.1415;

mat2 rotation (float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }
float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }

void main ()
{
	gl_Position = viewProjection * position;
	// gl_PointSize = 1.;
	vec3 v = normalize((view * position).xyz - camera);
	vColor = color * abs(dot(normal, v));
}