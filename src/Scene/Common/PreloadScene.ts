import { Scene } from "phaser";
import { SelectGameScene } from "./SelectGameScene";
import { OthelloSelectGameButton } from "../Othello/OthelloSelectGameButton";
import { OthelloGameScene } from "../Othello";
import { store } from "../../Store/CommonStore";

export class PreloadScene extends Scene {
    static readonly key = 'PreloadScene';
    constructor() {
        super(PreloadScene.key);
    }

    preload() {
        this.load.spritesheet('Othello:assets', 'assets/Games/Othello/Othello.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('Common:button_header', 'assets/Common/button_header.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('Common:button_close', 'assets/Common/button_close.png', { frameWidth: 32, frameHeight: 32 });
        this.load.setPath('assets/Common/');
        this.load.audio('bgm:battle1:intro', 'xDeviruchi - 8-bit Fantasy  & Adventure Music (2021)/Separated Files/And The Journey Begins/xDeviruchi - And The Journey Begins (Intro).wav');
        this.load.audio('bgm:battle1', 'xDeviruchi - 8-bit Fantasy  & Adventure Music (2021)/Separated Files/And The Journey Begins/xDeviruchi - And The Journey Begins (Loop).wav');
        this.load.audio('bgm:battle2:intro', 'xDeviruchi - 8-bit Fantasy  & Adventure Music (2021)/Separated Files/Exploring The Unknown/xDeviruchi - Exploring The Unknown (Intro).wav');
        this.load.audio('bgm:battle2', 'xDeviruchi - 8-bit Fantasy  & Adventure Music (2021)/Separated Files/Exploring The Unknown/xDeviruchi - Exploring The Unknown (Loop).wav');
        this.load.audio('bgm:battle3:intro', 'xDeviruchi - 8-bit Fantasy  & Adventure Music (2021)/Separated Files/Prepare for Battle!/xDeviruchi - Prepare for Battle! (Intro).wav');
        this.load.audio('bgm:battle3', 'xDeviruchi - 8-bit Fantasy  & Adventure Music (2021)/Separated Files/Prepare for Battle!/xDeviruchi - Prepare for Battle! (Loop).wav');
        this.load.audio('bgm:victory:intro', 'xDeviruchi - 16 bit Fantasy & Adventure (2025)/06 - Victory!.mp3');
        this.load.audio('bgm:victory2:intro', 'xDeviruchi - 16 bit Fantasy & Adventure (2025)/11 - The Mighty Kingdom.mp3');
        this.load.audio('bgm:draw:intro', 'xDeviruchi - 16 bit Fantasy & Adventure (2025)/16 - The Calm Before The Storm.mp3');
        this.load.audio('bgm:defeat:intro', 'xDeviruchi - 16 bit Fantasy & Adventure (2025)/18 - Never Give Up.mp3');
        this.load.audio('bgm:defeat2:intro', 'xDeviruchi - 16 bit Fantasy & Adventure (2025)/10 - Lost Shrine.mp3');
    }
    create() {
        OthelloSelectGameButton.preload(this);
        OthelloGameScene.preload(this);
        for (const key of ['battle1', 'battle2', 'battle3']) {
            const bgm = this.sound.add(`bgm:${key}:intro`, { volume: store.volume_bgm });
            bgm.on('complete', () => {
                store.bgm = this.sound.add(`bgm:${key}`, { loop: true, volume: store.volume_bgm });
            });
            store.bgm_map[`bgm:${key}:intro`] = bgm;
        }
        for (const key of ['victory', 'victory2', 'draw', 'defeat', 'defeat2']) {
            const bgm = this.sound.add(`bgm:${key}:intro`, { volume: store.volume_bgm });
            store.bgm_map[`bgm:${key}:intro`] = bgm;
        }
        this.scene.start(SelectGameScene.key);
    }
}
