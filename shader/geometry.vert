precision mediump float;

attribute vec4 position;

uniform mat4 view, viewProjection;
uniform vec2 resolution;
uniform float time;

varying vec4 color;

const float PI = 3.1415;

mat2 rotation (float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) { vec3 p3  = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash13(vec3 p3) { p3  = fract(p3 * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 hash31(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }


void main ()
{
	vec4 pos = position;
	pos.xyz = hash31(position.y)*2.-1.;
	vec3 normal = normalize(pos.xyz);
	normal.xz *= rotation(time * hash11(position.y));
	normal.yz *= rotation(time + sin(time * hash11(position.y+35.) * 20.) * 0.2 * hash11(position.y+45.));
	pos.xyz = normal*.5;
	gl_Position = viewProjection * pos;
	normal = (view * vec4(normal, 0)).xyz;
	float shade = dot(normal, vec3(0,0,1));
	gl_PointSize = 20.*pow(1.-max(0.,shade), .1);//*smoothstep(1., 0., length(pos.xyz));
	color = vec4(shade*0.5+0.5);
}