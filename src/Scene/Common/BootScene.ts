import { Scene } from "phaser";
import { LoginScene } from "./LoginScene";
import { store } from "../../Store/CommonStore";

export class BootScene extends Scene {
    static readonly key = 'BootScene';
    constructor() {
        super(BootScene.key);
    }

    preload() {
        this.load.font('DungGeunMo', 'https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/DungGeunMo.woff');
    }
    create() {
        // this.input.setDefaultCursor('url(https://cdn.phaserfiles.com/v385/assets/input/cursors/pen.cur), pointer');
        // this.input.setDefaultCursor('none');
        this.sound.setVolume(store.volume_master);
        store.onVolumeMasterChange = () => {
            this.sound.setVolume(store.volume_master);
        };
        this.scene.start(LoginScene.key);
    }
}
