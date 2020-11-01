var mouse = {};

mouse.x = 0;
mouse.y = 0;
mouse.z = 0;
mouse.delta = { x: 0, y: 0, z: 0 };
mouse.last = { x: 0, y: 0, z: 0 };
mouse.clic = false;

mouse.onmove = function(event)
{
  event.preventDefault();
	mouse.x = event.clientX;
	mouse.y = event.clientY;
};

mouse.update = function(elapsed)
{
  mouse.delta.x = mouse.last.x - mouse.x;
  mouse.delta.y = mouse.last.y - mouse.y;
  mouse.last.x = mouse.x;
  mouse.last.y = mouse.y;
  mouse.delta.z *= 0.5;
}

mouse.onmousedown = function(event)
{
  event.preventDefault();
	mouse.clic = true;
};

mouse.onmouseup = function(event)
{
  event.preventDefault();
	mouse.clic = false;
};

mouse.onmouseout = function(event)
{
  event.preventDefault();
  mouse.clic = false;
  mouse.delta.x = 0;
  mouse.delta.y = 0;
};

mouse.onwheel = function(event)
{
  // console.log(event.deltaY);
  if (event.deltaY > 0) {
    mouse.delta.z += 0.1;
  } else {
    mouse.delta.z -= 0.1;
  }
};

var element = document.getElementById('body');
element.addEventListener('mousemove', mouse.onmove, false);
element.addEventListener('mousedown', mouse.onmousedown, false);
element.addEventListener('mouseout', mouse.onmouseout, false);
element.addEventListener('mouseup', mouse.onmouseup, false);
element.addEventListener('wheel', mouse.onwheel, false);