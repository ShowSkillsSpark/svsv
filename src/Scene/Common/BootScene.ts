import { Scene } from "phaser";
import { LoginScene } from "./LoginScene";

export class BootScene extends Scene {
    static readonly key = 'BootScene';
    constructor() {
        super(BootScene.key);
    }

    preload() {
        this.load.font('Ramche', 'https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2307-1@1.1/Ramche.woff2');
    }
    create() {
        this.scene.start(LoginScene.key);
    }
}
