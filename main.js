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

// Setup stuff

var clock = 0;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// Retina fixes
canvas.width = parseInt(window.getComputedStyle(canvas).width)*window.devicePixelRatio;
canvas.height = parseInt(window.getComputedStyle(canvas).height)*window.devicePixelRatio;
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

var entities = [];

entities.push(new Airplane({
	position: {
		x: 900,
		y: 340
	}, 
	id: 0,
	heading: 270,
	controls: {
		left: 37,
		right: 39,
		fire: 38,
		slow: 40
	}
}));

entities.push(new Airplane({
	position: {
		x: 300,
		y: 400
	}, 
	id: 1,
	heading: 90,
	controls: {
		left: 65,
		right: 68,
		fire: 87,
		slow: 83
	}
}));

// Practice targets setup
for (var i = 0; i < 0; i++) {
	entities.push(new PracticeTarget({
		position:{
			x: getRandomInt(0,canvas.width),
			y: getRandomInt(0,canvas.height)
		}
	}));
};

// Game loop
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