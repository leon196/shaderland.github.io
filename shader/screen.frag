precision mediump float;

uniform sampler2D frame, frameBlur;
uniform vec2 resolution;
uniform float time;

varying vec2 texcoord;

float random (in vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }

void main() {
	// float lod = 50.;
	vec4 color = texture2D(frame, texcoord);
	vec4 blur = texture2D(frameBlur, texcoord);

    vec2 p = (texcoord*2.-1.)*vec2(resolution.x/resolution.y, 1);

	gl_FragColor = color;
	// gl_FragColor = mix(color, blur, smoothstep(0., 1.,length(p)));
	// gl_FragColor = vec4(pow(texture2D(frameBlur, texcoord).r, .5));
	// gl_FragColor = ceil(gl_FragColor*lod)/lod;

}