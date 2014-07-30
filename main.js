function headingToRadians(degrees){
	return degrees*Math.PI/180;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

var players = [];
players.push(new Airplane({
	position: {
		x: 400,
		y: 600
	}
}));

var targets = [];

for (var i = 0; i < 15; i++) {
	targets.push(new PracticeTarget({
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

	// Iterate through all players

	for (var i = players.length - 1; i >= 0; i--) {
		players[i].update();
		players[i].display(ctx);
	};

	for (var i = targets.length - 1; i >= 0; i--) {
		targets[i].update();
		targets[i].display(ctx);
	};

	clock++;

	requestAnimationFrame(step);
}

requestAnimationFrame(step);