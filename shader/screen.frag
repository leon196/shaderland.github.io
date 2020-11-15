precision mediump float;

uniform sampler2D framePosition, frameColor, frameNormal, scene, bluenoise;
uniform vec2 resolution;
uniform float time;

varying vec2 texcoord;

float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }

void main() {
	// float lod = 50.;
	vec4 color = texture2D(scene, texcoord);

    vec2 p = vec2(texcoord.x, 1.-texcoord.y)*vec2(resolution.x/resolution.y, 1)*8.;
	color = mix(color, fract(abs(texture2D(frameNormal, p-vec2(2,0)))), step(p.x-2., 1.) * step(p.y, 1.));
	color = mix(color, fract(abs(texture2D(frameColor, p-vec2(1,0)))), step(p.x-1., 1.) * step(p.y, 1.));
	color = mix(color, fract(abs(texture2D(framePosition, p))), step(p.x, 1.) * step(p.y, 1.));

	gl_FragColor = color;
	// gl_FragColor = mix(color, blur, smoothstep(0., 1.,length(p)));
	// gl_FragColor = vec4(pow(texture2D(frameBlur, texcoord).r, .5));
	// gl_FragColor = ceil(gl_FragColor*lod)/lod;

}