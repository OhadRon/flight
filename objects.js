// Game entity abstract object

function GameEntity(options) {
	this.velocity =  options.velocity || 0;
	this.position =  options.position || { x: 0, y:0 };
	this.heading =  options.heading || 0;
	this.active = true;
	this.wrapping = true;
}

GameEntity.prototype = {
	constructor: GameEntity,

	// Default shape
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

	// Default display - wraps draw() with default transformations
	display: function(context){
		context.save();
		context.translate(this.position.x,this.position.y);
		context.rotate(headingToRadians(this.heading));
		this.draw(context);
		context.restore();
	},

	// Default movement
	update: function(){
		this.position.x += this.velocity*Math.cos(headingToRadians(this.heading-90));
		this.position.y += this.velocity*Math.sin(headingToRadians(this.heading-90));

		if (this.wrapping){
			if (this.position.x<0) this.position.x=canvas.width;
			if (this.position.x>canvas.width) this.position.x = 0;
			if (this.position.y<0) this.position.y=canvas.height;
			if (this.position.y>canvas.height) this.position.y = 0;
		};

		if(this.heading<0) this.heading += 360;
		this.heading = this.heading%360;
	}
};

// Practice target object.

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
		// Rotate
		this.heading += 0.7;
	}
}

// Missile object

function Missile(options){
	GameEntity.call(this, options);
	this.originalHeading = this.heading;
	this.history = [];
	this.owner = options.owner || 0;
	this.hit = false;
	this.homingMode = false;
	this.wrapping = false;
	console.log('Launching|| D:', distance(this,entities[1]), 'This to target: ' ,Math.abs(this.heading-heading(this, entities[1])),  'angle between directions: ' ,Math.abs(this.heading-entities[1].heading));
}

Missile.prototype = Object.create(GameEntity.prototype);
Missile.prototype.constructor = Missile;

Missile.prototype.draw = function(context) {
	if (this.homingMode){
		context.fillStyle="rgba(255,255,255,0.6)";
	} else {
		context.fillStyle="rgba(0,0,0,0.6)";
	}
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(5,0);
	context.lineTo(0,-10);
	context.lineTo(-5,0);
	context.lineTo(0,0);
	context.fill();
};

Missile.prototype.drawTrails = function(context){
	context.save();
	if (this.homingMode){
		context.strokeStyle="rgba(255,255,255,0.6)";
	} else {
		context.strokeStyle="rgba(0,0,0,0.6)";
	}
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
		// Sinus movement
		this.heading = Math.sin(clock/2.5)*7 + this.originalHeading;

		// Check collisions
		entities.forEach(function(entity){
			// Missile hitting a practice target
			if (entity instanceof PracticeTarget){
				if (distance(this, entity)<10){
					entity.exploded = true;
					this.hit = true;
				}
			}
			// Missile hitting another plane
			if (entity instanceof Airplane){
				if (!this.homingMode
					&& entity.alive
					&& entity != this.owner
					&& distance(this, entity)<100
					&& Math.abs(this.heading-heading(this, entity))<50 // in front of the missile
					&& Math.abs(this.heading-entity.heading)<60){ // in rear aspect
						this.homingMode = entity
						console.log('HOMING: ', distance(this,entity), Math.abs(this.heading-heading(this, entity)), Math.abs(this.heading-entity.heading));
				}

				if (entity.alive && entity != this.owner && distance(this, entity)<10){
					entity.die();
					this.hit = true;
					this.active = false;
					this.owner.score++;
				}
			}
		}, this);

		if(this.homingMode){
			console.log('changing heading');
			this.heading = heading(this,this.homingMode);
		}
	}

	// Engine logic
	if (this.hit){
		this.velocity = 0;
	} else {
		this.velocity += 0.14;
		if (this.velocity>9) this.velocity = 9;
	}

	// Kill this missile if it goes out of bounds
	if (this.history[0].x<0 || this.history[0].x>canvas.width || this.history[0].y<0 || this.history[0].y>canvas.height ){
		this.active = false;
	}
}

function Airplane(options){
	GameEntity.call(this,options);

	this.missiles = [];
	this.lastMissileTime = 0;
	this.id = options.id || 0;
	this.controls = options.controls;
	this.alive = true;
	this.trailColors = ['#40d7d3','#95d484', '#5d1584', '#177411'];
	this.score = 0;
	this.ammo = 4;

	// Unused for now:
	this.throttle = 0;
	this.fuel = 100;
}

