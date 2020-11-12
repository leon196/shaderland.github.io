const content = 
`h1 Shaderland
h2 Where dreams become real time
p by Leon Denise

h2 Point Cloud
p Experiment with point cloud displacement.
video Particles-4
video Particles-3
video red-dress-points
a https://artofthepointcloud.com book
a https://github.com/leon196/PointCloudExporter github

h2 Particles
video Particles-1
video Strange-Attractor
video christmasxp
a https://christmasexperiments.com/2018/15/curvelous/ christmasxp

video cookie
a https://cookie.paris/ cookie

h2 Glitch
p Datamoshing effect with shader.
video Datamosh
video datamosh3
video dancing-glitch
a https://github.com/leon196/OpticalFlowExample github
a https://vimeo.com/223954580 vimeo

h2 Emotion field
p Experiment with optical flow.
video arrows
video poutou
video arrows3
a https://vimeo.com/211762998 vimeo

h2 Curves
p Experiment with curve distribution.
video Curve-Modifier
video body-curve
a https://github.com/leon196/CurveModifier github

h2 Simulation
video boids
video Fluid
p Experiments with fluid.
`

const experiments =
`h2 Mosaic
video Particles-Leaves
p Experiments with mosaic.

h2 ShaderGum
video Shader-Gum
p Unity3D package for mesh deformation
a https://github.com/leon196/ShaderGum github

h2 Zoetrope
video Zoetrope
video zoetrope3
p Experiment with time layering.

h2 Reflection
video Three-Seconds
p Video game prototype inspired by 3" by Marc-Antoine Mathieu.

h2 Brush
video brush
video brush2
p Experiment with drawing shader.

h2 Raymarching
video Fractal1
video Fractal3
video Fractal4
p Experiment with raymarching.

h2 Face track
video Face
p Experiment with face tracking.

h2 Dance
video Morrowind
video Dance-3-3
video Winnie
p Nostalgia dance floor.
a https://vimeo.com/193054631 vimeo
`;

const games = 
`h2 Octree
video Octree
p WebGL experiment with octree.

h2 The Salt Please
video TheSaltPlease
p Video game about condiment circuit.
a http://leon196.github.io/TheSaltPlease/ play
a http://ludumdare.com/compo/ludum-dare-30/?action=preview&uid=11872 ludum
a https://github.com/leon196/TheSaltPlease github

h2 Talking Heads
video TalkingHeads
p Video game about information circuit.

h2 Drag And Glitch
video DragAndGlitch
p WebGL experiment about glitching an image.
a http://leon196.github.io/DragAndGlitch/ play
a https://www.youtube.com/watch?v=RW0ch4tGfD0 youtube
a https://github.com/leon196/DragAndGlitch github

h2 Ding Dong
video Ding-Dong
p A game about motion and movement, pixel and effects.
a https://leon.itch.io/dingdong play
a https://github.com/leon196/DingDong github

h2 W
video W
p Video game prototype about signal transmission.

h2 Glitch Processing Unit
video GlitchProcessingUnit
p Video game about glitch tweaking.
p Made with Tatiana Vilela dos Santos.
a http://mechbird.fr/gpu mechbird
`

const onmouseenter = "this.play()";
const onmouseleave = "this.pause()";
// const onclick = "if (this.paused) this.play() else this.pause()";

function buildColumn(data)
{
    var result = "<ul>\n";
    const groups = data.split('\n\n');
    groups.forEach(item => {
        result += "<li>\n";
        const lines = item.split('\n');
        lines.forEach(line => {
            const words = line.split(' ');
            const type = words[0];
            switch (type) {
                case "h1": result += "<h1>" + words.slice(1).join(' ') + "</h1>\n"; break;
                case "h2": result += "<h2>" + words.slice(1).join(' ') + "</h2>\n"; break;
                case "p": result += "<p>" + words.slice(1).join(' ') + "</p>\n"; break;
                case "a":
                    var description = words[1];
                    if (words.length > 2) description = words.slice(2).join(' ');
                    result += "<a href=\"" + words[1] + "\">" + description + "</a>\n";
                    break;
                case "video": result += "<video muted loop onmouseenter=\"" + onmouseenter + "\" onmouseleave=\"" + onmouseleave + "\"><source src=\"media/" + words[1] + ".webm\" type=\"video/webm\">The browser does not support html video</video>\n"; break;
            }
        });
        result += "</li>\n";
    });
    result += "</ul>";
    return result;
}
document.getElementById("content").innerHTML = buildColumn(content) + buildColumn(experiments
    ) + buildColumn(games);