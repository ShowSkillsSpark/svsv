import { Types } from "phaser";
import store, { HEIGHT, WIDTH } from "../../../store";

import { LoadingScene } from "../Common/LoadingScene";
import { ReversiSettingScene } from "./ReversiSettingScene";
import { ReversiGameScene } from "./ReversiGameScene";
import { ReversiResultScene } from "./ReversiResultScene";

export class ReversiLoadingScene extends LoadingScene {
    setting_scene: Types.Scenes.SceneType;
    game_scene: Types.Scenes.SceneType;
    result_scene: Types.Scenes.SceneType;

    constructor(key: string) {
        super(key);
        this.setting_scene = ReversiSettingScene;
        this.game_scene = ReversiGameScene;
        this.result_scene = ReversiResultScene;
    }

    preload() {
        this.loadScenes();
        this.load.setPath('assets/Games/Reversi/');
        this.load.spritesheet('ReversiAssets', 'Reversi.png', { frameWidth: 32, frameHeight: 32 });
        ReversiGameScene.preload();
        ReversiSettingScene.preload();
        ReversiResultScene.preload();
    }

    create() {
        const loading_sprite = this.add.sprite(WIDTH/2, HEIGHT/3, 'ReversiAssets').setOrigin(0.5).setScale(4);
        this.anims.create({
            key: 'ReversiLoading',
            frames: this.anims.generateFrameNumbers('ReversiAssets', { start: 0, end: 12 }),
            frameRate: 10,
            repeat: -1,
            repeatDelay: 700,
        });
        loading_sprite.play('ReversiLoading');

        this.add.text(WIDTH/2, HEIGHT/2, '리버시', {
            fontSize: 128,
            fontFamily: 'Ramche',
            color: '#ffffff',
            align: 'center',
        }).setOrigin(0.5);

        // store.startSettingScene(this.scene);
    }
}
