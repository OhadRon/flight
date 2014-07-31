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
	ctx.fillStyle="#dcf3ff"
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
