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
	vec4 colorSpecular = vec4(1);
	vec4 colorLight = vec4(0.9,0,0,1);
	vec3 v = normalize(position.xyz - camera);
	vec3 l = normalize(position.xyz - camera - vec3(0,1,0));
	float shade = abs(dot(normal, v));
	float shadeL = dot(normal, l)*0.5+0.5;
	// float light = pow(shadeL, 4.);
	float light = shade;
	float specular = pow(shade, 40.);
	vColor = color * light;// + colorLight * light;
	// vColor = vec4(v, 1);
}