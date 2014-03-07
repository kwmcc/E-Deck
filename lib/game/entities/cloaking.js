ig.module( 'game.entities.cloaking' )
.requires( 'impact.entity' )
.defines(function() {
	EntityCloaking = ig.Entity.extend({
		//change system sprite here
		animSheet: new ig.AnimationSheet( 'media/art/system_cloaking.png', 32, 32),
		cloakingSound: new ig.Sound('media/audio/cloaking.*', false),
	
		zIndex: -1, 
		size: {x: 32, y: 28},
		offset: {x: 0, y: 4},
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
				//this.resetRequired;
				console.log("System OverHeated, Reset Required");
			}
		},

		playSound: function() {
			this.cloakingSound.play();
		}

	});
});