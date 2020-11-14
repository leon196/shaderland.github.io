precision mediump float;

uniform sampler2D framePosition, frameColor;
uniform vec3 camera, target, ray;
uniform vec2 resolution, frameResolution;
uniform float time, tick, seed, count, currentFrame;
uniform float mode;

varying vec2 texcoord;

#define PI 3.1415
#define TAU 6.283

const float MODE_POSITION = 0.0;
const float MODE_COLOR = 1.0;
const float MODE_NORMAL = 2.0;

float material;
float rough;

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) { vec3 p3  = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
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

#define repeat(p,r) (mod(p+r/2.,r)-r/2.)

vec3 look(vec3 from, vec3 to, vec2 uv)
{
    vec3 z = normalize(to-from);
    vec3 x = normalize(cross(z,vec3(0,1,0)));
    vec3 y = normalize(cross(z,x));
    return normalize(z + x * uv.x + y * uv.y);
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
    result += abs(sin(noise(p / amplitude) * PI * 8.)) * amplitude;
    amplitude /= 2.;
  }
  return result;
}

float kif(vec3 p)
{
    float scene = 1.0;
    float shape = 1.0;
    rough = 2.0;
    float r = .2;
    float a = 1.0;
    float t =  seed;//+tick*.001;
    const int count = 16;
    for (int index = 0; index < count; ++index)
    {
        p.x = abs(p.x)-r*a;
        p.xz *= rot(t/a);
        p.yz *= rot(sin(t/a));
        shape = length(p)-0.1*a;
        // shape = box(p, vec3(0.1*a));
        material = shape < scene ? float(index) : material;
        scene = min(scene, shape);
        a /= 1.1;
    }
    return scene;
}

float city(vec3 p)
{
    vec3 pp = p;
    float scene = 1.0;
    float shape = 1.0;
    rough = 0.1;
    float r = .2;
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
    // scene = max(-scene, 0.);
    // scene = max(-box(camera-pp, vec3(0.1)), scene);
    // scene = max(-length(camera-pp)+0.05, scene);
    return scene;
}

// float ground(vec3 p)
// {
//     shape = p.y;
//     material = shape < scene ? 0. : material;
//     rough = shape < scene ? 0.5 : 0.;
//     scene = min(scene, shape);
// }

float map(vec3 p)
{
    float scene = 1.0;
    float shape = 1.0;
    // p = repeat(p,2.);
    // scene = box(p, vec3(0.5));
    // scene = kif(p);
    // scene = city(p);
    scene = length(p)-1.+0.1*fbm(p*4.);
    // shape = box(p, vec3(0.01,1.,0.01));
    // material = shape < scene ? 0.0 : material;
    // rough = shape < scene ? 0.1 : 0.5;
    // scene = min(scene, shape);
    
    // shape = p.y;
    // material = shape < scene ? 0. : material;
    // rough = shape < scene ? 0.5 : 0.;
    // scene = min(scene, shape);
    return scene;
}

vec3 getNormal(vec3 p)
{
	vec2 e = vec2(.0001, 0.);
	return normalize(.00001+vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
}

void main()
{
    vec3 color = vec3(0);
    vec2 uv = (texcoord*2.-1.);
    uv += (hash21(hash12(texcoord*frameResolution))*2.-1.)*1./frameResolution;
    // vec3 eye = vec3(1,1.,-1.5);
    vec3 eye = camera;
    // eye -= target;
    // eye.xz *= rot(3.14/4.);
    // eye += target;
    float t = (currentFrame / count) * TAU;// + seed;
    // float radius = 3.;
    // float radius = 8.;

    const int rebounces = 1;
    int bounces = rebounces;

    // vec3 target = vec3(0);
    // target += (hash31(tick)*2.-1.)*.1;
    vec3 at = target;
    at += (hash32(texcoord*1654.+tick)*2.-1.)*.1;
    // at.xz *= rot(3.14);
    // vec3 z = normalize(eye - target);
    // // eye = z * clamp(length(target - eye), 0., 1.);
    // vec3 x = normalize(cross(z,vec3(0,1,0)));
    // vec3 y = normalize(cross(z,x));
    // target += (x * cos(t) + y * sin(t))*0.2;

    // float radius = .1;
    // eye += (x * cos(t) + y * sin(t))*radius;
    material = 0.;
    rough = 0.0;

    // eye.xz *= rot(t * 0.1);
    // eye.yz *= rot(t * 0.1);
    // eye.yx *= rot(t * 0.1);
    // float angle = t;
    // vec2 offset = vec2(cos(angle), sin(angle))/100.;
    // vec3 eye = (hash31(tick + seed)*2.-1.)*radius;
    float dither = hash12(texcoord * resolution);
    vec3 ray = look(eye, at, uv);
    // ray.xz *= rot(3.14/4.);
    vec3 pos = eye;// + ray * dither * 0.1;
    float total = 0.0;
    float shade = 1.0;
    gl_FragColor = vec4(0);
    const int steps = 30;
    for (int index = 0; index < steps; ++index)
    {
        float dist = map(pos);
        if (dist < 0.001)
        {
            // float shade = float(steps-index)/float(steps);

            if (total + 0.001/shade > 10.)
            {
                break;
            }
            else if (mode == MODE_POSITION)
            {
                gl_FragColor = vec4(pos, 1);
                break;
            }
            else if (mode == MODE_COLOR)
            {
                // vec3 palette = vec3(0.5)+vec3(0.5)*cos(vec3(1,2,3)*(material*0.05));
                shade = float(steps-index)/float(steps);
                vec3 normal = getNormal(pos);
                float light = pow(dot(normal, -ray)*0.5+0.5, 8.);
                vec3 palette = vec3(0.5)+vec3(0.5)*cos(vec3(1,2,3)*shade*1.+vec3(1,2,3)*total);
                // palette *= 1.-mod(material, 2.);
                color += vec3(1);//palette;///float(rebounces-bounces+1);// * float(bounces)/float(rebounces);
                // color += mix(color, palette, 0.5) / float(bounces)/float(rebounces);
                // if (bounces == rebounces)
                // {
                //     color = palette;
                // }
                gl_FragColor = vec4(clamp(color * shade, 0., 1.), 1);
                // gl_FragColor = floor(gl_FragColor*lod)/lod;
                if (--bounces == 0)
                {
                    break;
                }
                else
                {
                    vec3 rn = (hash33(pos*1000.+time)*2.-1.);
                    // if (dot(rn, normal) < 0.0) { rn *= -1.0; }
                    ray = normalize(reflect(ray, normal) + rn * rough);
                    dist = 0.01;
                    total = 0.;
                }
            }
            else if (mode == MODE_NORMAL)
            {
                gl_FragColor = vec4(getNormal(pos), 1);
                break;
            }

        }
        dist *= 0.2 + 0.1 * dither;
        total += dist;
        pos += ray * dist;
    }
}
