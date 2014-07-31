function GameEntity(options) {
	this.velocity =  options.velocity || 0;
	this.position =  options.position || { x: 0, y:0 };
	this.heading =  options.heading || 0;
	this.active = true;
}

GameEntity.prototype = {
	constructor: GameEntity,

	draw: function(context){

		context.fillStyle="#e5333d";
		context.beginPath();
		context.moveTo(0,0);
		context.lineTo(0,5);
		context.lineTo(10,5);
		context.lineTo(10,-5);
		context.lineTo(0,-5);
		context.lineTo(0,0);
		context.fill();

	},

	display: function(context){
		context.save();
		context.translate(this.position.x,this.position.y);
		context.rotate(headingToRadians(this.heading));
		this.draw(context);
		context.restore();
	},

	update: function(){
		this.position.x += this.velocity*Math.cos(headingToRadians(this.heading-90));
		this.position.y += this.velocity*Math.sin(headingToRadians(this.heading-90));
	}
};

function PracticeTarget(options){
	GameEntity.call(this, options);
}

PracticeTarget.prototype = Object.create(GameEntity.prototype);
PracticeTarget.prototype.constructor = PracticeTarget;
PracticeTarget.prototype.draw = function(context) {
	context.fillStyle="#47aabd";
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(0,10);
	context.lineTo(10,17);
	context.lineTo(10,0);
	context.fill();
};

PracticeTarget.prototype.update = function(context) {
	GameEntity.prototype.update.call(this, context);
	this.heading += 0.4;
}

function Missile(options){
	GameEntity.call(this, options);
	this.originalHeading = this.heading;
	this.history = [];
	this.active = true;
	this.owner = options.owner || 0;
}

Missile.prototype = Object.create(GameEntity.prototype);
Missile.prototype.constructor = Missile;

Missile.prototype.draw = function(context) {
	context.fillStyle="rgba(100,0,0,0.8)";
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(5,0);
	context.lineTo(0,-15);
	context.lineTo(-5,0);
	context.lineTo(0,0);
	context.fill();
};

Missile.prototype.drawTrails = function(context){
	context.save();
	context.strokeStyle="#888";
	context.lineWidth=1;
	context.setLineDash([5]);
	context.beginPath();
	for (var i = this.history.length - 1; i >= 0; i--) {
		context.lineTo(this.history[i].x,this.history[i].y);
	};
	context.stroke();
	context.restore();
}

Missile.prototype.display = function(context){
	GameEntity.prototype.display.call(this, context);
	Missile.prototype.drawTrails.call(this, context);
}

Missile.prototype.update = function(){

	GameEntity.prototype.update.call(this);

	var historyLength = this.history.push({
		x: this.position.x,
		y: this.position.y
	});

	if (historyLength>50){
		this.history.shift();
	}
	this.heading = Math.sin(clock/3)*7 + this.originalHeading;

	this.velocity += 0.09;
	if (this.velocity>8) this.velocity = 8;
	if (this.history[0].x<0 || this.history[0].x>canvas.width || this.history[0].y<0 || this.history[0].y>canvas.height ){
		this.active = false;
	}
}

function Airplane(options){
	GameEntity.call(this,options);
	this.throttle = 0;
	this.fuel = 100;
	this.history = [];
	this.missiles = [];
	this.lastMissileTime = 0;
	this.id = options.id || 0;
}

Airplane.prototype = Object.create(GameEntity.prototype);
Airplane.prototype.constructor = Airplane;

Airplane.prototype.drawTrails = function(context){
	context.strokeStyle="#888";
	context.lineWidth=2;
	context.beginPath();
	for (var i = this.history.length - 1; i >= 0; i--) {
		context.lineTo(this.history[i].x,this.history[i].y);
	};
	context.stroke();
}

Airplane.prototype.draw = function(context){
	context.fillStyle="#555";
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(10,0);
	context.lineTo(0,-25);
	context.lineTo(-10,0);
	context.lineTo(0,0);
	context.fill();
}

Airplane.prototype.display = function(context){
	GameEntity.prototype.display.call(this, context);
	Airplane.prototype.drawTrails.call(this, context);
}

Airplane.prototype.update = function(){
	GameEntity.prototype.update.call(this);

	var historyLength = this.history.push({
		x: this.position.x,
		y: this.position.y
	});

	if (historyLength>250){
		this.history.shift();
	}

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
}

Airplane.prototype.fireMissile = function(){
	if (clock-this.lastMissileTime>30){
		entities.push(new Missile({
			position: clone(this.position),
			heading: this.heading, 
			velocity: this.velocity,
			owner: this.id
		}));
		this.lastMissileTime = clock;
	}	
}
