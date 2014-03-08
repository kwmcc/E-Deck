ig.module( 'game.entities.cloaking' )
.requires( 'impact.entity' )
.defines(function() {
	EntityCloaking = ig.Entity.extend({
		//change system sprite here
		animSheet: new ig.AnimationSheet( 'media/art/system_cloaking.png', 32, 32),
		cloakingSound: new ig.Sound('media/audio/cloaking.*', false),
		cloakingHeatAlert: new ig.Sound('media/audio/system_alarm.*',false),
	
		zIndex: -1, 
		size: {x: 32, y: 28},
		offset: {x: 0, y: 4},
		collides: ig.Entity.COLLIDES.PASSIVE,
		_wmScalable: true,
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
			this.addAnim('default', 1, [0]);
		},

		update: function() {
			this.parent();
			this.currentAnim = this.anims.default;
			if(this.isFueled && !this.resetRequired) {
				this.isHeating = true;
			}

			if(this.isCooled) {
				this.isHeating = false;

			}else if(this.resetRequired){
				this.resetRequired = false;
				console.log("System Reset");
			}

			if(this.isHeating && this.heat >= 25) {
				this.isOverHeated = true;
				this.isHeating = false;
				this.cloakingHeatAlert.play(); //alerts players when system overheats
				//this.resetRequired;
				console.log("System OverHeated, Reset Required");
			}
		},

		draw: function() {
			ig.system.context.fillStyle = "rgb(0,0,0)";
			ig.system.context.beginPath();
			ig.system.context.rect(
				(this.pos.x - ig.game.screen.x) * ig.system.scale,
				(this.pos.y - ig.game.screen.y - 8) * ig.system.scale,
				this.size.x * ig.system.scale, 4 * ig.system.scale);
			ig.system.context.closePath();
			ig.system.context.fill();

			ig.system.context.fillStyle = "rgb(255,0,0)";
			ig.system.context.beginPath();
			ig.system.context.rect(
				(this.pos.x - ig.game.screen.x + 1) * ig.system.scale,
				(this.pos.y - ig.game.screen.y - 7) * ig.system.scale,
				((this.size.x - 2) * (this.heat / 25))
				* ig.system.scale, 2 * ig.system.scale);
			ig.system.context.closePath();
			ig.system.context.fill();

			this.parent();
		},

		playSound: function() {
			this.cloakingSound.play();
		}

	});
});