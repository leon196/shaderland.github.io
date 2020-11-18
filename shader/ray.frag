precision mediump float;

uniform sampler2D framePosition;
uniform vec3 camera, cameraVelocity, target, ray, spot;
uniform vec2 resolution, frameResolution, cursor;
uniform float time, tick, seed, count, currentFrame, fieldOfView;
uniform float mode;
uniform vec4 frameRect;

varying vec2 texcoord;

const float MODE_POSITION = 0.0;
const float MODE_COLOR = 1.0;
const float MODE_NORMAL = 2.0;
const float MODE_FEEDBACK = 3.0;
const float MODE_INIT = 4.0;

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
    return normalize(z * fieldOfView + x * uv.x + y * uv.y);
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
    result += pow(abs(sin(noise(p / amplitude) * PI * 8.)), .5) * amplitude;
    amplitude /= 2.;
  }
  return result;
}

float kif(vec3 p)
{
    float scene = 100.0;
    float shape = 100.0;
    rough = 0.;
    float r = 1.;
    float a = 1.0;
    float t =  seed + time;// + hash13(p) * 0.1;//+fract(tick/100.)*.2;//+tick*.001;
    const int count = 4;
    for (int index = 0; index < count; ++index)
    {
        p.xz = abs(p.xz)-r*a;
        // p.x = (p.x)-r*a;
        p.xz *= rot(t);
        p.yz *= rot(sin(t));
        // shape = length(p)-0.3*a;
        shape = box(p, vec3(0.5*a));
        material = shape < scene ? float(index) : material;
        scene = min(scene, shape);
        a /= 1.5;
    }
    return scene;
}

float cavern(vec3 p)
{
    vec3 pp = p;
    p.z = repeat(p.z, 4.);
    float scene = 100.0;
    float shape = 100.0;
    rough = 0.;
    float r = 1.;
    float a = 1.0;
    float t =  seed + pp.z * 0.1;// + time * .1;//+fract(tick/100.)*.2;//+tick*.001;
    const int count = 8;
    for (int index = 0; index < count; ++index)
    {
        p.xz = abs(p.xz)-r*a;
        // p.x = abs(p.x)-r*a*0.1;
        // p.x = abs(p.x)-r*a*0.1;
        // p.x = abs(p.x)-r*a*0.1;
        p.xz *= rot(t/a);
        p.yz *= rot(t/a);
        p.yx *= rot(t/a);
        shape = length(p)-1.*a;
        // shape = box(p, vec3(0.1*a));
        material = shape < scene ? float(index) : material;
        scene = min(scene, shape);
        a /= 1.5;
    }
    scene = -scene;
    scene = max(-length(pp)+1., scene);
    scene = max(-length(pp.xy)+.4, scene);
    float n = fbm(pp*1.);
    material = n * 10.;
    scene -= n*0.2;
    return scene;
}

float city(vec3 p)
{
    vec3 pp = p;

    // p = repeat(p, 5.);
    float scene = 100.0;
    float shape = 100.0;
    rough = 0.1;
    float r = .5;
    float a = 1.0;
    float t =  seed;// + hash13(floor(pp*10.)) * 3.;//+tick*.001;
    const int count = 12;
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
    scene = abs(scene)-0.01;
    scene = max(-box(pp, vec3(.5)), scene);
    return scene;
}

float map(vec3 p)
{
    float scene = 100.0;
    // scene = box(repeat(p+1., 2.), vec3(.3));
    scene = kif(p);
    // scene = length(p) - 0.5;
    // scene = cavern(p);
    // scene = city(p);
    // scene = p.y-1.*fbm(p*.3);
    return scene;
}

vec3 getNormal(vec3 p)
{
	vec2 e = vec2(.001, 0.);
	return normalize(.00001+vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
}

// Alan Zucconi
// https://www.alanzucconi.com/2016/07/01/ambient-occlusion/
float ambientOcclusion (vec3 pos, vec3 normal)
{
    float sum = 0.;
    float maxSum = 0.;
    float _AOStepSize = 0.1;
    for (int i = 0; i < 10; i ++)
    {
        vec3 p = pos + normal * float(i+1) * _AOStepSize;
        sum    += 1. / pow(2., float(i)) * map(p);
        maxSum += 1. / pow(2., float(i)) * float(i+1) * _AOStepSize;
    }
    return sum / maxSum;
}

void main2()
{
    // vec3 pos = texture2D(framePosition, texcoord+vec2(cos(time)*0.1,0)).xyz;
    vec3 hoy = vec3(step(length(texcoord*2.-1.), 0.5));
    gl_FragColor = vec4(hoy, 1);//mix(pos, hoy, 0.1), 1);
}

void main()
{
    if (mode == MODE_FEEDBACK)
    {
	    vec2 e = vec2(.1, 0.);
        vec3 c = camera + cameraVelocity;
        vec3 n = normalize(0.0001+vec3(map(c+e.xyy)-map(c-e.xyy),map(c+e.yxy)-map(c-e.yxy),map(c+e.yyx)-map(c-e.yyx)));
        gl_FragColor = vec4(n, map(c));
        return;
    }

    vec2 pixel = texcoord * frameResolution;
    float dither = hash12(pixel + seed);

    float total = 0.0;
    float shade = 1.0;
    float ao = 1.0;
    material = 0.;
    rough = 0.0;

    vec3 pos = vec3(0);
    vec3 normal = vec3(0,1,0);
    vec4 color = vec4(0);

    vec3 eye = vec3(0.01,3,0);//camera;
    vec3 at = vec3(0);//target;
    // at += (hash32(pixel+seed)*2.-1.)*.01;
    // eye += (hash32(pixel+seed+10.)*2.-1.)*.01;
    vec3 ray = look(eye, at, (texcoord*2.-1.));
    pos = eye;

    const int steps = 40;
    const int rebounces = 2;
    int bounces = rebounces;

    for (int index = 0; index < steps; ++index)
    {
        float dist = map(pos);
        if (dist < 0.001)
        {
            if (total > 40.)
            {
                break;
            }
            else if (mode == MODE_COLOR)
            {
                vec3 palette = vec3(.5)+vec3(.5)*cos(vec3(1,2,3)*material-1.0);
                // palette *= mod(material, 2.);

                // first hit
                if (bounces == rebounces)
                {
                    shade = float(steps-index)/float(steps);
                    normal = getNormal(pos);
                    ao = clamp(ambientOcclusion(pos, normal), 0., 1.);
                }

                rough = 2.;//mod(material, 2.);
                color.rgb += palette;// * pow(shade, 1.2);
                // color.rgb += vec3(1);// * shade;

                // last hit
                if (--bounces == 0)
                {
                    color.rgb /= float(rebounces);
                    color.rgb *= ao;
                    // color.rgb *= shade;
                    break;
                }
                // bounce
                else
                {
                    vec3 rn = (hash33(pos*1000.)*2.-1.);
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
