
ig.module( 'game.entities.events' )
.requires( 'impact.entity' )
.defines(function() {
	EntityEvents = ig.Entity.extend({
	
	timeAllocated: [50, 30 ,50 ,60, 40, 50],
	penalty: [20, 20, 30, 60, 20, 100],
	reward: [30,20,30,60,30, 100],

	//can read: engines, shields, weapons lifesupport sensors, cloaking
	primarySystem: ['engines', 'shields', 'weapons', 'sensors', 'cloaking'],
	captiansOrd: 
	["Pirates are inbound! More Power to Engines!", 
	"They are right on top of us! More Power to Sheilds!",
	"We are through their sheilds! More power to weapons! Lets finish this...",
	"Looks like they sent out a distress call, boost the sensors...", 
	"OH GOD LOOK AT THAT, power up the cloaking system!"],

		init: function( x, y, settings ) {
			this.parent( x, y, settings );
		},

		

		update: function() {
			this.parent();
		}

	});
});