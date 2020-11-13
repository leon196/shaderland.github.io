precision highp float;

attribute vec4 position;
attribute vec3 normal, quantity;
attribute vec2 texcoord, frameResolution;

uniform sampler2D framePosition, frameColor;
uniform vec3 camera;
uniform mat4 view, viewProjection;
uniform vec2 resolution;
uniform float time;

varying vec2 uv;
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

float neighborDistance(vec3 pos, vec2 p)
{
	vec3 e = vec3(1./frameResolution, 0);
	float dist = 0.;
	dist += length(texture2D(framePosition, p+e.xz).xyz-pos);
	dist += length(texture2D(framePosition, p-e.xz).xyz-pos);
	dist += length(texture2D(framePosition, p+e.zy).xyz-pos);
	dist += length(texture2D(framePosition, p-e.zy).xyz-pos);
	return dist;
}

void main ()
{
	// uv = texcoord*2.-1.;
	// uv = position.xy;
	// vec4 pos = position;
	// float size = 1./400.;
	float id = position.y;
	vec2 p = hash21(id);
	// p = normalize(p) * pow(length(p), 0.5);
	// vec4 ray = texture2D(framePosition, hash21(position.y));
	// pos.xyz = ray.xyz;
	// p.z = ray.r - 2.;
	// p.xy = p.xy * 2. - 1.;
	vec4 pos = texture2D(framePosition, p);
	// vec3 z = normalize(camera - pos.xyz);
	// vec3 x = normalize(cross(z, vec3(0,1,0)));
	// vec3 y = normalize(cross(z, x));
	// pos.xyz += (x * uv.x - y * uv.y) * size;
	gl_Position = viewProjection * pos;
	// gl_Position.xy += vec2(uv.x, -uv.y) * 0.01;
	gl_PointSize = 2.;
	color = texture2D(frameColor, p);//*(0.8+.2*hash11(quantity.y)));
	// color = vec4(getNormal(p), 1);
	// uv = texcoord;
}