function headingToRadians(degrees){
	return degrees*Math.PI/180;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clone(obj) {
	if (null == obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}

function clearScreen(){
	ctx.fillStyle="#666"
	ctx.fillRect(0,0,canvas.width, canvas.height);
}

function star(ctx, r, p, m){
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(0,0-r);
	for (var i = 0; i < p; i++)
	{
		ctx.rotate(Math.PI / p);
		ctx.lineTo(0, 0 - (r*m));
		ctx.rotate(Math.PI / p);
		ctx.lineTo(0, 0 - r);
	}
	ctx.fill();
	ctx.restore();
}

function distance(a, b){
	var d = Math.sqrt( (a.position.x-b.position.x)*(a.position.x-b.position.x) + (a.position.y-b.position.y)*(a.position.y-b.position.y) );
	return d;
}

function heading(a,b){
	var xDiff = a.position.x - b.position.x;
	var yDiff = a.position.y - b.position.y;
	return ((Math.atan2(yDiff, xDiff) * (180 / Math.PI)+270))%360;
}

function monitorGamepad(index){
	var gamepad = navigator.getGamepads()[index]
	console.log('Stats for gampad '+index+':');
	if(gamepad){
			console.log('Connected succsefully as',gamepad.id)
			console.log('Axes:',gamepad.axes[0],gamepad.axes[1]);
			console.log('Buttons:',gamepad.buttons[0].pressed
			,gamepad.buttons[1].pressed
			,gamepad.buttons[2].pressed
			,gamepad.buttons[3].pressed
			,gamepad.buttons[4].pressed
			,gamepad.buttons[5].pressed
			,gamepad.buttons[6].pressed
			,gamepad.buttons[7].pressed
			,gamepad.buttons[8].pressed
			,gamepad.buttons[9].pressed
		);
	}
}

function gamepadButtonPressed(index,button){
	var gamepad = navigator.getGamepads()[index];
	if (gamepad != undefined) return gamepad.buttons[button].pressed;
}

function gamepadAxisPressed(index,axis,value){
	var gamepad = navigator.getGamepads()[index];
	if (gamepad != undefined) return gamepad.axes[axis] == value;
}
