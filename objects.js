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
					&& Math.abs(this.heading-entity.heading)<60 // in rear aspect
					&& entity.flares.length == 0)// There are no flares owned by the target
					{
						this.homingMode = entity
						console.log('HOMING: ', distance(this,entity), Math.abs(this.heading-heading(this, entity)), Math.abs(this.heading-entity.heading));
				}

				if (entity.alive && entity != this.owner && distance(this, entity)<10){
					if (entity.shieldTime){
						entity.shieldTime = 0;
					} else {
						entity.die();
						this.owner.score++;
					}
					this.hit = true;
					this.active = false;
				}
			}
		}, this);

		if(this.homingMode){
			this.heading = heading(this,this.homingMode);
			if(this.homingMode.flares.length != 0){ // Target has flares
				 this.homingMode = 0;
				 console.log('Missle decoyed by flares');
			}
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
	this.lastMissileTime = 0;
	this.id = options.id || 0;
	this.controls = options.controls;
	this.alive = true;
	this.trailColors = ['#c4717a','#6c79d5', '#82c97a', '#cb992a'];
	this.trailColor = options.trailColor || this.trailColors[this.id];
	this.score = 0;
	this.ammo = options.ammo || 4;
	this.lastFlareTime = 0;
	this.flareAmmo = options.flareAmmo || 10;
	this.flares = [];
	this.nextParticle = 0;
	this.shieldTime = options.shieldTime || 200;
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
	this.drawFlares(context);

	if (this.shieldTime>0){
		context.beginPath();
		context.strokeStyle = 'rgba(255,255,255,0.3)';
		if (this.shieldTime<70 && this.shieldTime%3 == 0) context.strokeStyle = 'rgba(255,255,255,0)';
		context.ellipse(0,0-10,25,25,0,0,Math.PI*2);
		context.stroke();

	}
}

Airplane.prototype.drawScore = function(context){
	var scoreText = '' + this.score;
	context.save();
		context.rotate(headingToRadians(-this.heading));
		context.fillText(scoreText, 20, 30);
	context.restore();
}

Airplane.prototype.drawAmmo = function(context){
	context.save();
		context.rotate(headingToRadians(-this.heading));
		for (var i = 0; i < this.ammo; i++) {
			context.fillStyle="rgba(0,0,0,0.6)"
			context.fillRect(20+(i*7), 0, 5,5);
		}
	context.restore();
}

Airplane.prototype.drawFlares = function(context){
	context.save();
		context.rotate(headingToRadians(-this.heading));
		for (var i = 0; i < this.flareAmmo; i++) {
			context.fillStyle="rgba(255,255,255,0.6)"
			context.fillRect(20+(i*7), 10, 5,5);
		}
	context.restore();
}

