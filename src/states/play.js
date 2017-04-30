import Phaser from 'phaser';

export default class extends Phaser.State {
  create() {
    this.cursor = this.input.keyboard.createCursorKeys();

    this.player = this.add.sprite(this.game.width/2, this.game.height/2, 'atlas', 'player01');
    this.player.anchor.setTo(0.5, 0.5);

    // Tell Phaser that the player will use the Arcade physics engine
    this.physics.arcade.enable(this.player);

    // Add vertical gravity to the player
    this.player.body.gravity.y = 500;

    this.createWorld();
    this.createPointSystem();
    this.createEnemies();

    this.game.global.score = 0;

    this.extractAudio();

    // Create the 'right' animation by looping the frames 1 and 2
    this.player.animations.add('right', ['player02', 'player03'], 8);

    // Create the 'left' animation by looping the frames 3 and 4
    this.player.animations.add('left', ['player04', 'player05'], 8);

    // Create the emitter with 15 particles.  We don't need to set the x y
    // Since we don't know where to do the explosion yet
    this.emitter = this.add.emitter(0, 0, 15);

    // Set the 'pixel' image for the particles
    this.emitter.makeParticles('atlas', 'pixel');

    // Set the x and y speed of the particles betweeen -150 and 150
    // Speed will be randomly picked between -150 and 150 for each particle
    this.emitter.setYSpeed(-500, 500);
    this.emitter.setXSpeed(-500, 500);

    this.emitter.minParticleSpeed.setTo(-500, -500);
    this.emitter.maxParticleSpeed.setTo(500, 500);

    // Scale the particles from 2 time their size to 0 in 800 ms
    // Parameters are: startX, endX, startY, endY, duration
    this.emitter.setScale(2, 0, 2, 0, 800);

    // Use no gravity
    this.emitter.gravity = 200;

    this.input.keyboard.addKeyCapture(
      [Phaser.Keyboard.UP, Phaser.Keyboard.DOWN,
      Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT]
    );

    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Keyboard.W),
      left: this.input.keyboard.addKey(Phaser.Keyboard.A),
      right: this.input.keyboard.addKey(Phaser.Keyboard.D),
    }

    if (!this.game.device.desktop) {
      this.addMobileInputs();
      this.addMobileOrientationListener();
    }
  }

  update() {
    if (!this.player.alive) {
      return;
    }

    this.physics.arcade.collide(this.player, this.layer);
    this.physics.arcade.collide(this.enemies, this.layer);

    if (!this.player.inWorld) {
      this.playerDie();
    }

    this.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
    this.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);

    this.movePlayer();

    if (this.nextEnemy < this.time.now) {
      // Define our variables
      var start = 4000, end = 1000, score = 100;

      // Formula to decrease the delay b/w enemies over time
      // At first it's 4000ms, then slowly goes to 1000ps
      var delay = Math.max(
        start - (start - end) * this.game.global.score / score, end);

      // Create a new enemy and update the 'nextEnemy' time
      this.addEnemy();
      this.nextEnemy = this.time.now + delay;

    }
  }

  createWorld() {
    // Create the tilemap
    this.map = this.add.tilemap('map');

    // Add the tileset to the map
    this.map.addTilesetImage('tileset');

    // Create the layer by specifying the name of the Tiled layer
    this.layer = this.map.createLayer('Tile Layer 1');

    // Set the world size to match the size of the layer
    this.layer.resizeWorld();

    // Enable collision for the first tileset element (the blue wall)
    this.map.setCollision(1);
  }

  createPointSystem() {
    // Display the coin
    this.coin = this.add.sprite(60, 140, 'atlas', 'coin');

    // Add Arcade physics to the coin
    this.physics.arcade.enable(this.coin);

    // Set the anchor point to its center
    this.coin.anchor.setTo(0.5, 0.5);

    // Display the score
    this.scoreLabel = this.add.text(30, 30, 'score: 0',
      { font: '18px Arial', fill: '#ffffff' });

    // Initialize the score variable
    this.game.global.score = 0;
  }

  createEnemies() {
    // Create an enemy group with Arcade physics
    this.enemies = this.add.group();
    this.enemies.enableBody = true;

    // Create 10 enemies in the group with the 'enemy' image
    // Enemies are "dead" by default so they hare not visible in the game
    this.enemies.createMultiple(10, 'atlas', 'enemy');

    // Call 'addEnemy' every 2.2 seconds
    // this.time.events.loop(2200, this.addEnemy, this);
    this.nextEnemy = 0;
  }

  addEnemy() {
    // Get the first dead enemy of the group
    var enemy = this.enemies.getFirstDead();

    // If there isn't any dead enemy, do nothing
    if (!enemy) {
      return;
    }

    // Initialize the enemy

    // Set the anchor point centered at the bottom
    enemy.anchor.setTo(0.5, 1);

    // Put the enemy above the top hole
    enemy.reset(this.game.width/2, 0);

    // Add gravity to see it fall
    enemy.body.gravity.y = 500;

    // makes the enemy move left or right
    enemy.body.velocity.x = 100 * this.rnd.pick([-1, 1]);

    // on hitWall, move opposite direction
    enemy.body.bounce.x = 1;


    // when falling into bottom hole kill the sprite
    enemy.checkWorldBounds = true;
    enemy.outOfBoundsKill = true;
  }

  playerDie() {
    this.camera.shake(0.02, 300);

    // Kill the player to make it disapper from the screen
    this.player.kill();


    // Start the sound and the particles
    this.sounds.play('dead');
    this.emitter.x = this.player.x;
    this.emitter.y = this.player.y;
    console.log('player coor', this.player.x, this.player.y);
    console.log('particle coor', this.emitter.x, this.emitter.y);

    // Start the emitter by exploding 15 particles that will live 800ms
    this.emitter.start(true, 1500, null, 15);

    this.time.events.add(2000, this.startMenu, this);
  }

  takeCoin() {
    this.sounds.play('coin');

    // Scale the coin to 0 to make it invisible
    this.coin.scale.setTo(0, 0);
    this.add.tween(this.player.scale).to({x: 1.3, y: 1.3}, 100)
      .yoyo(true).start();

    // Grow the coin back to its  original scale in 300ms
    this.add.tween(this.coin.scale).to({x: 1, y: 1}, 300).start();

    // Update the score
    this.game.global.score += 5;
    this.scoreLabel.text = `score: ${this.game.global.score}`;

    // Change the coin position
    this.updateCoin();
  }

  updateCoin() {
    // Store all the possible coin positions in an array
    var coinPosition = [
      {x: 140, y: 60}, {x: 360, y: 60}, // Top row
      {x: 60, y: 140}, {x: 440, y: 140}, // Middle row {x: 130, y: 300}, {x: 370, y: 300} // Bottom row
    ];

    // Remove the current coin position from the array
    // Otherwise the coin could appear at the same spot twice in a row
    for (let i = 0; i < coinPosition.length; i++) {
      if (coinPosition[i].x == this.coin.x) {
        coinPosition.splice(i, 1);
      }
    }

    // Randomly select a position from the array with 'game.rnd.pick'
    let newPosition = this.rnd.pick(coinPosition);

    // Set the new position of the coin
    this.coin.reset(newPosition.x, newPosition.y);
  }

  extractAudio() {
    // Add our new sound
    this.sounds = this.add.audio('sounds');

    // Tell Phaser that it contains multiple sounds
    this.sounds.allowMultiple = true;

    // Split the audio. The last 2 parameters are:
    // The start pos and the duration of the sound
    this.sounds.addMarker('coin', 0, 0.5);
    this.sounds.addMarker('dead', 0.55, 0.4);
    this.sounds.addMarker('jump', 1.05, 0.45);

  }

  addMobileInputs() {
    this.moveLeft = false;
    this.moveRight = false;

    let leftButton = this.game.add.sprite(50, 240, 'atlas', 'leftButton');
    leftButton.inputEnabled = true;
    leftButton.alpha = 0.5;
    leftButton.events.onInputDown.add(() => this.moveLeft = true, this);
    leftButton.events.onInputOver.add(() => this.moveLeft = true, this);
    leftButton.events.onInputUp.add(() => this.moveLeft = false, this);
    leftButton.events.onInputOut.add(() => this.moveLeft = false, this);

    let rightButton = this.game.add.sprite(130, 240, 'atlas', 'rightButton');
    rightButton.inputEnabled = true;
    rightButton.alpha = 0.5;
    rightButton.events.onInputDown.add(() => this.moveRight = true, this);
    rightButton.events.onInputOver.add(() => this.moveRight = true, this);
    rightButton.events.onInputUp.add(() => this.moveRight = false, this);
    rightButton.events.onInputOut.add(() => this.moveRight = false, this);

    let jumpButton = this.game.add.sprite(350, 240, 'atlas', 'jumpButton');
    jumpButton.inputEnabled = true;
    jumpButton.alpha = 0.5;
    jumpButton.events.onInputDown.add(this.jumpPlayer, this);
  }

  addMobileOrientationListener() {
    // Create an empty label to write the error message if needed
    this.rotateLabel = this.game.add.text(this.game.width/2, this.game.height/2, '',
      { font: '30px Arial', fill: '#fff', backgroundColor: '#000' });
    this.rotateLabel.anchor.setTo(0.5, 0.5);

    // Call 'orientatinoChange' when the device is rotated
    this.game.scale.onOrientationChange.add(this.orientationChange, this);

    // Call the function at least once
    this.orientationChange();
  }

  jumpPlayer() {
    if (this.player.body.onFloor()) {
      this.player.body.velocity.y = -320;
      this.sounds.play('jump');
    }
  }

  movePlayer() {
    if (this.game.input.totalActivePointers === 0) {
      this.moveLeft = false;
      this.moveRight = false;
    }

    // left pressed
    if (this.cursor.left.isDown || this.wasd.left.isDown || this.moveLeft) {
      // Move the player to the left
      // The veolocity is in pixels per second
      this.player.body.velocity.x = -200;
      this.player.animations.play('left');  // Left animation
    }

    // right pressed
    else if (this.cursor.right.isDown || this.wasd.right.isDown || this.moveRight) {
      this.player.body.velocity.x = 200;
      this.player.animations.play('right'); // Right animation
    }

    else {
      this.player.body.velocity.x = 0;
      this.player.animations.stop(); // Stop animations
      this.player.frameName = 'player01'; // Change frame (stand still)
    }

    // up pressed, and player is on the ground
    if (this.cursor.up.isDown || this.wasd.up.isDown) {
      this.jumpPlayer();
    }
  }

  orientationChange() {
    // If the game is in portrait (wrong orientation)
    if (this.game.scale.isPortrait) {
      // Pause the game and add a text explanation
      this.game.paused = true;
      this.rotateLabel.text = 'rotate your device in landscape';
    }
    // If the game is in landscape (good orientation)
    else {
      // Resume the game and remove the text
      this.game.paused = false;
      this.rotateLabel.text = '';
    }
  }

  startMenu() {
    this.state.start('menu');
  }
}