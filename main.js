function headingToRadians(degrees){
	return degrees*Math.PI/180;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

// Pressed keys list

var keys = [];

window.addEventListener("keydown",	
	function(e){
		console.log('pressed', e.keyCode);
		keys[e.keyCode] = true;
	},
false);

window.addEventListener('keyup',
	function(e){
		keys[e.keyCode] = false;
	},
false);

// Main stuff

var clock = 0;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var entities = [];

entities.push(new Airplane({
	position: {
		x: 400,
		y: 600
	}
}));

for (var i = 0; i < 15; i++) {
	entities.push(new PracticeTarget({
		position:{
			x: getRandomInt(0,canvas.width),
			y: getRandomInt(0,canvas.height)
		}
	}));
};

function step(timestamp) {
	// Clear screen
	ctx.fillStyle="#ffffff"
	ctx.fillRect(0,0,canvas.width, canvas.height);

	// Iterate through all entities

	for (var i = entities.length - 1; i >= 0; i--) {
		if (!entities[i].active){
			entities.splice(i,1);
		} else {
			entities[i].update();
			entities[i].display(ctx);			
		}

	};

	clock++;

	requestAnimationFrame(step);
}

requestAnimationFrame(step);