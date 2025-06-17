import { Scene } from "phaser";
import { SelectGameScene } from "./SelectGameScene";

export class PreloadScene extends Scene {
    static readonly key = 'PreloadScene';
    constructor() {
        super(PreloadScene.key);
    }

    preload() {
        console.log('PreloadScene preload');
        this.load.spritesheet('Othello:assets', 'assets/Games/Othello/Othello.png', { frameWidth: 32, frameHeight: 32 });
        console.log('PreloadScene preload done');
    }
    create() {
        console.log('PreloadScene create');
        this.scene.start(SelectGameScene.key);
        console.log('PreloadScene create done');
    }
}
