
const m4 = twgl.m4;
const v3 = twgl.v3;

var camera = {};

camera.position = [0,0.1,-1];
camera.target = [0,0,0];
camera.ray = [0,0,1];
camera.velocity = [0,0,0];
camera.fieldOfView = 80;
camera.projection = m4.identity();
camera.drag = { x: 0, y: 0 };
camera.volumeNormal = [0,0,1];
camera.volumeDistance = 1;
camera.inertia = 0;
camera.zoom = 1;

camera.resize = function(width, height)
{
    camera.projection = m4.perspective(camera.fieldOfView * Math.PI / 180, width / height, 0.01, 100.0);
}

// var radius = 3.+mouse.drag.z;
// var height = -2-mouse.drag.y / 100.;
// var angle = + 3.14 / 2 - mouse.drag.x / 100;
// var position = [Math.cos(angle) * radius, height, Math.sin(angle) * radius];

camera.update = function (deltaTime)
{
    var m = m4.identity();
    // m = m4.translate(m, camera.position);
    camera.zoom = mix(camera.zoom, mouse.drag.z / 10, 0.1);
    camera.drag.x = mix(camera.drag.x, mouse.drag.x / 400, 0.1);
    camera.drag.y = mix(camera.drag.y, -mouse.drag.y / 400, 0.1);
    m = m4.axisRotate(m, [0, 1, 0], camera.drag.x);
    m = m4.axisRotate(m, [-1, 0, 0], camera.drag.y);
    m = m4.translate(m, [0,0,1+camera.zoom]);
    var speed = 0.001;
    const acceleration = 0.01;
    const damping = 0.9;
    camera.ray = m4.getTranslation(m);
    camera.right = v3.cross([0, 1, 0], camera.ray);
    var direction = [0,0,0];
    
    camera.position = camera.ray;
    camera.target = [0,0,0];
/*
    if (keyboard.Shift.down) speed *= 5;
    if (keyboard.W.down) direction = v3.add(direction, camera.ray);
    if (keyboard.A.down) direction = v3.add(direction, camera.right);
    if (keyboard.S.down) direction = v3.add(direction, v3.mulScalar(camera.ray, -1));
    if (keyboard.D.down) direction = v3.add(direction, v3.mulScalar(camera.right, -1));
    if (keyboard.Q.down) direction = v3.add(direction, [0,-1,0]);
    if (keyboard.E.down) direction = v3.add(direction, [0,+1,0]);

    // if (keyboard.W.down || keyboard.A.down || keyboard.S.down || keyboard.D.down || keyboard.Q.down || keyboard.E.down)
    // {
    //     camera.inertia = Math.max(0, Math.min(1, camera.inertia + acceleration));
    // }
    // else
    // {
    //     camera.inertia *= 0.9;
    // }
    
    // if (camera.volumeDistance != 0 && camera.volumeDistance < 0.1)
    // {
    //     const collision = Math.min(1, Math.max(0, 0.01/Math.max(camera.volumeDistance, 0.0)));
    //     camera.velocity = v3.add(camera.velocity, v3.mulScalar(camera.volumeNormal, collision*speed*2));
    // }
    
    camera.velocity = v3.add(camera.velocity, v3.mulScalar(v3.normalize(direction), speed));
    camera.velocity = v3.mulScalar(camera.velocity, damping);
    camera.position = v3.add(camera.position, camera.velocity);
    camera.target = v3.add(camera.position, camera.ray);
    // console.log(camera.target)
    */
    uniforms.camera = camera.position;//mixArray(uniforms.camera, camera.position, damping);
    uniforms.target = camera.target;//mixArray(uniforms.target, camera.target, damping);
    uniforms.ray = camera.ray;//mixArray(uniforms.ray, camera.ray, damping);
    uniforms.view = m4.inverse(m4.lookAt(uniforms.camera, uniforms.target, [0, 1, 0]));
    uniforms.viewProjection = m4.multiply(camera.projection, uniforms.view);
}