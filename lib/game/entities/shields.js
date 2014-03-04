ig.module( 'game.entities.shields' )
.requires( 'impact.entity' )
.defines(function() {
	EntityShields = ig.Entity.extend({

		animSheet: new ig.AnimationSheet( 'media/art/system.png', 16, 16),
		//type: ig.Entity.TYPE.B,
		//checkAgainst: ig.Entity.TYPE.A,
		zIndex: -1, 
		size: {x: 16, y: 16},
		offset: {x: 0, y: 0},
		isFueled: false, //intended to be acknowledged by and reset to false by mission entity 
		isCooled: false,
		isHeating: false,
		isOverHeated: false,
		resetRequired: false,
		heat: 0,


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