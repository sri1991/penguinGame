// Start enchant.js
enchant();
 
window.onload = function() {
    // Starting point
    var game = new Game(920, 600);
    game.preload('res/BG.png',
                 'res/penguinSheet.png',
                 'res/Ice.png'
                );
    game.fps = 30;
    game.scale = 1;
    game.onload = function() {
        // Once Game finish loading
        console.log("Hello shivam and shree well done");
        var scene = new SceneGame();
        game.pushScene(scene);
    }
    window.scrollTo(0,0);
    game.start();   
};

/**
 * SceneGame  
 */
var SceneGame = Class.create(Scene, {
    /**
     * The main gameplay scene.     
     */
    initialize: function() {
        var game, label, bg, penguin, iceGroup;
 
        // Call superclass constructor
        Scene.apply(this);
 
        // Access to the game singleton instance
        game = Game.instance;
 
        label = new Label('SCORE<br>0');
        label.x = 9;
        label.y = 32;        
        label.color = 'white';
        label.font = '16px strong';
        label.textAlign = 'center';
        label._style.textShadow ="-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
        this.scoreLabel = label;        
 
        bg = new Sprite(920,600);
        bg.image = game.assets['res/BG.png'];

        penguin = new Penguin();
        penguin.x = game.width/2 - penguin.width/2;
        penguin.y = 450;
        this.penguin = penguin;

        iceGroup = new Group();
        this.iceGroup = iceGroup;
 
        this.addChild(bg);
        this.addChild(iceGroup);
        this.addChild(penguin);
        this.addChild(label);

        this.addEventListener(Event.TOUCH_START,this.handleTouchControl);
        this.addEventListener(Event.ENTER_FRAME,this.update);

        // Instance variables
        this.generateIceTimer = 0;
        this.scoreTimer = 0;
        this.score = 0;

       
    },

    handleTouchControl: function (evt) {
        var laneWidth, lane;
        laneWidth = 920/10;
        lane = Math.floor(evt.x/laneWidth);
        lane = Math.max(Math.min(8,lane),0);
        this.penguin.switchToLaneNumber(lane);
    },

    update: function(evt) {
        // Score increase as time pass
        this.scoreTimer += evt.elapsed * 0.001;
        if(this.scoreTimer >= 0.5)
        {
            this.setScore(this.score + 1);
            this.scoreTimer -= 0.5;
        }

        // Check if it's time to create a new set of obstacles
        this.generateIceTimer += evt.elapsed * 0.0018;
        if(this.generateIceTimer >= 0.5)
        {
            var ice;
            this.generateIceTimer -= 0.5;
            ice = new Ice(Math.floor(Math.random()*9));
            this.iceGroup.addChild(ice);
        }

        // Check collision
        var i = this.iceGroup.childNodes.length - 1;
        while( i >= 0) 
        {
            var ice;
            ice = this.iceGroup.childNodes[i];
            if(ice.intersect(this.penguin)){  
                var game;
                game = Game.instance;
                                  
                this.iceGroup.removeChild(ice);
               
                game.replaceScene(new SceneGameOver(this.score));        
                break;
            }
            i--;
        }

        // Loop BGM
        
    },

    setScore: function (value) {
        this.score = value;
        this.scoreLabel.text = 'SCORE<br>' + this.score;
    }
});

/**
 * Penguin
 */
 var Penguin = Class.create(Sprite, {
    /**
     * The player character.     
     */
    initialize: function() {
        // Call superclass constructor
        Sprite.apply(this,[60, 86]);
        this.image = Game.instance.assets['res/penguinSheet.png'];        
        this.animationDuration = 0;
        this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
    },

    updateAnimation: function (evt) {        
        this.animationDuration += evt.elapsed * 0.001;       
        if(this.animationDuration >= 0.25)
        {
            this.frame = (this.frame + 1) % 2;
            this.animationDuration -= 0.25;
        }
    },

    switchToLaneNumber: function(lane){     
        var targetX = 160 - this.width/2 + (lane-1)*90;
        this.x = targetX;
    }
});

 /**
 * Ice Cube
 */
var Ice = Class.create(Sprite, {
    /**
     * The obstacle that the penguin must avoid
     */
    initialize: function(lane) {
        // Call superclass constructor
        Sprite.apply(this,[48, 49]);
        this.image  = Game.instance.assets['res/Ice.png'];      
        this.rotationSpeed = 7;
        this.setLane(lane);
        this.addEventListener(Event.ENTER_FRAME, this.update);
    },

    setLane: function(lane) {
        var game, distance;
        game = Game.instance;        
        distance = 90;
     
        this.rotationSpeed = Math.random() * 100 - 50;
     
        this.x = game.width/6 - this.width/2 + (lane - 1) * distance;
        this.y = -this.height;    
        this.rotation = Math.floor( Math.random() * 360 );    
    },

    update: function(evt) { 
        var ySpeed, game;
     
        game = Game.instance;
        ySpeed = 600;
     
        this.y += ySpeed * evt.elapsed * 0.001;
        this.rotation += this.rotationSpeed * evt.elapsed * 0.001;           
        if(this.y > game.height)
        {
            this.parentNode.removeChild(this);          
        }
    }
});

/**
 * SceneGameOver  
 */
var SceneGameOver = Class.create(Scene, {
    initialize: function(score) {
        var gameOverLabel, scoreLabel;
        Scene.apply(this);
        this.backgroundColor = '#980000 ';

        gameOverLabel = new Label("GAME OVER <br> Click to Restart");
        gameOverLabel.x = 290;
        gameOverLabel.y = 228;
        gameOverLabel.color = 'white';
        gameOverLabel.font = '32px strong';
        gameOverLabel.textAlign = 'center';

        scoreLabel = new Label('SCORE<br>' + score);
        scoreLabel.x = 290;
        scoreLabel.y = 30;        
        scoreLabel.color = 'white';
        scoreLabel.font = '16px strong';
        scoreLabel.textAlign = 'center';

        this.addChild(gameOverLabel);
        this.addChild(scoreLabel);

        this.addEventListener(Event.TOUCH_START, this.touchToRestart);


    },

    touchToRestart: function(evt) {
        var game = Game.instance;
        game.replaceScene(new SceneGame());
    }
});