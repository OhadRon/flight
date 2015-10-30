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

var startGame = function(){

	crateClock = 100;
	gameStarted = true;
	startMenu.active = false;


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
			slow: 40
		}
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
			slow: 83
		}
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
			slow: 74
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
}

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

	if (gameStarted){
		if (crateClock==0){
			entities.push(new AmmoCrate({
				position:{
					x: getRandomInt(0,canvas.width),
					y: getRandomInt(0,canvas.height)
				},
				ammoType: getRandomInt(0,1)
			}));
			crateClock = 100;
		}

		crateClock--;
	} else {
		if (keys[32]){
			startGame();
		}
	}

	clock++;
	requestAnimationFrame(step);
}

requestAnimationFrame(step);
