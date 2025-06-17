import { Scene } from "phaser";

export class OthelloGameScene extends Scene {
    static readonly key = 'OthelloGameScene';
    constructor() {
        super(OthelloGameScene.key);
    }

    create() {
        console.log('OthelloGameScene create');
        // this.scene.start('');
    }
}
