precision mediump float;

uniform sampler2D frame;
uniform vec2 resolution;
uniform float time, tick, seed;

varying vec2 texcoord;

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

float kif(vec3 p)
{
    float scene = 1.0;
    float r = 0.5;
    float a = 1.0;
    float t = time/10.;
    const int count = 4;
    for (int index = 0; index < count; ++index)
    {
        p = abs(p)-r*a;
        p.xz *= rot(t/a);
        p.yz *= rot(t/a);
        scene = min(scene, length(p)-0.5*a);
        a /= 1.8;
    }
    return scene;
}

float map(vec3 p)
{
    float scene = 1.0;
    p = repeat(p,2.);
    scene = box(p, vec3(0.5));
    return scene;
}

void main()
{
    vec3 color = vec3(0);
    vec2 uv = (texcoord*2.-1.);
    // vec3 eye = vec3(1,1.,-1);
    float t = time;
    float radius = 3.;
    // float radius = 3.+sin(t);
    // eye.xz *= rot(sin(t)*.1);
    vec3 eye = (hash31(tick + seed)*2.-1.)*radius;
    vec3 ray = look(eye, vec3(0), uv);
    float total = 0.0;
    float shade = 0.0;
    const int steps = 30;
    for (int index = 0; index < steps; ++index)
    {
        float dist = map(eye + ray * total);
        if (dist < 0.001)
        {
            shade = float(steps-index)/float(steps);
            break;
        }
        total += dist;
    }
    gl_FragColor = vec4(eye + ray * total, pow(shade, 0.5));
}