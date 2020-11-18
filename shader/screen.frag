precision mediump float;

uniform sampler2D framePosition, frameColor, frameNormal, frameFeedback, scene, bluenoise;
uniform vec2 resolution;
uniform float time;

varying vec2 texcoord;

float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }

void main() {
	vec4 color = texture2D(scene, texcoord);

	float scale = 4.;
    vec2 p = vec2(texcoord.x, texcoord.y)*vec2(resolution.x/resolution.y, 1)*scale;
    vec2 pp = fract(vec2(texcoord.x, 1.-texcoord.y)*vec2(resolution.x/resolution.y, 1)*scale);
	// color = mix(color, fract(abs(texture2D(frameFeedback, pp))), step(p.x-3., 1.) * step(p.y, 1.));
	color = mix(color, fract(abs(texture2D(frameNormal, pp))), step(p.x-2., 1.) * step(p.y, 1.));
	color = mix(color, fract(abs(texture2D(frameColor, pp))), step(p.x-1., 1.) * step(p.y, 1.));
	color = mix(color, fract(abs(texture2D(framePosition, pp))), step(p.x, 1.) * step(p.y, 1.));

	gl_FragColor = color;
}