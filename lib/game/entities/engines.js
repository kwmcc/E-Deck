ig.module( 'game.entities.engines' )
.requires( 'impact.entity' )
.defines(function() {
	EntityEngines = ig.Entity.extend({
		//change system sprite here
		animSheet: new ig.AnimationSheet( 'media/art/system_cloaking.png', 32, 32),
		soundEffect: new ig.Sound('media/audio/engine_sub.*',false),
		//type: ig.Entity.TYPE.B,
		//checkAgainst: ig.Entity.TYPE.A,
		zIndex: -1, 
		size: {x: 32, y: 26},
		offset: {x: 0, y: 6},
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
				soundEffect.play();
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