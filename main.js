var TRAIL_LENGTH = 250;

function headingToRadians(degrees){
	return degrees*Math.PI/180;
}

var Missile = function(_position,_heading,_velocity){
	return{
		velocity: _velocity,
		position:{
			x: _position.x,
			y: _position.y
		},
		originalHeading: _heading,
		heading: _heading,
		history: [],
		active: true,

		display: function(ctx){
			ctx.save();

				// trail
				ctx.strokeStyle="#888";
				ctx.lineWidth=1;
				ctx.setLineDash([5]);
				ctx.beginPath();
				for (var i = this.history.length - 1; i >= 0; i--) {
					ctx.lineTo(this.history[i].x,this.history[i].y);
				};
				ctx.stroke();

				// actual missile
				ctx.save();
				ctx.translate(this.position.x,this.position.y);
				ctx.rotate(headingToRadians(this.heading));

				ctx.fillStyle="rgba(100,0,0,0.8)";
				ctx.beginPath();
				ctx.moveTo(0,0);
				ctx.lineTo(5,0);
				ctx.lineTo(0,-15);
				ctx.lineTo(-5,0);
				ctx.lineTo(0,0);
				ctx.fill();

				ctx.restore();
			ctx.restore();
		},

		update: function(){

			var historyLength = this.history.push({
				x: this.position.x,
				y: this.position.y
			});

			if (historyLength>TRAIL_LENGTH/5){
				this.history.shift();
			}

			this.position.x += this.velocity*Math.cos(headingToRadians(this.heading-90));
			this.position.y += this.velocity*Math.sin(headingToRadians(this.heading-90));

			this.heading = Math.sin(clock/3)*7 + this.originalHeading;

			this.velocity += 0.09;
			if (this.velocity>8) this.velocity = 8;

			if (this.history[history.length-1].x<0 || this.history[history.length-1].x>canvas.width || this.history[history.length-1].y<0 || this.history[history.length-1].y>canvas.height ){
				this.active = false;
			}
			
		}
	}
};

var Airplane = function(_x,_y){
	return {
		velocity: 1,
		throttle: 0,
		fuel: 100,
		position:{
			x: _x,
			y: _y
		},
		heading: 0,
		history: [],
		missiles: [],
		lastMissileTime: 0,

		display: function(ctx){

			// trail
			ctx.strokeStyle="#888";
			ctx.lineWidth=2;
			ctx.beginPath();
			for (var i = this.history.length - 1; i >= 0; i--) {
				ctx.lineTo(this.history[i].x,this.history[i].y);
			};
			ctx.stroke();

			// actual plane
			ctx.save();
			ctx.translate(this.position.x,this.position.y);
			ctx.rotate(headingToRadians(this.heading));

			ctx.fillStyle="#555";
			ctx.beginPath();
			ctx.moveTo(0,0);
			ctx.lineTo(10,0);
			ctx.lineTo(0,-25);
			ctx.lineTo(-10,0);
			ctx.lineTo(0,0);
			ctx.fill();

			// envelope
			ctx.save();
			ctx.translate(0,-25);
			ctx.fillStyle="rgba(0,0,0,0.2)";
			ctx.beginPath();
			ctx.moveTo(0,0);
			ctx.lineTo(20,-85);
			ctx.lineTo(-20,-85);
			ctx.lineTo(0,0);
			ctx.fill();
			ctx.restore();

			ctx.restore();

			// display missiles
			for (var i = this.missiles.length - 1; i >= 0; i--) {
				this.missiles[i].display(ctx);
			};
		},

		update: function(){

			var historyLength = this.history.push({
				x: this.position.x,
				y: this.position.y
			});

			if (historyLength>TRAIL_LENGTH){
				this.history.shift();
			}

			this.position.x += this.velocity*Math.cos(headingToRadians(this.heading-90));
			this.position.y += this.velocity*Math.sin(headingToRadians(this.heading-90));
			
			if (keys[37]) {
				this.heading -= 1.9*(this.velocity/4);
			}

			if (keys[39]) {
				this.heading += 1.9*(this.velocity/4);
			}

			if (keys[39] || keys[37]){
				this.velocity -= 0.02;
				if (this.velocity<0.6) this.velocity = 0.6;

			} else {
				this.velocity += 0.05;
				if (this.velocity>4) this.velocity = 4;
			}

			if (keys[32]){
				this.fireMissile();
			}

			// update missiles
			for (var i = this.missiles.length - 1; i >= 0; i--) {
				this.missiles[i].update();
				if (!this.missiles[i].active){
					this.missiles.splice(i,1);
				}
			};
		},

		fireMissile: function(){
			if (clock-this.lastMissileTime>30){
				this.missiles.push(Missile(this.position, this.heading, this.velocity));
				this.lastMissileTime = clock;
			}
		}
	}
};

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
players.push(Airplane(400,600));

function step(timestamp) {
	// Clear screen
	ctx.fillStyle="#ffffff"
	ctx.fillRect(0,0,canvas.width, canvas.height);

	// Iterate through all players

	for (var i = players.length - 1; i >= 0; i--) {
		players[i].display(ctx);
		players[i].update();
	};

	clock++;

	requestAnimationFrame(step);
}

requestAnimationFrame(step);