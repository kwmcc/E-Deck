ig.module(
    'game.main'
)
.requires(
    'impact.game',
    'impact.font',
    'plugins.joncom.font-sugar.font',
    'plugins.notification-manager',
    //'game.levels.demo',
    //'game.levels.minerva',
    'game.levels.havok'
)
.defines(function(){

EDeck = ig.Game.extend({

    font: new ig.Font( 'media/04b03.font.png' ), //primary font
    iconFuelOn: new ig.Image( 'media/art/powericonon.png'),
    iconFuelOff: new ig.Image( 'media/art/powericonoff.png'),
    iconCoolOn: new ig.Image( 'media/art/cooliconon.png'),
    iconCoolOff: new ig.Image( 'media/art/cooliconoff.png'),
    
    //mission varaibles.
    voyageCounter : 50, //over all progress through the game
    eventTime : 0, //the current time in the event
    eventVictory : false, //the primary victory condition of the event.
    gameStatus: 0, //0 = no change, 1 = win, 2 = lose
    
    //event varaibles
    primarySystem: null,
    timeAllocated : 50, //this is the time allocated by the event
    reward : 50, //reward for suceeding in an event.
    penalty : -50, //penalty for failing to complete an event.
    
    //the temporary system for primary
    system : null,
    
    //system global variables
    sysEngines: null,
    sysShields: null,
    sysCloaking: null,
    sysWeapons: null,
    sysLifesupport: null,
    sysSensors: null,
       
    //the current event
    newEvent: true,
    currEvent: null,
    eventNum: 0,
    
    //player variables
    player : null,

    //NOTIFICATION MANAGER FROM PLUG IN
    myNoteMgr: new ig.NotificationManager(),
    //audio 
    //bgtune: new ig.Sound( 'media/audio/BGM2.*', false), //load background music

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
        ig.input.bind(ig.KEY.F, 'drop');
        
        //play the background music
        //ig.music.add( this.bgtune );
        ig.music.add('media/audio/BGM2.*');
        ig.music.volume = 0.5;
        ig.music.play();

        //load event
        this.currEvent = this.getEntitiesByType( EntityEvents )[0];
      
        // Load level.
        this.loadLevel(LevelHavok);
    },

    update: function() {
        
        this.myNoteMgr.update();
        this.parent();
    },

    //this camera is fixed with the level centered
    draw: function() {
        this.parent();


        //temp system.
        //system = this.getEntitiesByType( EntitySystem )[0];

        //initialize systems.
        sysEngines = this.getEntitiesByType( EntityEngines )[0];
        sysShields = this.getEntitiesByType( EntityShields )[0];
        sysCloaking = this.getEntitiesByType( EntityCloaking )[0];
        sysWeapons = this.getEntitiesByType( EntityWeapons )[0];
        sysLifesupport = this.getEntitiesByType( EntityLifesupport )[0];
        sysSensors = this.getEntitiesByType( EntitySensors )[0];
       
        //set player
        player = this.getEntitiesByType( EntityPlayer )[0];
        
        //fixed camera mode
        //this.screen.x = 16; //MAGIC NUMBERS
        //this.screen.y = 40; //AUUUUGH

        //follow camera mode
        if(player) {
            this.screen.x = player.pos.x - ig.system.width/2;
            this.screen.y = player.pos.y - ig.system.height/2;
        }
        
        //this.font.draw( 'Has Fuel: ' + player.hasFuel, 6, (this.font.height), ig.Font.ALIGN.LEFT );
        //this.font.draw( 'Has Coolant: ' + player.hasCool, 6, (this.font.height*2), ig.Font.ALIGN.LEFT);
        this.font.draw( 'Steps: ' + this.eventTime + '/' + this.timeAllocated, 6, (this.font.height*3), ig.Font.ALIGN.LEFT);
        this.font.draw( 'Voyage: ' + this.voyageCounter + '/' + 200, 6, (this.font.height*4), ig.Font.ALIGN.LEFT);
        this.font.draw( 'System: ' + this.primarySystem, 6, (this.font.height*5), ig.Font.ALIGN.LEFT);
        
        
        if(player.hasFuel) {
        	this.iconFuelOn.draw(5,3);
        } else {
        	this.iconFuelOff.draw(5,3);
        }
        if(player.hasCool) {
        	this.iconCoolOn.draw(28,3);
        } else {
        	this.iconCoolOff.draw(28,3);
        }

        //this sets up the next event where needed.
        if(this.newEvent){
	        //load event
	        this.currEvent = this.getEntitiesByType( EntityEvents )[0];

	        //this sets up the global variables for the new event
	        this.setUpEvent();

	        this.newEvent = false;

            if(this.eventNum != this.currEvent.numEvents - 1){ //makes sure it does not hop off end of array
                this.eventNum++; //need to check for array out of bounds.
            }
	        
        }
        
        if(player.hasMoved){

            this.checkingEv(); //iterates event time and applicable heat counters, handles win conditions
            

            //this checks for the win condition gameover screen should be in the else satement. 
            if(this.gameStatus == 1){
                console.log("YOU WIN THE GAME!!!! Voyage Counter: " + this.voyageCounter);
                 ig.system.setGame(GameWinScreen) 
            }else if(this.gameStatus == 2){
                console.log("YOU LOSE THE GAME!!! GOOD DAY SIR! Voyage Counter: " + this.voyageCounter);
                 ig.system.setGame(GameOverScreen) 
            }
            player.hasMoved = false;
        }
        //FROM NOTIFICATION MANAGER PLUG IN
        
    },

    checkingEv : function() {
            

            if(this.eventTime > this.timeAllocated-1){

                //set primary system
                if(this.primarySystem == 'Engines'){
                    sysEngines.isPrimary = true;
                    system = sysEngines;
                    console.log("Eng. is primary.");

                }else if(this.primarySystem == 'Shields'){
                    sysShields.isPrimary = true;
                    system = sysShields;
                    console.log("sheild is primary.");

                }else if(this.primarySystem == 'Cloaking'){
                    sysCloaking.isPrimary = true;
                    system = sysCloaking;
                    console.log("cloak is primary.");

                }else if(this.primarySystem == 'Weapons'){
                    sysWeapons.isPrimary = true;
                    system = sysWeapons;
                    console.log("wep. is primary.");

                }else if(this.primarySystem == 'Lifesupport'){
                    sysLifesupport.isPrimary = true;
                    system = sysLifesupport;
                    console.log("LS is primary.");

                }else if(this.primarySystem == 'Sensors'){
                    sysSensors.isPrimary = true;
                    system = sysSensors;
                    console.log("sensors is primary.");

                }else{
                    console.log("no primary system found.");
                }



                this.eventTime = 0; //resets the timne for the event

                //this checks the primary system of the event to see if it has been fueled.
                //this check should only happen once per event at the very end.

                //find the primary system in the event.


                if(system.isFueled){
                    this.eventVictory = true; //sets event victory to true
                    system.isFueled = false; //resets the system for next event
                }

                if(this.eventVictory && this.gameStatus == 0){
                    console.log("Event Success! Reward: " + this.reward);
                    this.voyageCounter += this.reward;
                    this.newEvent = true;
                    this.resetSystems();
                    
                    console.log("Voyage Counter : " + this.voyageCounter);
                    if(this.voyageCounter > 200){
                        this.gameStatus = 1;
                    }
                }else if(this.gameStatus == 0){
                        console.log("Event Failure! Penalty: " + this.penalty);
                        this.voyageCounter = this.voyageCounter - this.penalty;
                        this.newEvent = true;
                        this.resetSystems();
                    
                        console.log("Voyage Counter : " + this.voyageCounter);
                        if(this.voyageCounter <= 0){
                            this.gameStatus = 2;
                        }
                }
            }else{
                //incriments the event time
                this.eventTime ++; 

                //this is were the program should run through all the systems, and incriment the heat of each
                if(sysEngines.isHeating){
                   sysEngines.heat++;
                    console.log("engine heat increases to: " + sysEngines.heat);
                }else if(sysShields.isHeating){
                   sysShields.heat++;
                    console.log("sheild heat increases to: " + sysShields.heat);
                }else if(sysCloaking.isHeating){
                    sysCloaking.heat++;
                    console.log("cloak heat increases to: " + sysCloaking.heat);
                }else if(sysWeapons.isHeating){
                    sysWeapons.heat++;
                    console.log("weapons heat increases to: " + sysWeapons.heat);
                }else if(sysLifesupport.isHeating){
                    sysLifesupport.heat++;
                    console.log("LS heat increases to: " + sysLifesupport.heat);
                }else if(sysSensors.isHeating){
                    sysSensors.heat++;
                    console.log("sensors heat increases to: " + sysSensors.heat);
                }else{
                   // console.log("nothing to heat.");
                }


                if(sysEngines.isOverHeated){
                    sysEngines.isHeating = false;
                    this.voyageCounter = this.voyageCounter - 1;
                    console.log("engine overheating");
                }else if(sysShields.isOverHeated){
                    sysShields.isHeating = false;
                   this.voyageCounter = this.voyageCounter - 1;
                    console.log("sheild  overheating");
                }else if(sysCloaking.isOverHeated){
                    this.voyageCounter = this.voyageCounter - 1;
                    console.log("cloak overheating");
                }else if(sysWeapons.isOverHeated){
                    this.voyageCounter = this.voyageCounter - 1;
                    console.log("weapons overheating");
                }else if(sysLifesupport.isOverHeated){
                    this.voyageCounter = this.voyageCounter - 1;
                    console.log("LS overheating");
                }else if(sysSensors.isOverHeated){
                    this.voyageCounter = this.voyageCounter - 1;
                    console.log("sensors  overheating");
                }else{
                    //console.log("nothing overheating.");
                }




            }
        },

    //this function sets up a new event when needed.
    setUpEvent: function() {

        console.log('event :' + this.eventNum);
  
        this.timeAllocated = this.currEvent.timeAllocated[this.eventNum];
        console.log('time allocated: ' + this.timeAllocated);

        this.reward = this.currEvent.reward[this.eventNum];
        console.log('reward: ' + this.reward);

        this.penalty = this.currEvent.penalty[this.eventNum];
        console.log('time penalty: '  + this.penalty);

        this.primarySystem = this.currEvent.primarySystem[this.eventNum];
        console.log('primary system: ' + this.primarySystem);

        //alert("an alert");
         this.myNoteMgr.spawn('media/font.png', this.currEvent.captiansOrd[this.eventNum],  6, (this.font.height*6), ig.Font.ALIGN.LEFT);
         this.myNoteMgr.draw();

    },

    //resets system booleans back to normal.
    resetSystems: function() {
                sysEngines.isPrimary = false;
                sysEngines.isFueled = false;
                sysEngines.isCooled = false;

                sysShields.isPrimary = false;
                sysShields.isFueled = false;
                sysShields.isCooled = false;

                sysWeapons.isPrimary = false;
                sysWeapons.isFueled = false;
                 sysWeapons.isCooled = false;

                sysCloaking.isPrimary = false;
                sysCloaking.isFueled = false;
                sysCloaking.isCooled = false;

                sysLifesupport.isPrimary = false;
                sysLifesupport.isFueled = false;
                sysLifesupport.isCooled = false;

                sysSensors.isPrimary = false;
                sysSensors.isFueled = false;
                sysSensors.isCooled = false;

    },
   
});

MenuScreen = ig.Game.extend({
    font: new ig.Font( 'media/04b03.font.png' ),
    background: new ig.Image( 'media/art/start.png' ),
    title: new ig.Image('media/art/titlesmall.png'),

    init: function() {
        ig.input.bind(ig.KEY.SPACE, 'start');
        ig.input.bind(ig.KEY.I, 'instruct');
        ig.input.bind(ig.KEY.C, 'credits');
        ig.input.bind(ig.KEY.W, 'gamewin');
        ig.input.bind(ig.KEY.G, 'gameover');
    },

    update: function() {
        if(ig.input.pressed('start')) ig.system.setGame(EDeck)
        if(ig.input.pressed('instruct')) ig.system.setGame(InstructionScreen)
        if(ig.input.pressed('credits')) ig.system.setGame(CreditScreen)
        if(ig.input.pressed('gamewin')) ig.system.setGame(GameWinScreen)
        if(ig.input.pressed('gameover')) ig.system.setGame(GameOverScreen)
        this.parent();
    },

    draw: function() {
        this.parent();
        this.background.draw(0, 0, 250, 200, 300, 220);
        var x = 5;
        var y = ig.system.height;
        this.title.draw(ig.system.width/2 - this.title.width/2, 5);
        this.font.draw('[#F7FE2E <Space>] Start Game', x, y - this.font.height*5);
        this.font.draw('[#F7FE2E <I>] Instructions', x, y - this.font.height*4);
        this.font.draw('[#F7FE2E <C>] Credits', x, y - this.font.height*3);
        this.font.draw('[#F7FE2E <W>] Debug Game Win', x, y - this.font.height*2);
        this.font.draw('[#F7FE2E <G>] Debug Game Over', x, y - this.font.height);
    }
});

InstructionScreen = ig.Game.extend({
    font: new ig.Font('media/04b03.font.png', {fontColor: '#000'}),
    infos: new ig.Image('media/art/infoScreen.png'),
	//background: new ig.Image('media/art/end.png'),

    init: function() {
        ig.input.bind(ig.KEY.ESC, 'menu');
    },

    update: function() {
        if(ig.input.pressed('menu')) ig.system.setGame(MenuScreen)
        this.parent();
    },

    draw: function() {
        this.parent();
        //this.background.draw(0,0);
        var x = ig.system.width/2;
        this.infos.draw(x - (this.infos.width/2), 0);
        this.font.draw('[#5858FA <ESC>] Menu', 46, ig.system.height - 26);
    }
});

CreditScreen = ig.Game.extend({
    font: new ig.Font('media/04b03.font.png', {fontColor: '#000'}),
    credits: new ig.Image('media/art/creditScreen.png'),
    //background: new ig.Image('media/art/end.png'),

    init: function() {
        ig.input.bind(ig.KEY.ESC, 'menu');
    },

    update: function() {
        if(ig.input.pressed('menu')) ig.system.setGame(MenuScreen)
        this.parent();
    },

    draw: function() {
        this.parent();
        //this.background.draw(0,0);
        var x = ig.system.width/2;
        this.credits.draw(x - (this.credits.width/2), 0);
		this.font.draw('[#5858FA <ESC>] Menu', 46, ig.system.height - 26);
    }
});

GameWinScreen = ig.Game.extend({
    font: new ig.Font('media/04b03.font.png'),
    gameOver: new ig.Image('media/art/gameoversmall.png'),
    background: new ig.Image('media/art/end.png'),

    init: function() {
        ig.input.bind(ig.KEY.ESC, 'menu');
    },

    update: function() {
        if(ig.input.pressed('menu')) ig.system.setGame(MenuScreen)
        this.parent();
    },

    draw: function() {
        this.parent();
        this.background.draw(0,0);
        var x = ig.system.width/2;
        var y = ig.system.height/2;
        this.gameOver.draw(x - (this.gameOver.width/2), this.gameOver.height/2 - 50);
        this.font.draw('[#F7FE2E <ESC>] Menu', 5, ig.system.height - this.font.height);

    }
});

GameOverScreen = ig.Game.extend({
    font: new ig.Font('media/04b03.font.png'),
    gameOver: new ig.Image('media/art/gameoversmall.png'),
    background: new ig.Image('media/art/end.png'),
    

    init: function() {
        ig.input.bind(ig.KEY.SPACE, 'restart');
        ig.input.bind(ig.KEY.ESC, 'menu');
        var explosion = new ig.Sound('media/audio/explosion.*',false);
        explosion.play();
        ig.music.stop();
    },

    update: function() {
        if(ig.input.pressed('menu')) ig.system.setGame(MenuScreen)
        else if (ig.input.pressed('restart')) ig.system.setGame(EDeck)
        this.parent();
    },

    draw: function() {
        this.parent();
        this.background.draw(0,0);
        var x = ig.system.width/2;
        var y = ig.system.height/2;
        this.gameOver.draw(x - (this.gameOver.width/2), this.gameOver.height/2 - 50);
        this.font.draw('[#F7FE2E <Space>] Restart', 5, ig.system.height - (this.font.height*2));
        this.font.draw('[#F7FE2E <ESC>] Menu', 5, ig.system.height - this.font.height);

    }
});

ig.main( '#canvas', MenuScreen, 60, 300, 220, 2 );

});
