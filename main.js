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

var entities = [];
var clock = 0;
var gamePaused = false;
var crateClock;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var gameStarted = false;

// Retina fixes
canvas.width = parseInt(window.getComputedStyle(canvas).width)*window.devicePixelRatio;
canvas.height = parseInt(window.getComputedStyle(canvas).height)*window.devicePixelRatio;
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

var startMenu = new StartMenu({});
entities.push(startMenu);

var demoAirplanes = [];
var DEMO_AIRPLANES_COUNT = 30;
for (var i = 0; i < DEMO_AIRPLANES_COUNT; i++) {
	demoAirplanes.push(new Airplane({
		position: {
			x: getRandomInt(0,canvas.width),
			y: getRandomInt(0,canvas.height)
		},
		id: 999,
		heading: getRandomInt(0,360),
		controls: {
			left: 999,
			right: 999,
			fire: 999,
			slow: 999,
			afterburner: 999
		},
		gamePadController: null,
		trailColor: '#ddd',
		ammo: 1,
		flareAmmo: 1,
		shieldTime: 1
	}));
}
for (var i = 0; i < DEMO_AIRPLANES_COUNT; i++) {
	entities.push(demoAirplanes[i]);
}

var startGame = function(){

	crateClock = 100;
	gameStarted = true;
	startMenu.active = false;
	for (var i = 0; i < DEMO_AIRPLANES_COUNT; i++) {
		demoAirplanes[i].active = false;
	}

	entities.push(new Airplane({
		position: {
			x: getRandomInt(0,canvas.width),
			y: getRandomInt(0,canvas.height)
		},
		id: 0,
		heading: getRandomInt(0,360),
		controls: {
			left: 37,
			right: 39,
			fire: 38,
			slow: 40,
			afterburner: 38
		},
		gamePadController: 0
	}));

	entities.push(new Airplane({
		position: {
			x: getRandomInt(0,canvas.width),
			y: getRandomInt(0,canvas.height)
		},
		id: 1,
		heading: getRandomInt(0,360),
		controls: {
			left: 65,
			right: 68,
			fire: 87,
			slow: 83,
			afterburner: 87
		},
		gamePadController: 1
	}));

	entities.push(new Airplane({
		position: {
			x: getRandomInt(0,canvas.width),
			y: getRandomInt(0,canvas.height)
		},
		id: 2,
		heading: getRandomInt(0,360),
		controls: {
			left: 72,
			right: 75,
			fire: 85,
			slow: 74,
			afterburner: 85
		},
		gamePadController: 2
	}));
	//
	// entities.push(new Airplane({
	// 	position: {
	// 		x: getRandomInt(0,canvas.width),
	// 		y: getRandomInt(0,canvas.height)
	// 	},
	// 	id: 3,
	// 	heading: getRandomInt(0,360),
	// 	controls: {
	// 		left: 72,
	// 		right: 75,
	// 		fire: 85,
	// 		slow: 74,
	// 		afterburner: 85
	// 	},
	// 	gamePadController: 3
	// }));

	// Practice targets setup
	for (var i = 0; i < 0; i++) {
		entities.push(new PracticeTarget({
			position:{
				x: getRandomInt(0,canvas.width),
				y: getRandomInt(0,canvas.height)
			}
		}));
	};
}

// Game loop
function step(timestamp) {
	if (!gamePaused){
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

		if (gameStarted){
			if (crateClock==0){
				entities.push(new AmmoCrate({
					position:{
						x: getRandomInt(0,canvas.width),
						y: getRandomInt(0,canvas.height)
					}
				}));
				crateClock = 30;
			}
			crateClock--;
		} else {
			if (keys[32] || gamepadButtonPressed(0, 9)|| gamepadButtonPressed(1, 9)|| gamepadButtonPressed(2, 9)|| gamepadButtonPressed(3, 9)){
				startGame();
			}
		}
		clock++;
	}

	if (keys[80] || gamepadButtonPressed(0,8)|| gamepadButtonPressed(1,8)|| gamepadButtonPressed(2,8)|| gamepadButtonPressed(3,8)){
		if (gamePaused) { gamePaused=false} else {gamePaused=true}
	}
	requestAnimationFrame(step);
}

requestAnimationFrame(step);
