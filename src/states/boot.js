import Phaser from 'phaser';
import { assetImageLoad } from '../utils/utils';

export default class extends Phaser.State  {
  preload() {
    this.load.image('progressBar', assetImageLoad('progressBar.png'));
  }
  create() {
    this.stage.backgroundColor = '#3498db';
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.renderer.renderSession.roundPixels = true;

    // If the device is not a desktop (so it's a mobile device)
    if (!this.game.device.desktop) {
      // Set the type of the scaling to 'show all'
      this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

      // Set the min and masx width/height of the game
      this.game.scale.setMinMax(this.game.width/2, this.game.height/2,
      this.game.width*2, this.game.height*2);

      // Center the game on the screen
      this.game.scale.pageAlignHorizontally = true;
      this.game.scale.pageAlignVertically = true;

      // Add a blue color to the page to hide potential white borders
      document.body.style.backgroundColor = '#3498db';
    }

    this.state.start('load');
  }
};