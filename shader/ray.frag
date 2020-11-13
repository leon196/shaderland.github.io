precision mediump float;

uniform sampler2D framePosition, frameColor;
uniform vec3 camera;
uniform vec2 resolution, frameResolution;
uniform float time, tick, seed, count, currentFrame;
uniform float mode;

varying vec2 texcoord;

#define PI 3.1415
#define TAU 6.283

const float MODE_POSITION = 0.0;
const float MODE_COLOR = 1.0;

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) { vec3 p3  = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash13(vec3 p3) { p3  = fract(p3 * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash21(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx+p3.yz)*p3.zy); }
vec3 hash31(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }

// Inigo Quilez
// https://iquilezles.org/www/articles/distfunctions/distfunctions.htm
float box( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float smin (float a, float b, float r) {
    float h = clamp(.5+.5*(b-a)/r,0.,1.);
    return mix(b,a,h)-r*h*(1.-h);
}

#define repeat(p,r) (mod(p+r/2.,r)-r/2.)

vec3 look(vec3 from, vec3 to, vec2 uv)
{
    vec3 z = normalize(to-from);
    vec3 x = normalize(cross(z,vec3(0,1,0)));
    vec3 y = normalize(cross(z,x));
    return normalize(z * 2. + x * uv.x + y * uv.y);
}

mat2 rot(float a)
{
    float c = cos(a), s = sin(a);
    return mat2(c,-s,s,c);
}

float kif(vec3 p)
{
    float scene = 1.0;
    float r = .5;
    float a = 1.0;
    float t =  5.4;
    const int count = 16;
    for (int index = 0; index < count; ++index)
    {
        p.x = abs(p.x)-r*a;
        p.xz *= rot(t/a);
        p.yz *= rot(sin(t/a)*.5);
        scene = min(scene, length(p.xz)-0.2*a);
        a /= 1.1;
    }
    return scene;
}

float map(vec3 p)
{
    float scene = 1.0;
    // p = repeat(p,2.);
    // scene = box(p, vec3(0.5));
    scene = kif(p);
    return scene;
}

vec3 getNormal(vec3 p)
{
	vec2 e = vec2(.01, 0.);
	return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
}

void main()
{
    vec3 color = vec3(0);
    vec2 uv = (texcoord*2.-1.);
    uv += (hash21(hash12(texcoord*frameResolution))*2.-1.)*1./frameResolution;
    // vec3 eye = vec3(1,1.,-1.5);
    vec3 eye = camera;
    float t = (currentFrame / count) * TAU;// + seed;
    // float radius = 3.;
    // float radius = 8.;
    
    vec3 z = normalize(eye - vec3(0));
    vec3 x = normalize(cross(z,vec3(0,1,0)));
    vec3 y = normalize(cross(z,x));
    float radius = 1.;

    vec3 target = vec3(0);
    target += (x * cos(t) + y * sin(t))*radius;
    // eye.xz *= rot(t * 0.1);
    // eye.yz *= rot(t * 0.1);
    // eye.yx *= rot(t * 0.1);
    // float angle = t;
    // vec2 offset = vec2(cos(angle), sin(angle))/100.;
    // vec3 eye = (hash31(tick + seed)*2.-1.)*radius;
    vec3 ray = look(eye, target, uv);
    float total = 0.0;
    float shade = 0.0;
    float dither = hash12(texcoord * resolution);
    const int steps = 30;
    for (int index = 0; index < steps; ++index)
    {
        float dist = map(eye + ray * total);
        if (dist < 0.001)
        {
            shade = float(steps-index)/float(steps);
            break;
        }
        total += dist * (0.9 + 0.1 * dither);
    }

    if (total + 0.001/shade > 10.)
    {
        gl_FragColor = vec4(0);
    }
    else if (mode == MODE_POSITION)
    {
        gl_FragColor = vec4(eye + ray * total, 1);
    }
    else// if (mode == MODE_COLOR)
    {
        vec3 normal = getNormal(eye + ray * total);
        vec3 color = vec3(1,.8,.8) * pow(dot(normal, vec3(0,1,0))*0.5+0.5, 5.);
        color += vec3(.8,.8,1) * pow(dot(normal, normalize(vec3(0,1,1)))*0.5+0.5, 0.5);
        color *= pow(dot(normal, -ray)*0.5+0.5, 2.);
        gl_FragColor = vec4(color*shade, 1);
    }
}
