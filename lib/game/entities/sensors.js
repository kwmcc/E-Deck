ig.module( 'game.entities.sensors' )
.requires( 'impact.entity' )
.defines(function() {
	EntitySensors = ig.Entity.extend({
		//change system sprite here
		animSheet: new ig.AnimationSheet( 'media/art/system_sensors.png', 32, 32),
		sensorSound: new ig.Sound('media/audio/sensors.*',false),
		sensorHeatAlert: new ig.Sound('media/audio/system_alarm.*',false),
		//type: ig.Entity.TYPE.B,
		//checkAgainst: ig.Entity.TYPE.A,
		zIndex: -1, 
		size: {x: 32, y: 31},
		offset: {x: 0, y: 0},
		collides: ig.Entity.COLLIDES.PASSIVE,
		isFueled: false, //intended to be acknowledged by and reset to false by mission entity 
		isCooled: false,
		isHeating: false,
		isOverHeated: false,
		resetRequired: false,
		heat: 0,

		isPrimary: false,
		isSecondary: false,


		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			this.addAnim('default', 1, [2]);
		},

		update: function() {
			this.parent();
			this.currentAnim = this.anims.default;
			if(this.isFueled) {
				this.isHeating = true;
			}

			if(this.isCooled) {
				this.isHeating = false;
				this.isOverHeated = false;
				this.heat = 0;

			}

			if(this.isHeating && this.heat >= 60) {
				this.isOverHeated = true;
				this.isHeating = false;
				this.sensorHeatAlert.play(); //alerts players when system overheats
				console.log("System OverHeated, Reset Required");
			}
		},

		draw: function() {
			ig.system.context.fillStyle = "rgb(0,0,0)";
			ig.system.context.beginPath();
			ig.system.context.rect(
				(this.pos.x - ig.game.screen.x) * ig.system.scale,
				(this.pos.y - ig.game.screen.y - 3) * ig.system.scale,
				this.size.x * ig.system.scale, 4 * ig.system.scale);
			ig.system.context.closePath();
			ig.system.context.fill();

			ig.system.context.fillStyle = "rgb(255,0,0)";
			ig.system.context.beginPath();
			ig.system.context.rect(
				(this.pos.x - ig.game.screen.x + 1) * ig.system.scale,
				(this.pos.y - ig.game.screen.y - 2) * ig.system.scale,
				((this.size.x - 2) * (this.heat / 60))
				* ig.system.scale, 2 * ig.system.scale);
			ig.system.context.closePath();
			ig.system.context.fill();

			this.parent();
		},

		playSound: function() {
			this.sensorSound.play();
		}

	});
});