Airplane.prototype.update = function(){
	GameEntity.prototype.update.call(this);

	// Shield logic
	if (this.shieldTime>0){
		this.shieldTime--;
	}

	// Clear dead flares

	for (var i = this.flares.length - 1; i >= 0; i--) {
		if (this.flares[i].power<4){
			this.flares.splice(i,1);
			console.log('removed flare');
		}
	};

	// Draw particle trail
	if (this.alive){
		if (this.nextParticle>10){
			entities.push(new Particle({
				position: clone(this.position),
				heading: this.heading -180 + getRandomInt(-3,3),
				velocity: getRandomInt(2,6)*0.25,
				color: this.trailColor,
				owner: this,
				strength: 120
			}));
			this.nextParticle = 0;
		}
		this.nextParticle += this.velocity;
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
			this.emitFlare();
			if (this.velocity<1) this.velocity = 1;
				else
			this.velocity -= 0.15;
		}

		if (keys[this.controls.fire]){
			this.fireMissile();
		}
	} else { // If dead
		this.velocity -= 0.1;
		if (this.velocity<0) this.velocity = 0;

		// Respawn after 100 frames
		if (clock > this.deathTime+100) {
			this.alive = true;
			this.shieldTime = 300;
		}
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

Airplane.prototype.emitFlare = function(){
	if (clock-this.lastFlareTime>42 && this.flareAmmo > 0){
		this.flareAmmo--;
		var newFlare = new Flare({
			position: clone(this.position),
			heading: this.heading+getRandomInt(-30,30),
			velocity: this.velocity*0.97,
			owner: this
		});
		entities.push(newFlare);
		this.flares.push(newFlare);
		this.lastFlareTime = clock;
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
	this.growing = true;
	this.size = 0;
	this.heading = getRandomInt(0,359);
	this.velocity = 0.5;
	this.ammoTypes = {
		MISSILE: 0,
		FLARE: 1,
		SHIELD: 2
	};
	this.ammoType = options.ammoType || this.ammoTypes.MISSILE;
}

AmmoCrate.prototype = Object.create(GameEntity.prototype);
AmmoCrate.prototype.constructor = AmmoCrate;

AmmoCrate.prototype.draw = function(context){
	if (this.ammoType == this.ammoTypes.MISSILE)	context.fillStyle='rgba(0,0,0,0.5)';
	if (this.ammoType == this.ammoTypes.FLARE)	context.fillStyle='rgba(255,255,255,0.5)';
	if (this.ammoType == this.ammoTypes.SHIELD)	context.fillStyle='rgba(141, 204, 250, 0.5)';
	context.beginPath();
	context.ellipse(0,0,this.size,this.size,0,0,Math.PI*2);
	context.fill();

	if (this.ammoType == this.ammoTypes.MISSILE)	context.fillStyle='rgba(255,255,255,0.2)';
	if (this.ammoType == this.ammoTypes.FLARE)	context.fillStyle='rgba(0,0,0,0.2)';
	if (this.ammoType == this.ammoTypes.SHIELD)	context.fillStyle='rgba(27, 27, 27, 0.5)';

	context.beginPath();
	context.ellipse(0,0,2,2,0,0,Math.PI*2);
	context.fill();


	context.rotate(headingToRadians(-this.heading));
	context.translate(45,45);
	context.rotate(headingToRadians(this.heading));
	context.fillStyle='rgba(0,0,0,0.2)';
	context.beginPath();
	context.ellipse(0,0,this.size,this.size,0,0,Math.PI*2);
	context.fill();
	context.rotate(headingToRadians(-this.heading));
	context.translate(-45,-45);
	context.rotate(headingToRadians(this.heading));
}

AmmoCrate.prototype.update = function(){
	GameEntity.prototype.update.call(this);

	this.lifeTime -= 1;
	if (this.lifeTime<0) this.active = false;

	if (this.growing){
		this.size +=0.2;
		if (this.size>9){
			this.growing = false;
		}
	} else {
		this.size -=0.2;
		if (this.size<5){
			this.growing = true;
		}
	}

	entities.forEach(function(entity){
		if (entity instanceof Airplane){
			if (distance(this, entity)<20) {
				this.active = false;
				if (this.ammoType == this.ammoTypes.MISSILE)	entity.ammo +=1;
				if (this.ammoType == this.ammoTypes.FLARE)	entity.flareAmmo +=1;
				if (this.ammoType == this.ammoTypes.SHIELD)	entity.shieldTime +=1000;
			}
		}
	}, this);
}

function StartMenu(options){
	GameEntity.call(this,options);
}

StartMenu.prototype = Object.create(GameEntity.prototype);
StartMenu.prototype.constructor = StartMenu;

StartMenu.prototype.draw = function(context){
	context.fillStyle = "rgba(255,255,255,0.5)";
	context.fillRect(canvas.width/2-500, canvas.height/2-230, 1000,400);
	context.font = '70px sans-serif';
	context.fillStyle = '#000';
	context.textAlign = 'center';
	context.fillText("Triangles Shooting Missiles", canvas.width/2, canvas.height/2-100);
	context.font = '34px sans-serif';
	context.fillText("Shoot missiles and emit flares to avoid them", canvas.width/2, canvas.height/2-30);
	context.font = '24px sans-serif';
	context.fillText("Player 1: Arrows | Player 2: AWSD | Player 3: HUJK", canvas.width/2, canvas.height/2+50);
	context.font = '17px sans-serif';
	context.fillText("Press the spacebar to start", canvas.width/2, canvas.height/2+100);
};

StartMenu.prototype.update = function(){
	GameEntity.prototype.update.call(this);
};

function Flare(options){
	GameEntity.call(this,options);
	this.owner = options.owner || 0;
	this.power = 19;
}

Flare.prototype = Object.create(GameEntity.prototype);
Flare.prototype.constructor = Flare;

Flare.prototype.draw = function(context){
	context.fillStyle= "#ffa0a0";
	context.beginPath();
	context.moveTo(0,0);
	context.fillRect(-this.power/2, -this.power/2, this.power, this.power);
	context.ellipse(0,0,this.power*0.7,this.power*0.7,0,0,Math.PI*2);
	context.fill();

};

Flare.prototype.update = function(){
	GameEntity.prototype.update.call(this);
	this.velocity *= 0.97;
	this.power *= 0.97;
	this.heading += 0.3;
	if (this.power<1) this.active = false;
};


// function NewObject(options){
// 	GameEntity.call(this,options);
// }
//
// NewObject.prototype = Object.create(GameEntity.prototype);
// NewObject.prototype.constructor = NewObject;
//
// NewObject.prototype.draw = function(context){};
// NewObject.prototype.update = function(){
// 	GameEntity.prototype.update.call(this);
// };
