var mouse = {};

mouse.x = 0;
mouse.y = 0;
mouse.z = 0;
mouse.delta = { x: 0, y: 0, z: 0 };
mouse.drag = { x: 0, y: 0, z: 0 };
mouse.last = { x: 0, y: 0, z: 0 };
mouse.clic = false;
mouse.firstFrame = true;
mouse.touch = false;

mouse.onmove = function(event)
{
  event.stopPropagation();
  event.preventDefault();
	mouse.x = event.clientX;
	mouse.y = event.clientY;
};

mouse.ontouchmove = function(event)
{
  event.stopPropagation();
  event.preventDefault();
  // mouse.touch = true;
  // mouse.delta.x = mouse.last.x - mouse.x;
  // mouse.delta.y = mouse.last.y - mouse.y;
  // if (mouse.clic) {
    // mouse.drag.x += mouse.delta.x;
    // mouse.drag.y += mouse.delta.y;
  // }
  mouse.x = event.changedTouches[0].clientX;
  mouse.y = event.changedTouches[0].clientY;
  // mouse.last.x = mouse.x;
  // mouse.last.y = mouse.y;
};

mouse.update = function(elapsed)
{
  if (!mouse.firstFrame)
  {
    mouse.delta.x = mouse.last.x - mouse.x;
    mouse.delta.y = mouse.last.y - mouse.y;
    if (mouse.clic) {
      mouse.drag.x += mouse.delta.x;
      mouse.drag.y += mouse.delta.y;
    }
    mouse.drag.z += mouse.delta.z;
  }
  else
  {
    mouse.firstFrame = false;
  }
  mouse.last.x = mouse.x;
  mouse.last.y = mouse.y;
}

mouse.onmousedown = function(event)
{
  event.stopPropagation();
  event.preventDefault();
	mouse.clic = true;
};

mouse.ontouchdown = function(event)
{
  event.stopPropagation();
  event.preventDefault();
  element.requestFullscreen();
  mouse.clic = true;
  mouse.x = event.changedTouches[0].clientX;
  mouse.y = event.changedTouches[0].clientY;
};

mouse.onmouseup = function(event)
{
  event.stopPropagation();
  event.preventDefault();
	mouse.clic = false;
};

mouse.onmouseout = function(event)
{
  event.stopPropagation();
  event.preventDefault();
  mouse.clic = false;
  mouse.delta.x = 0;
  mouse.delta.y = 0;
};

mouse.onwheel = function(event)
{
  event.stopPropagation();
  event.preventDefault();
  if (event.deltaY > 0) {
    mouse.delta.z += 1;
  } else {
    mouse.delta.z -= 1;
  }
};

var element = document.getElementById('canvas');
element.addEventListener('mousemove', mouse.onmove, false);
element.addEventListener('mousedown', mouse.onmousedown, false);
element.addEventListener('mouseout', mouse.onmouseout, false);
element.addEventListener('mouseup', mouse.onmouseup, false);
element.addEventListener('wheel', mouse.onwheel, false);
element.addEventListener('touchstart', mouse.ontouchdown, false);
element.addEventListener('touchmove', mouse.ontouchmove, false);
element.addEventListener('touchleave', mouse.onmouseout, false);
element.addEventListener('touchcancel', mouse.onmouseout, false);
element.addEventListener('touchend', mouse.onmouseup, false);