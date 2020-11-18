precision mediump float;

attribute vec4 position;
attribute vec2 texcoord;
// attribute vec4 color;
// attribute vec3 normal;

uniform sampler2D framePosition, frameColor, frameNormal;
uniform mat4 viewProjection, view;
uniform float time, pointSize, fieldOfView, seed;
uniform vec2 resolution, frameResolution;
uniform vec3 camera, target;

varying vec4 vColor;

const float PI = 3.1415;

mat2 rotation (float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }
float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }
vec2 hash21(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx+p3.yz)*p3.zy); }
vec3 hash31(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }
vec3 hash32(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yxz+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }

vec3 look(vec3 from, vec3 to, vec2 uv)
{
    vec3 z = normalize(to-from);
    vec3 x = normalize(cross(z,vec3(0,1,0)));
    vec3 y = normalize(cross(z,x));
    return normalize(z * fieldOfView + x * uv.x + y * uv.y);
}

void main ()
{
	float size = 0.01;


	// vec2 anchor = position.xy;
	// vec2 uv = hash21(position.y);
	vec4 frame = texture2D(framePosition, position.xy);
	vec3 pos = frame.xyz;
	// pos.xyz = hash31(time*100.);
	// vec3 z = normalize(camera - pos.xyz);
	// vec3 x = normalize(cross(z, vec3(0,1,0)));
	// vec3 y = normalize(cross(z, x));
	// pos.xyz += (x * anchor.x + y * anchor.y) * size;
	gl_Position = viewProjection * vec4(pos, 1);
	// gl_PointSize = pointSize * 100.;
	gl_PointSize = 4.;// + length(pos.xyz - camera);
	// vec4 colorSpecular = vec4(1);
	// vec4 colorLight = vec4(0.9,0,0,1);
	// vec3 v = normalize(pos.xyz - camera);
	// vec3 l = normalize(position.xyz - camera - vec3(0,1,0));
	// float shade = abs(dot(texture2D(frameNormal, position.xy).xyz, v));
	// float shadeL = dot(normal, l)*0.5+0.5;
	// // float light = pow(shadeL, 4.);
	// float light = shade;
	// float specular = pow(shade, 40.);
	// vColor = color * light;// + colorLight * light;
	vColor = vec4(texture2D(frameColor, position.xy));// * shade;
}