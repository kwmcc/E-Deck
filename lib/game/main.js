ig.module(
    'game.main'
)
.requires(
    'impact.game',
    'impact.font',
    'game.levels.demo',
    'game.levels.minerva'
)
.defines(function(){

MyGame = ig.Game.extend({

    font: new ig.Font( 'media/04b03.font.png' ), //primary font
    
    //event and mission varaibles.
    voyageCounter : 50, //over all progress through the game
    eventTime : 0, //the current time in the event
    eventVictory : false, //the primary victory condition of the event.
    gameStatus: 0, //0 = no change, 1 = win, 2 = lose
    primarySystem: 'one',
    timeAllocated : 50, //this is the time allocated by the event
    reward : 50, //reward for suceeding in an event.
    penalty : -50, //penalty for failing to complete an event.
    
    system : null,
    //player variables
    player : null,



    //audio 
    bgtune: new ig.Sound( 'media/audio/BGM2.*', false), //load background music

    init: function() {

        // Bind keys.
        ig.input.bind(ig.KEY.UP_ARROW, 'up');
        ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
        ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
        ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
        ig.input.bind(ig.KEY.W, 'up');
        ig.input.bind(ig.KEY.S, 'down');
        ig.input.bind(ig.KEY.A, 'left');
        ig.input.bind(ig.KEY.D, 'right');
        ig.input.bind(ig.KEY.E, 'act');
        ig.input.bind(ig.KEY.SPACE, 'act');
        
        //play the background music
        ig.music.add( this.bgtune );
        ig.music.play();

        // Load level.
        this.loadLevel(LevelMinerva);
    },


    //this camera is fixed with the level centered
    draw: function() {
        this.parent();
        
        player = this.getEntitiesByType( EntityPlayer )[0];
        
        //fixed camera mode
        //this.screen.x = 16; //MAGIC NUMBERS
        //this.screen.y = 40; //AUUUUGH

        //follow camera mode
        if(player) {
            this.screen.x = player.pos.x - ig.system.width/2;
            this.screen.y = player.pos.y - ig.system.height/2;
        }
        
        this.font.draw( 'Has Fuel: ' + player.hasFuel, 6, (this.font.height), ig.Font.ALIGN.LEFT );
        this.font.draw( 'Has Coolant: ' + player.hasCool, 6, (this.font.height*2), ig.Font.ALIGN.LEFT);
        this.font.draw( 'Steps: ' + this.eventTime + ' / ' + this.timeAllocated, 6, (this.font.height*3), ig.Font.ALIGN.LEFT);
        this.font.draw( 'Voyage: ' + this.voyageCounter + ' / ' + 100, 6, (this.font.height*4), ig.Font.ALIGN.LEFT);

        if(player.hasMoved){
            //console.log("player has moved");
            this.checkingEv(); //iterates event time, and such
            

            //this checks for the win condition gameover screen should be in the else satement. 
            if(this.gameStatus == 1){
                console.log("YOU WIN THE GAME!!!! Voyage Counter: " + this.voyageCounter);
            }else if(this.gameStatus == 2){
                console.log("YOU LOSE THE GAME!!! GOOD DAY SIR! Voyage Counter: " + this.voyageCounter);
            }
            player.hasMoved = false;
        }
    },

    checkingEv : function() {
           
            system = this.getEntityByName(this.primarySystem);
            
            if(this.eventTime > this.timeAllocated-1){
                system = this.getEntityByName(this.primarySystem);
                

                this.eventTime = 0; //resets the timne for the event

                //this checks the primary system of the event to see if it has been fueled.
                //this check should only happen once per event at the very end.
                if(system.isFueled){
                    this.eventVictory = true; //sets event victory to true
                    system.isFueled = false; //resets the system for next event
                }

                if(this.eventVictory && this.gameStatus == 0){
                    console.log("Event Success! Reward: " + this.reward);
                    this.voyageCounter += this.reward;
                    console.log("Voyage Counter : " + this.voyageCounter);
                    if(this.voyageCounter > 100){
                        this.gameStatus = 1;
                    }
                }else if(this.gameStatus == 0){
                        console.log("Event Failure! Penalty: " + this.penalty);
                        this.voyageCounter += this.penalty;
                    
                        console.log("Voyage Counter : " + this.voyageCounter);
                        if(this.voyageCounter <= 0){
                            this.gameStatus = 2;
                        }
                }
            }else{
                this.eventTime ++; 
                //this is were the program should run through all the systems, and incriment the heat of each
                if(system.isHeating){
                    system.heat++;
                    console.log('heat increases to : ' + system.heat);
                }
            }
        }

    //this camera follows the player
    /*draw: function() {
        var player = this.getEntitiesByType( EntityPlayer )[0];
        if(player) {
            this.screen.x = player.pos.x - ig.system.width/2;
            this.screen.y = player.pos.y - ig.system.height/2;
        }
        this.parent();
    }*/
});

ig.main( '#canvas', MyGame, 60, 220, 220, 3 );

});
