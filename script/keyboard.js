
var Key = function (code) {
    this.down = false
    this.code = code
}

var keyboard = {}

keyboard.P = new Key(80)
keyboard.Space = new Key(32)
keyboard.Shift = new Key(16)
keyboard.Control = new Key(17)
keyboard.Alt = new Key(18)
keyboard.Up = new Key(38)
keyboard.Left = new Key(37)
keyboard.Down = new Key(40)
keyboard.Right = new Key(39)
keyboard.M = new Key(77)
keyboard.W = new Key(87)
keyboard.A = new Key(65)
keyboard.S = new Key(83)
keyboard.D = new Key(68)
keyboard.R = new Key(82)
keyboard.Q = new Key(81)
keyboard.E = new Key(69)

keyboard.onKeyDown = function (event) {
    for (var propertyName in keyboard) {
        if (keyboard.hasOwnProperty(propertyName) && keyboard[propertyName] instanceof Key && event.keyCode == keyboard[propertyName].code) {
            keyboard[propertyName].down = true
        }
    }
}

keyboard.onKeyUp = function (event) {
    // console.log(event.keyCode)
    for (var propertyName in keyboard) {
        if (keyboard.hasOwnProperty(propertyName) && keyboard[propertyName] instanceof Key && event.keyCode == keyboard[propertyName].code) {
            keyboard[propertyName].down = false
        }
    }
}

var element = document.getElementById('body');
element.addEventListener('keydown', keyboard.onKeyDown, false);
element.addEventListener('keyup', keyboard.onKeyUp, false);