precision mediump float;

uniform sampler2D blueNoise;
uniform vec3 camera, target, ray, spot;
uniform vec2 resolution, frameResolution;
uniform float time, tick, seed, count, currentFrame;
uniform float mode;
uniform vec4 frameRect;

varying vec2 texcoord;

const float MODE_POSITION = 0.0;
const float MODE_COLOR = 1.0;
const float MODE_NORMAL = 2.0;

float material;
float rough;



#define PI 3.1415
#define TAU 6.283
#define repeat(p,r) (mod(p+r/2.,r)-r/2.)

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW

float hash11(float p)
{
    p = fract(p * .1031);
    p *= p + 33.33; p *= p + p; return fract(p);
}

float hash12(vec2 p)
{
    vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float hash13(vec3 p3) { p3  = fract(p3 * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash21(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx+p3.yz)*p3.zy); }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xx+p3.yz)*p3.zy); }
vec3 hash31(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }
vec3 hash32(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yxz+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }
vec3 hash33(vec3 p3) { p3 = fract(p3 * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yxz+33.33); return fract((p3.xxy + p3.yxx)*p3.zyx); }

float random (vec2 p)
{
	return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

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

// Inigo Quilez
float hash(float n) { return fract(sin(n) * 1e4); }
float noise(vec3 x) {
    const vec3 step = vec3(110, 241, 171);
    vec3 i = floor(x);
    vec3 f = fract(x);
    float n = dot(i, step);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
               mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
}

float fbm (vec3 p) {
  float amplitude = 0.5;
  float result = 0.0;
  for (float index = 0.0; index <= 3.0; ++index) {
    result += pow(abs(sin(noise(p / amplitude) * PI * 8.)), .1) * amplitude;
    amplitude /= 2.;
  }
  return result;
}

float kif(vec3 p)
{
    float scene = 1.0;
    float shape = 1.0;
    rough = 0.;
    float r = 1.5;
    float a = 1.0;
    float t =  seed;// + time * .1;//+fract(tick/100.)*.2;//+tick*.001;
    const int count = 16;
    for (int index = 0; index < count; ++index)
    {
        p.x = abs(p.x)-r*a;
        p.xz *= rot(t/a);
        p.yz *= rot(sin(t/a));
        shape = length(p)-0.85*a;
        // shape = box(p, vec3(0.1*a));
        material = shape < scene ? float(index) : material;
        scene = min(scene, shape);
        a /= 1.2;
    }
    return scene;
}

float cavern(vec3 p)
{
    float scene = 1.0;
    float shape = 1.0;
    rough = 0.;
    float r = 1.;
    float a = 1.0;
    float t =  seed;// + time * .1;//+fract(tick/100.)*.2;//+tick*.001;
    const int count = 8;
    for (int index = 0; index < count; ++index)
    {
        p.xz = abs(p.xz)-r*a;
        p.xz *= rot(t/a);
        p.yz *= rot(t/a);
        p.yx *= rot(t/a);
        shape = length(p)-1.*a;
        // shape = box(p, vec3(0.1*a));
        material = shape < scene ? float(index) : material;
        scene = min(scene, shape);
        a /= 1.5;
    }
    scene = abs(scene)-0.001;
    return scene;
}

float city(vec3 p)
{
    vec3 pp = p;
    float scene = 1.0;
    float shape = 1.0;
    rough = 0.1;
    float r = 1.;
    float a = 1.0;
    float t =  seed;//+tick*.001;
    const int count = 16;
    for (int index = 0; index < count; ++index)
    {
        p = abs(p)-r*a;
        p.xz *= rot(t/a);
        // p.yz *= rot(sin(t/a));
        // shape = length(p)-0.1*a;
        shape = max(p.x, max(p.y, p.z));
        // shape = box(p, vec3(0.1*a));
        material = shape < scene ? float(index) : material;
        scene = min(scene, shape);
        a /= 1.2;
    }
    scene = abs(scene)-0.001;
    scene = max(box(pp, vec3(5.)), scene);
    return scene;
}

float map(vec3 p)
{
    float scene = 1.0;
    // scene = kif(p);
    scene = cavern(p);
    // scene = city(p);
    // scene = p.y-1.*fbm(p*.3);
    return scene;
}

vec3 getNormal(vec3 p)
{
	vec2 e = vec2(.001, 0.);
	return normalize(.00001+vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
}

void main()
{
    vec2 uv = (texcoord*2.-1.);
    float dither = hash12(texcoord * frameResolution + seed);

    float total = 0.0;
    float shade = 1.0;
    material = 0.;
    rough = 0.0;

    vec3 eye = camera;
    vec3 at = target;
    at += (hash32(texcoord*1654.+tick+seed)*2.-1.)*.1;
    eye += (hash32(texcoord*1328.+tick+seed)*2.-1.)*.1;
    vec3 ray = look(eye, at, uv);
    vec3 pos = eye;// + ray * dither * 0.5;
    vec3 normal = vec3(0,1,0);
    vec4 color = vec4(0);

    const int steps = 30;
    const int rebounces = 2;
    int bounces = rebounces;

    for (int index = 0; index < steps; ++index)
    {
        float dist = map(pos);
        if (dist < 0.001)
        {
            if (total > 10.)
            {
                break;
            }
            else if (mode == MODE_COLOR)
            {
                // first hit
                if (bounces == rebounces)
                {
                    shade = float(steps-index)/float(steps);
                    normal = getNormal(pos);
                }

                vec3 palette = vec3(.5)+vec3(.5)*cos(vec3(1,2,3)*material*0.2);
                // palette *= mod(material, 2.);
                rough = .5;
                color.rgb += palette * shade;

                // last hit
                if (--bounces == 0)
                {
                    color.rgb /= float(rebounces);
                    break;
                }
                // bounce
                else
                {
                    vec3 rn = (hash33(pos*1000.+tick)*2.-1.);
                    if (dot(rn, normal) < 0.0) { rn *= -1.0; }
                    ray = normalize(reflect(ray, normal) + rn * rough);
                    dist = 0.1;//*dither;
                    total = 0.;
                }
            }
            else if (mode == MODE_NORMAL)
            {
                color = vec4(getNormal(pos), 1);
                break;
            }
            else if (mode == MODE_POSITION)
            {
                color = vec4(pos, 1);
                break;
            }
        }
        dist *= 0.9 + 0.1 * dither;
        total += dist;
        pos += ray * dist;
    }
    gl_FragColor = color;
}
