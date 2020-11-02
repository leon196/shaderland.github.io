precision highp float;

attribute vec4 position;
attribute vec3 normal, quantity;
attribute vec2 texcoord;

uniform vec3 camera;
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
vec2 hash21(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx+p3.yz)*p3.zy); }
vec3 hash31(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }

vec3 displace(float offset)
{
	float id = quantity.y;
	// vec3 p = normalize(hash31(quantity.y)*2.-1.) * (.9+.1*hash11(quantity.y+456.));
	// vec3 p = vec3(1.,.2*hash21(id)) * (.5+.5*hash11(id+456.));
	vec3 p = vec3(1., 0, 0);
	// p.y += (quantity.x*2.-1.)*8.;
	// p.y += (quantity.x*2.-1.)*.3;
	// float t = time*3.;
	p.xz *= rotation(offset*hash11(id+15.)*1.9);
	p.yz *= rotation(offset*hash11(id+5.)*3.1);
	p.yx *= rotation(offset*hash11(id+51.)*2.1);
	// p.xz *= rotation(p.y*2.);
	return p;
}

void main ()
{
	vec4 pos = position;
	vec2 uv = texcoord*2.-1.;
	// pos.yx *= rotation((sin(time+quantity.x))*quantity.x*.5);
	// vec3 n = (view * vec4(normal, 0)).xyz;
	// float anim = fract(time+p.z);
	float size = 1./200.;// * sin(anim*3.14);
	// size *= 1.-texcoord.y;
	// size *= smoothstep(1.0, 0.5, texcoord.y);
	// p.z = anim;
	float offset = texcoord.y * 20. + time;// + hash11(quantity.y+45.);
	vec3 p = displace(offset);
	vec3 q = displace(offset+0.1);
	vec3 z = normalize(q - p);
	vec3 c = normalize(camera - p);
	vec3 x = normalize(cross(c, z));
	vec3 y = normalize(cross(z, x));
	vec3 n = normalize(cross(z, y));
	// vec3 z = normalize(camera - p);
	// vec3 z = normalize(-p);
	// z.xz *= rotation(offset);
	// vec3 x = normalize(cross(z, vec3(0,1,0)));
	// vec3 y = normalize(cross(z, x));
	// vec3 n = normalize(cross(z,y));
	pos.xyz = x * uv.x + y * uv.y;
	pos.xyz = pos.xyz * size + p;
	gl_Position = viewProjection * pos;
	color = vec4(1);
	// color.rgb *= dot(n, c)*.5+.5;
	// color.rgb = vec3(1)*smoothstep(-1.5,1.,pos.z);
	color.rgb = mix(color.rgb, vec3(1,0,0), smoothstep(.5,-2.5,pos.y));
	// gl_PointSize = 4.;
	// color.rgb *= texcoord.x*0.5+0.5;
}