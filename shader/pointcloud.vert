precision mediump float;

attribute vec4 position;
attribute vec4 center;
attribute vec4 color;
attribute vec4 normal;

uniform sampler2D framePosition, frameColor, frameNormal;
uniform mat4 viewProjection, view;
uniform float time, pointSize;
uniform vec2 resolution;
uniform vec3 camera;

varying vec4 vColor;

const float PI = 3.1415;

mat2 rotation (float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }
float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }
float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
vec2 hash21(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx+p3.yz)*p3.zy); }
vec3 hash31(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }

void main ()
{
	// vec4 pos = position;
	// float fade = smoothstep(0.5, 0.0, length(camera - center.xyz));
	// pos.xyz = mix(pos.xyz, center.xyz, fade);
	float shade = abs(dot(normal.xyz, normalize(position.xyz-camera)));
	shade = shade * 0.5 + 0.5;
	gl_Position = viewProjection * position;
	vColor = color * shade;
}