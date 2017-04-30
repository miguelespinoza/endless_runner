import Phaser from 'phaser';

export default class extends Phaser.State {
  create() {
    // Add a background image
    this.add.image(0, 0, 'atlas', 'background');

    // Display the name of the game
    var nameLabel = this.add.text(this.game.width/2, -50, 'Super Coin Box',
      {font: '50px Arial', fill: '#ffffff'});
    nameLabel.anchor.setTo(0.5, 0.5);

    // If 'bestScore' is not defined
    // It means that this is the first time the game is playde
    if (!localStorage.getItem('bestScore')) {
      localStorage.setItem('bestScore', 0);
    }

    if (this.game.global.score > localStorage.getItem('bestScore')) {
      localStorage.setItem('bestScore', this.game.global.score);
    }

      const scoreText = `score: ${this.game.global.score}\nbest score: ${localStorage.getItem('bestScore')}`;

    // Show the score at the center of the screen
    var scoreLabel = this.add.text(this.game.width/2, this.game.height/2,
      scoreText,
      {font: '25px Arial', fill: '#ffffff', align: 'center'});
    scoreLabel.anchor.setTo(0.5, 0.5);

    let startText = this.game.device.desktop ? 'press the up arrow key to start' : 'touch the screen to start';

    // Explain how to start the game
    var startLabel = this.add.text(this.game.width/2, this.game.height-80,
      startText,
      {font: '25px Arial', fill: '#ffffff'});
    startLabel.anchor.setTo(0.5, 0.5);

    // Create the new Phaser keyboard variable: the up arrow key
    // When pressed, call the 'start'
    var upKey = this.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.add(this.start, this);

    if (!this.game.device.desktop) {
      this.game.input.onDown.add(this.start, this);
    }

    // Tweening
    this.add.tween(nameLabel).to({y: 80}, 1000)
      .easing(Phaser.Easing.Bounce.Out).start();

    this.add.tween(startLabel).to({angle: -2}, 500).to({angle: 2}, 1000)
      .to({angle: 0}, 500).loop().start();

    this.muteButton = this.add.button(20, 20, 'atlas', this.toggleSound, this);
    this.muteButton.frameName = this.sound.mute ? 'muteOn' : 'muteOff';
  }

  toggleSound() {
    // Switch the variable from true to false, or false to true
    // When 'game.sound.mute = true', Phaser will mute the game
    this.sound.mute = !this.sound.mute;

    // Change the frame of the button
    this.muteButton.frameName = this.sound.mute ? 'muteOn' : 'muteOff';
  }

  start() {
    if (!this.game.device.desktop && this.game.input.y < 50 && this.game.input.x < 60) {
      return;
    }

    // State the actual game
    this.state.start('play');
  }
}