import { Scene } from "phaser";
import { SelectGameScene } from "./SelectGameScene";
import { OthelloSelectGameButton } from "../Othello/OthelloSelectGameButton";
import { OthelloGameScene } from "../Othello";

export class PreloadScene extends Scene {
    static readonly key = 'PreloadScene';
    constructor() {
        super(PreloadScene.key);
    }

    preload() {
        this.load.spritesheet('Othello:assets', 'assets/Games/Othello/Othello.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('Common:button_header', 'assets/Common/button_header.png', { frameWidth: 32, frameHeight: 32 });
    }
    create() {
        OthelloSelectGameButton.preload(this);
        OthelloGameScene.preload(this);
        this.scene.start(SelectGameScene.key);
    }
}
