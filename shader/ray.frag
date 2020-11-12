precision mediump float;

uniform sampler2D frame;
uniform vec2 resolution;
uniform float time;

varying vec2 texcoord;

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

float map(vec3 p)
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

void main()
{
    vec3 color = vec3(0);
    vec2 uv = (texcoord*2.-1.);
    vec3 eye = vec3(0,0,-3);
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
    gl_FragColor = vec4(total, shade, 0, 1);
}