Airplane.prototype = Object.create(GameEntity.prototype);
Airplane.prototype.constructor = Airplane;


// Death function
Airplane.prototype.die = function(){
	this.alive = false;
	// Mark time of death
	this.deathTime = clock;
	// Explosion animation
	for (var i = 0; i < 10; i++) {
		entities.push(new Particle({
			position: clone(this.position),
			heading: i*36,
			velocity: 3,
			color: this.trailColors[this.id],
			owner: this,
			strength: 140
		}));
	};
}

Airplane.prototype.draw = function(context){

	// Shadow

	context.rotate(headingToRadians(-this.heading));
	context.translate(45,45);
	context.rotate(headingToRadians(this.heading));
	context.fillStyle="rgba(0,0,0,0.2)";
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(10,0);
	context.lineTo(0,-25);
	context.lineTo(-10,0);
	context.lineTo(0,0);
	context.fill();
	context.rotate(headingToRadians(-this.heading));
	context.translate(-45,-45);
	context.rotate(headingToRadians(this.heading));

	context.fillStyle="#fff";
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(10,0);
	context.lineTo(0,-25);
	context.lineTo(-10,0);
	context.lineTo(0,0);
	context.fill();
	this.drawScore(context);
	this.drawAmmo(context);
}

Airplane.prototype.drawScore = function(context){
	var scoreText = '' + this.score;
	context.save();
		context.rotate(headingToRadians(-this.heading));
		context.fillText(scoreText, 20, 20);
	context.restore();
}

Airplane.prototype.drawAmmo = function(context){
	context.save();
		context.rotate(headingToRadians(-this.heading));
		for (var i = 0; i < this.ammo; i++) {
			context.fillStyle="rgba(0,0,0,0.6)"
			context.fillRect(0+(i*7), 0, 5,5);
		}
	context.restore();
}

Airplane.prototype.update = function(){
	GameEntity.prototype.update.call(this);

	// Draw particle trail
	if (this.alive){
		entities.push(new Particle({
			position: clone(this.position),
			heading: this.heading -180 + getRandomInt(-3,3),
			velocity: getRandomInt(2,6)*0.25,
			color: this.trailColors[this.id],
			owner: this,
			strength: 120
		}));
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

		if (keys[this.controls.slow]){
			if (this.velocity<1) this.velocity = 1;
				else
			this.velocity -= 0.25;
		}

		if (keys[this.controls.fire]){
			this.fireMissile();
		}
	} else {
		this.velocity -= 0.1;
		if (this.velocity<0) this.velocity = 0;

		// Respawn after 100 frames
		if (clock > this.deathTime+100) this.alive = true;
	}
}

Airplane.prototype.fireMissile = function(){
	if (clock-this.lastMissileTime>30 && this.ammo > 0){
		this.ammo--;
		entities.push(new Missile({
			position: clone(this.position),
			heading: this.heading,
			velocity: this.velocity+2,
			owner: this
		}));
		this.lastMissileTime = clock;
	}
}

// Particle!
function Particle(options){
	GameEntity.call(this, options);
	this.color = options.color || '#000';
	this.strength = options.strength || 80;
	this.slowRate = 1;
	this.owner = options.owner || 0;
}

Particle.prototype = Object.create(GameEntity.prototype);
Particle.prototype.constructor = Particle;

Particle.prototype.draw = function(context){
		context.fillStyle= this.color;
		context.beginPath();
		context.moveTo(0,0);
		var rectSize = this.strength/30+0.2;
		context.fillRect(-rectSize/2, -rectSize/2, rectSize, rectSize);

		// Circles were too processor intensive to draw
		// context.arc(0,0, this.strength/50+0.1, 0, Math.PI*2, false)
		// context.fill();
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

function AmmoCrate(options){
	GameEntity.call(this,options);
	this.lifeTime = 600;
}

AmmoCrate.prototype = Object.create(GameEntity.prototype);
AmmoCrate.prototype.constructor = AmmoCrate;

AmmoCrate.prototype.draw = function(context){
	context.fillStyle='#323232';
	context.beginPath();
	context.ellipse(0,0,6,6,0,0,Math.PI*2);
	context.fill();
}

AmmoCrate.prototype.update = function(){
	this.lifeTime -= 1;
	if (this.lifeTime<0) this.active = false;
	entities.forEach(function(entity){
		if (entity instanceof Airplane){
			if (distance(this, entity)<20) {
				this.active = false;
				entity.ammo +=1;
			}
		}
	}, this);
}
