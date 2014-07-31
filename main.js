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

// retina fixes
canvas.width = parseInt(window.getComputedStyle(canvas).width)*2;
canvas.height = parseInt(window.getComputedStyle(canvas).height)*2;

ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

var entities = [];

entities.push(new Airplane({
	position: {
		x: 800,
		y: 600
	}, 
	id: 0,
	controls: {
		left: 37,
		right: 39,
		fire: 38
	}
}));

entities.push(new Airplane({
	position: {
		x: 400,
		y: 600
	}, 
	id: 1,
	controls: {
		left: 65,
		right: 68,
		fire: 87
	}
}));

for (var i = 0; i < 15; i++) {
	entities.push(new PracticeTarget({
		position:{
			x: getRandomInt(0,canvas.width/2),
			y: getRandomInt(0,canvas.height/2)
		}
	}));
};

function step(timestamp) {
	clearScreen();

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