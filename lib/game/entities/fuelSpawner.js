ig.module( 'game.entities.fuelSpawner' )
.requires( 'impact.entity', 'impact.entity-pool' )
.defines(function() {
	EntityFuelSpawner = ig.Entity.extend({

		fuelCheck: null,

		init: function( x, y, settings ) {
			this.parent( x, y, settings );
		},

		update: function() {
			this.parent();
			this.fuelCheck = ig.game.getEntitiesByType(EntityFuel);
			for (var i = 0; i < this.fuelCheck.length; i++) {
				if(!this.touches(this.fuelCheck[i])) {
					ig.game.spawnEntity(EntityFuel, this.pos.x, this.pos.y);
				}
			}
		}
	});
});