
const m4 = twgl.m4;
const v3 = twgl.v3;

var camera = {};

camera.position = [0,0,-1];
camera.target = [0,0,0];
camera.ray = [0,0,1];

// var radius = 3.+mouse.drag.z;
// var height = -2-mouse.drag.y / 100.;
// var angle = + 3.14 / 2 - mouse.drag.x / 100;
// var position = [Math.cos(angle) * radius, height, Math.sin(angle) * radius];

camera.update = function (deltaTime)
{
    var m = m4.identity();
    // m = m4.translate(m, camera.position);
    m = m4.axisRotate(m, [0, 1, 0], mouse.drag.x / 500);
    m = m4.axisRotate(m, [-1, 0, 0], mouse.drag.y / 500);
    m = m4.translate(m, [0,0,1]);
    const speed = 0.05 * deltaTime;
    camera.ray = m4.getTranslation(m);
    camera.right = v3.cross([0, 1, 0], camera.ray);
    if (keyboard.W.down) camera.position = v3.add(camera.position, v3.mulScalar(camera.ray, +speed));
    if (keyboard.S.down) camera.position = v3.add(camera.position, v3.mulScalar(camera.ray, -speed));
    if (keyboard.A.down) camera.position = v3.add(camera.position, v3.mulScalar(camera.right, +speed));
    if (keyboard.D.down) camera.position = v3.add(camera.position, v3.mulScalar(camera.right, -speed));
    if (keyboard.Q.down) camera.position = v3.add(camera.position, v3.mulScalar([0,1,0], -speed));
    if (keyboard.E.down) camera.position = v3.add(camera.position, v3.mulScalar([0,1,0], +speed));
    camera.target = v3.add(camera.position, camera.ray);
    // console.log(camera.target)
}