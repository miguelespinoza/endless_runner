import Phaser from 'phaser';
import BootState from './states/boot';
import LoadState from './states/load';
import MenuState from './states/menu';
import PlayState from './states/play';

// Initialize Phaser
var game = new Phaser.Game(500, 340);

// Define the global variable
game.global = {
  score: 0
};

// Add all the states
game.state.add('boot', BootState, false);
game.state.add('load', LoadState, false);
game.state.add('menu', MenuState, false);
game.state.add('play', PlayState, false);

game.state.start('boot');