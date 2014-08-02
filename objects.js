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
	this.exploded = false;
}

PracticeTarget.prototype = Object.create(GameEntity.prototype);
PracticeTarget.prototype.constructor = PracticeTarget;
PracticeTarget.prototype.draw = function(context) {
	if (this.exploded){
		context.fillStyle="#b6a78f";
	} else {
		context.fillStyle="#a0bec3";
	}
	star(context, 10,5,0.5)
};

PracticeTarget.prototype.update = function(context) {
	GameEntity.prototype.update.call(this, context);
	if (!this.exploded){
		this.heading += 0.7;
	}
}

function Missile(options){
	GameEntity.call(this, options);
	this.originalHeading = this.heading;
	this.history = [];
	this.owner = options.owner || 0;
	this.hit = false;
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

	if (!this.hit){
		this.heading = Math.sin(clock/2.5)*10 + this.originalHeading;

		entities.forEach(function(entity){
			if (entity instanceof PracticeTarget){
				if (distance(this, entity)<10){
					entity.exploded = true;
					this.hit = true;
				}
			}
			if (entity instanceof Airplane){
				if (entity.id != this.owner && distance(this, entity)<10){
					entity.die();
					this.hit = true;
				}
			}
		}, this);
	}

	if (this.hit){
		this.velocity = 0;
	} else {
		this.velocity += 0.14;
		if (this.velocity>9) this.velocity = 9;		
	}

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
	this.controls = options.controls;
	this.alive = true;
	this.trailColors = ['#38a8a7','#c52d2e', '#5d1584', '#177411'];
}

Airplane.prototype = Object.create(GameEntity.prototype);
Airplane.prototype.constructor = Airplane;

Airplane.prototype.drawTrails = function(context){
	context.strokeStyle=this.trailColors[this.id%4];
	context.lineWidth=2;
	context.beginPath();
	for (var i = this.history.length - 1; i >= 0; i--) {
		context.lineTo(this.history[i].x,this.history[i].y);
	};
	context.stroke();
}

Airplane.prototype.die = function(){
	this.alive = false;
	this.deathTime = clock;
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

	if (historyLength>160){
		this.history.shift();
	}

	if (this.alive){
		if (keys[this.controls.left]) {
			this.heading -= 4*(this.velocity/4);
		}

		if (keys[this.controls.right]) {
			this.heading += 4*(this.velocity/4);
		}

		if (keys[this.controls.right] || keys[this.controls.left]){
			this.velocity -= 0.02;
			if (this.velocity<2) this.velocity = 2;
		} else {
			this.velocity += 0.08;
			if (this.velocity>4.5) this.velocity = 4.5;
		}

		if (keys[this.controls.fire]){
			this.fireMissile();
		}		
	} else {
		this.velocity -= 0.1;
		if (this.velocity<0) this.velocity = 0;
		if (clock > this.deathTime+100) this.alive = true;
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

function Particle(options){
	GameEntity.call(this, options);
	this.color = options.color || '#d671c5';
	this.strength = 100;
	this.slowRate = 1;
}

Particle.prototype = Object.create(GameEntity.prototype);
Particle.prototype.constructor = Particle;

Particle.prototype.draw = function(context){
		context.fillStyle= this.color;
		context.beginPath();
		context.moveTo(0,0);
		context.arc(0,0, 2, 0, Math.PI*2, false)
		context.fill();
}

Particle.prototype.update = function(){
	GameEntity.prototype.update.call(this);
	if (this.strength<0){
		this.active = false;
	} else {
		this.strength -=1;
		this.velocity -= this.slowRate*0.01;		
		if (this.velocity<0) this.velocity = 0;
	}

}
