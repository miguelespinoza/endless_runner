import Phaser from 'phaser';
import {
  assetImageLoad,
  assetSoundLoad,
  assetTilemapLoad,
  assetAtlasLoad
} from '../utils/utils';

export default class extends Phaser.State {
  preload() {
    // Add a 'loading...' label on the screen
    var loadingLabel = this.add.text(this.game.width/2, 150, 'loading...',
      {font: '30px Arial', fill: '#ffffff'});
    loadingLabel.anchor.setTo(0.5, 0.5);

    // Display the progress bar
    var progressBar = this.add.sprite(this.game.width/2, 200, 'progressBar');
    progressBar.anchor.setTo(0.5, 0.5);
    this.load.setPreloadSprite(progressBar);

    this.load.audio('sounds', [
      assetSoundLoad('sounds.ogg'),
      assetSoundLoad('sounds.mp3')
    ]);

    this.load.image('tileset', assetImageLoad('tileset.png'));
    this.load.tilemap('map', assetTilemapLoad('map.json'), null, Phaser.Tilemap.TILED_JSON);

    this.load.atlasJSONArray('atlas', assetAtlasLoad('atlas.png'), assetAtlasLoad('atlas.json'));
  }
  
  create() {
    this.state.start('menu');
  }
};