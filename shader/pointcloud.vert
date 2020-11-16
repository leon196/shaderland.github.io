precision mediump float;

attribute vec4 position;
attribute vec2 texcoord;
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
vec2 hash21(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx+p3.yz)*p3.zy); }
vec3 hash31(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }

void main ()
{
	// float size = 0.01;
	// vec2 anchor = position.xy;
	// vec2 uv = hash21(position.y);
	// vec4 pos = texture2D(framePosition, position.xy);
	// pos.xyz = hash31(time*100.);
    // vec4 pos = position;
	// vec3 z = normalize(camera - pos.xyz);
	// vec3 x = normalize(cross(z, vec3(0,1,0)));
	// vec3 y = normalize(cross(z, x));
	// pos.xyz += (x * color.x + y * color.y) * size;
	gl_Position = viewProjection * position;
	gl_PointSize = pointSize;
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
	vColor = color;//texture2D(frameColor, position.xy);// * shade;
}