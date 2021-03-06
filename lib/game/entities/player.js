//this code is adapted from code from:
// https://github.com/Joncom/impact-grid-movement/commit/15c770fe4cc1200a32fe88d21e3441abfcffb9be#diff-0bb377290a5cb6a6a0ad967e4a5fb754R16

ig.module('game.entities.player')
.requires('impact.entity')
.defines(function() {

    EntityPlayer = ig.Entity.extend({

        size: { x: 16, y: 16 },
        collides: ig.Entity.COLLIDES.LITE,
        speed: 100,
        //animSheet: new ig.AnimationSheet('media/art/playerWalk.png', 16, 16),
        animSheet: new ig.AnimationSheet('media/art/playerWalkAll.png', 16, 16),
        footsteps: new ig.Sound('media/audio/solid_metal_footsteps.*'),
        cooling: new ig.Sound('media/audio/new_cooling.*',false),
        coreDropSound: new ig.Sound('media/audio/drop_something.*',false),

        moveIntention: null,
        lastMove: null,
        destination: null,
        hasCool: false,
        hasFuel: false,
        hasMoved: false,
        steps: 0,
        sysArray: ["EntityEngines", "EntityShields", "EntityCloaking", "EntityWeapons", "EntityLifesupport", "EntitySensors"],
        sysCheck: null,
        fuelCheck: null,
        coolCheck: null,

        init: function(x, y, settings) {
            this.parent(x, y, settings);

            //Animation declarations
            this.addAnim('defU', 1, [0]);
            this.addAnim('defR', 1, [4]);
            this.addAnim('defU_C', 1, [8]);
            this.addAnim('defR_C', 1, [12]);
            this.addAnim('defU_F', 1, [16]);
            this.addAnim('defR_F', 1, [20]);
            this.addAnim('animU', 0.05, [0, 1, 2, 3]); //use .flip.y for down
            this.addAnim('animR', 0.05, [4, 5, 6, 7]); //use .flip.x for left
            this.addAnim('animU_C', 0.05, [8, 9, 10, 11]);
            this.addAnim('animR_C', 0.05, [12, 13, 14, 15]);
            this.addAnim('animU_F', 0.05, [16, 17, 18, 19]);
            this.addAnim('animR_F', 0.05, [20, 21, 22, 23]);


            // Set speed as the max velocity.
            this.maxVel.x = this.maxVel.y = this.speed;
        },

        update: function() {

            // It's important that this call occur before the movement code below,
            // because otherwise you would sometimes see the entity move past his
            // destination slightly just before snapping back into place.
            this.parent();

            // Set movement intention based on input.
            this.moveIntention = null; // clear old move input
            if(ig.input.state('act')){
                this.coreInteract();
            }
            if(ig.input.state('drop')){
                this.coreDrop();
            }
            if(ig.input.state('right')) {
            	this.moveIntention = moveType.RIGHT;
            }
            else if(ig.input.state('left')) {
            	this.moveIntention = moveType.LEFT;
            }
            else if(ig.input.state('up')) {
            	this.moveIntention = moveType.UP;
            }
            else if(ig.input.state('down')) {
            	this.moveIntention = moveType.DOWN;
            }

            // Stop the moving entity if at the destination.
            if(this.isMoving() && this.justReachedDestination() && !this.moveIntention) {
                this.stopMoving();
                this.getStopDir();
            }
            // Stop the moving entity when it hits a wall.
            else if(this.isMoving() && this.justReachedDestination() && this.moveIntention &&
                    !this.canMoveDirectionFromTile(this.destination.x, this.destination.y, this.moveIntention)) {
                this.stopMoving();
            	this.getStopDir();
            }
            // Destination reached, but set new destination and keep going.
            else if(this.isMoving() && this.justReachedDestination() && this.moveIntention &&
                    this.canMoveDirectionFromTile(this.destination.x, this.destination.y, this.moveIntention) &&
                    this.moveIntention === this.lastMove) {
                this.continueMovingFromDestination();
                this.getMoveDir();
            }
            // Destination reached, but changing direction and continuing.
            else if(this.isMoving() && this.justReachedDestination() && this.moveIntention &&
                    this.canMoveDirectionFromTile(this.destination.x, this.destination.y, this.moveIntention) &&
                    this.moveIntention !== this.lastMove) {
                this.changeDirectionAndContinueMoving(this.moveIntention);
                this.getMoveDir();
            }
            // Destination not yet reached, so keep going.
            else if(this.isMoving() && !this.justReachedDestination()) {
                this.continueMovingToDestination();
                this.getMoveDir();
            }
            // Not moving, but wanting to, so start!
            else if(!this.isMoving() && this.moveIntention &&
                    this.canMoveDirectionFromCurrentTile(this.moveIntention)) {
                this.startMoving(this.moveIntention);
                this.getMoveDir();
            }

        },

        getCurrentTile: function() {
            var tilesize = ig.game.collisionMap.tilesize;
            var tileX = this.pos.x / tilesize;
            var tileY = this.pos.y / tilesize;
            return { x: tileX, y: tileY };
        },

        getTileAdjacentToTile: function(tileX, tileY, direction) {
            if(direction === moveType.UP) tileY += -1;
            else if(direction === moveType.DOWN) tileY += 1;
            else if(direction === moveType.LEFT) tileX += -1;
            else if(direction === moveType.RIGHT) tileX += 1;
            return { x: tileX, y: tileY };
        },

        startMoving: function(direction) {
            // Get current tile position.
            var currTile = this.getCurrentTile();
            // Get new destination.
            this.destination = this.getTileAdjacentToTile(currTile.x, currTile.y, direction);
            // Move.
            this.setVelocityByTile(this.destination.x, this.destination.y, this.speed);
            // Remember this move for later.
            this.lastMove = direction;
        },

        continueMovingToDestination: function() {
            // Move.
            this.setVelocityByTile(this.destination.x, this.destination.y, this.speed);
        },

        continueMovingFromDestination: function() {
            // Get new destination.
            this.destination = this.getTileAdjacentToTile(this.destination.x, this.destination.y, this.lastMove);
            // Move.
            this.setVelocityByTile(this.destination.x, this.destination.y, this.speed);
            //increment steps taken
            this.hasMoved = true;
            this.steps += 1;
        },

        changeDirectionAndContinueMoving: function(newDirection) {
            // Method only called when at destination, so snap to it now.
            this.snapToTile(this.destination.x, this.destination.y);
            // Get new destination.
            this.destination = this.getTileAdjacentToTile(this.destination.x, this.destination.y, newDirection);
            // Move.
            this.setVelocityByTile(this.destination.x, this.destination.y, this.speed);
            // Remember this move for later.
            this.lastMove = newDirection;
            //increment steps taken
            this.hasMoved = true;
            this.steps += 1;
        },

        stopMoving: function() {
            // Method only called when at destination, so snap to it now.
            this.snapToTile(this.destination.x, this.destination.y);
            // We are already at the destination.
            this.destination = null;
            // Stop.
            this.vel.x = this.vel.y = 0;
            //increment steps taken
            this.hasMoved = true;
            this.steps += 1;
        },

        snapToTile: function(x, y) {
            var tilesize = ig.game.collisionMap.tilesize;
            this.pos.x = x * tilesize;
            this.pos.y = y * tilesize;
        },

        justReachedDestination: function() {
            var tilesize = ig.game.collisionMap.tilesize;
            var destinationX = this.destination.x * tilesize;
            var destinationY = this.destination.y * tilesize;
            var result = (
                (this.pos.x >= destinationX && this.last.x < destinationX) ||
                (this.pos.x <= destinationX && this.last.x > destinationX) ||
                (this.pos.y >= destinationY && this.last.y < destinationY) ||
                (this.pos.y <= destinationY && this.last.y > destinationY)
            );
            return result;
        },

        isMoving: function() {
            return this.destination !== null;
        },

        canMoveDirectionFromTile: function(tileX, tileY, direction) {
            var newPos = this.getTileAdjacentToTile(tileX, tileY, direction);
            return ig.game.collisionMap.data[newPos.y][newPos.x] === 0;
        },

        canMoveDirectionFromCurrentTile: function(direction) {
            var currTile = this.getCurrentTile();
            return this.canMoveDirectionFromTile(currTile.x, currTile.y, direction);
        },

        // Sets the velocity of the entity so that it will move toward the tile.
        setVelocityByTile: function(tileX, tileY, velocity) {
            var tilesize = ig.game.collisionMap.tilesize;
            var tileCenterX = tileX * tilesize + tilesize/2;
            var tileCenterY = tileY * tilesize + tilesize/2;
            var entityCenterX = this.pos.x + this.size.x / 2;
            var entityCenterY = this.pos.y + this.size.y / 2;
            this.vel.x = this.vel.y = 0;
            if(entityCenterX > tileCenterX) this.vel.x = -velocity;
            else if(entityCenterX < tileCenterX) this.vel.x = velocity;
            else if(entityCenterY > tileCenterY) this.vel.y = -velocity;
            else if(entityCenterY < tileCenterY) this.vel.y = velocity;
        },

        //handles all interactions between the player and cores
        coreInteract: function() {
            for (var i = this.sysArray.length - 1; i >= 0; i--) {
                this.sysCheck = ig.game.getEntitiesByType(this.sysArray[i]);
                if(this.sysCheck){
                    if(this.hasFuel) { //if player has a fuel core
                        for(var j = 0; j < this.sysCheck.length; j++) { 
                            if(this.distanceTo(this.sysCheck[j]) <= 23) { //check if there's a system nearby
                                this.hasFuel = false; 
                                this.sysCheck[j].isFueled = true;
                                this.sysCheck[j].playSound();
                                console.log(this.sysCheck[j] + " Fueled");
                            }
                        }
                    }
                    if(this.hasCool) { //or if they have a coolant core
                        for(var j = 0; j < this.sysCheck.length; j++) {
                            if(this.distanceTo(this.sysCheck[j]) <= 23) { //check for closeby systems
                                this.hasCool = false;
                                this.sysCheck[j].isCooled = true;
                                this.cooling.play();
                                console.log(this.sysCheck[j] + " Cooled");
                            }
                        }
                    }
                }
            };

            if(!this.hasFuel && !this.hasCool){
                this.corePickup();
            }
        },

        coreDrop: function() {
            if(this.hasFuel) {
                this.hasFuel = false;
                console.log("Fuel Dropped");
                ig.game.spawnEntity(EntityFuel, this.pos.x, this.pos.y);
                ig.game.sortEntitiesDeferred();
                this.coreDropSound.play();
            } else if(this.hasCool) {
                this.hasCool = false;
                console.log("Coolant Dropped");
                ig.game.spawnEntity(EntityCool, this.pos.x, this.pos.y);
                ig.game.sortEntitiesDeferred();
                this.coreDropSound.play();
            } else {
                console.log("No Core to Drop");
            }
        },

        //this function could be made half as long with a foreach checking Cool and Fuel...
        corePickup: function() {
            console.log("Attempting Pickup...");
            this.fuelCheck = ig.game.getEntitiesByType(EntityFuel);
            this.coolCheck = ig.game.getEntitiesByType(EntityCool);

            if(this.fuelCheck) {
                for(var i = 0; i < this.fuelCheck.length; i++) {
                    if(this.touches(this.fuelCheck[i])) {
                        this.hasFuel = true;
                        this.fuelCheck[i].kill();
                        console.log("Fuel Core Acquired");
                    }
                }
            } 
            if(this.coolCheck) {
                for(var i = 0; i < this.coolCheck.length; i++) {
                    if(this.touches(this.coolCheck[i])) {
                        this.hasCool = true;
                        this.coolCheck[i].kill();
                        console.log("Coolant Core Acquired");
                    }
                }
            } else {
                console.log("No Core to Pickup");
            }
        },

        getStopDir: function() {
            if(this.lastMove == 1) { //up
                if(this.hasCool) {
                    this.currentAnim = this.anims.defU_C;
                    this.currentAnim.flip.y = false;
                } else if(this.hasFuel) {
                    this.currentAnim = this.anims.defU_F;
                    this.currentAnim.flip.y = false;
                } else {
                    this.currentAnim = this.anims.defU;
                    this.currentAnim.flip.y = false;
                }
            } else if(this.lastMove == 2) { //down
                if(this.hasCool) {
                    this.currentAnim = this.anims.defU_C;
                    this.currentAnim.flip.y = true;
                } else if(this.hasFuel) {
                    this.currentAnim = this.anims.defU_F;
                    this.currentAnim.flip.y = true;
                } else {
                    this.currentAnim = this.anims.defU;
                    this.currentAnim.flip.y = true;
                }
            } else if(this.lastMove == 4) { //left
                if(this.hasCool) {
                    this.currentAnim = this.anims.defR_C;
                    this.currentAnim.flip.x = true;
                } else if(this.hasFuel) {
                    this.currentAnim = this.anims.defR_F;
                    this.currentAnim.flip.x = true;
                } else {
                    this.currentAnim = this.anims.defR;
                    this.currentAnim.flip.x = true;
                }
            } else if(this.lastMove == 8) { //right
                if(this.hasCool) {
                    this.currentAnim = this.anims.defR_C;
                    this.currentAnim.flip.x = false;
                } else if(this.hasFuel) {
                    this.currentAnim = this.anims.defR_F;
                    this.currentAnim.flip.x = false;
                } else {
                    this.currentAnim = this.anims.defR;
                    this.currentAnim.flip.x = false;
                }
            }
        },

        getMoveDir: function() {
            if(this.moveIntention == 1) { //up
                if(this.hasCool) {
                    this.currentAnim = this.anims.animU_C;
                    this.currentAnim.flip.y = false;
                } else if(this.hasFuel) {
                    this.currentAnim = this.anims.animU_F;
                    this.currentAnim.flip.y = false;
                } else {
                    this.currentAnim = this.anims.animU;
                    this.currentAnim.flip.y = false;
                }
            } else if(this.moveIntention == 2) { //down
                if(this.hasCool) {
                    this.currentAnim = this.anims.animU_C;
                    this.currentAnim.flip.y = true;
                } else if(this.hasFuel) {
                    this.currentAnim = this.anims.animU_F;
                    this.currentAnim.flip.y = true;
                } else {
                    this.currentAnim = this.anims.animU;
                    this.currentAnim.flip.y = true;
                }
            } else if(this.moveIntention == 4) { //left
                if(this.hasCool) {
                    this.currentAnim = this.anims.animR_C;
                    this.currentAnim.flip.x = true;
                } else if(this.hasFuel) {
                    this.currentAnim = this.anims.animR_F;
                    this.currentAnim.flip.x = true;
                } else {
                    this.currentAnim = this.anims.animR;
                    this.currentAnim.flip.x = true;
                }
            } else if(this.moveIntention == 8) { //right
                if(this.hasCool) {
                    this.currentAnim = this.anims.animR_C;
                    this.currentAnim.flip.x = false;
                } else if(this.hasFuel) {
                    this.currentAnim = this.anims.animR_F;
                    this.currentAnim.flip.x = false;
                } else {
                    this.currentAnim = this.anims.animR;
                    this.currentAnim.flip.x = false;
                }
            }
        }

    });

    var moveType = {
        'UP': 1,
        'DOWN': 2,
        'LEFT': 4,
        'RIGHT': 8
    };

});
