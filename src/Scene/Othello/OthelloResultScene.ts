import { Scene } from "phaser";
import { OthelloSettingScene } from "./OthelloSettingScene";

export class OthelloResultScene extends Scene {
    static readonly key = 'OthelloResultScene';
    constructor() {
        super(OthelloResultScene.key);
    }

    create() {
        console.log('OthelloResultScene create');
        this.scene.start(OthelloSettingScene.key);
    }
}
