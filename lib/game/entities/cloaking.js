ig.module( 'game.entities.cloaking' )
.requires( 'impact.entity' )
.defines(function() {
	EntityCloaking = ig.Entity.extend({
		//change system sprite here
		animSheet: new ig.AnimationSheet( 'media/art/system.png', 16, 16),
		soundEffect: new ig.Sound('media/audio/cloaking.*', false),
	
		zIndex: -1, 
		size: {x: 16, y: 16},
		offset: {x: 0, y: 0},
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
				soundEffect.play(); // play the cloaking sound when fueled
				this.isHeating = true;
	
			}

			if(this.isCooled) {
				this.isHeating = false;

			}else if(this.resetRequired){
				restRequired = false;
				console.log("System Reset");
			}

			if(this.isHeating && this.heat >= 25) {
				this.OverHeated = true;
				this.isHeating = false;
				//this.resetRequired;
				console.log("System OverHeated, Reset Required");
			}
		}

	});
});