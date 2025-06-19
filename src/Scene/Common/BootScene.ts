import { Scene } from "phaser";
import { LoginScene } from "./LoginScene";

export class BootScene extends Scene {
    static readonly key = 'BootScene';
    constructor() {
        super(BootScene.key);
    }

    preload() {
        this.load.font('DungGeunMo', 'https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/DungGeunMo.woff');
    }
    create() {
        this.scene.start(LoginScene.key);
    }
}
