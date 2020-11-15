precision mediump float;

attribute vec4 position;
attribute vec4 color;

uniform mat4 viewProjection, view;
uniform float time, pointSize;
uniform vec2 resolution;
uniform vec3 camera;

varying vec4 vColor;

void main ()
{
	gl_Position = viewProjection * position;
	gl_PointSize = pointSize;
    vColor = color;
}