
ig.module( 'game.entities.events' )
.requires( 'impact.entity' )
.defines(function() {
	EntityEvents = ig.Entity.extend({
	
	timeAllocated: [50, 50 ,60 ,60, 40, 50],
	penalty: [20, 20, 30, 60, 50, 100],
	reward: [30,20,30,60,30, 100],

	//can read: engines, shields, weapons lifesupport sensors, cloaking
	primarySystem: ['Engines', 'Shields', 'Weapons', 'Sensors', 'Cloaking'],
	captiansOrd: 
	["Pirates are inbound! More Power to Engines!", 
	"They are right on top of us! More Power to Sheilds!",
	"We are through their sheilds! More power to weapons! Lets finish this...",
	"Looks like they sent out a distress call, boost the sensors...", 
	"OH GOD LOOK AT THAT, power up the cloaking system!"],

	captiansLament:
	["They are bearing down on us!", "Sheilds Down!", "They are getting away!", "All quiet...", "They found us! Oh GOD,.,., beh...."],

		init: function( x, y, settings ) {
			this.parent( x, y, settings );
		},

		

		update: function() {
			this.parent();
		}

	});
});