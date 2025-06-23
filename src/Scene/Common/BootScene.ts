import { Scene } from "phaser";
import { LoginScene } from "./LoginScene";
import { CommonStoreEvent, store } from "../../Store/CommonStore";
import { VolumeScene } from "./VolumeScene";

export class BootScene extends Scene {
    static readonly key = 'BootScene';
    constructor() {
        super(BootScene.key);
    }

    preload() {
        this.load.font('DungGeunMo', 'https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/DungGeunMo.woff');
        this.load.setPath('assets/Common/');
        this.load.audio('Common:sound:cancel', 'SoupTonic UI1 SFX Pack 1 - mp3/SFX_UI_Cancel.mp3');
        this.load.audio('Common:sound:confirm', 'SoupTonic UI1 SFX Pack 1 - mp3/SFX_UI_Confirm.mp3');
        this.load.audio('Common:sound:select', 'SoupTonic UI1 SFX Pack 1 - mp3/SFX_UI_MenuSelections.mp3');
        this.load.audio('Common:sound:open_menu', 'SoupTonic UI1 SFX Pack 1 - mp3/SFX_UI_OpenMenu.mp3');
        this.load.audio('Common:sound:close_menu', 'SoupTonic UI1 SFX Pack 1 - mp3/SFX_UI_CloseMenu.mp3');
        this.load.audio('Common:sound:exit', 'SoupTonic UI1 SFX Pack 1 - mp3/SFX_UI_Exit.mp3');
        this.load.audio('Common:sound:pause', 'SoupTonic UI1 SFX Pack 1 - mp3/SFX_UI_Pause.mp3');
        this.load.audio('Common:sound:resume', 'SoupTonic UI1 SFX Pack 1 - mp3/SFX_UI_Resume.mp3');
        this.load.audio('Common:sound:shop', 'SoupTonic UI1 SFX Pack 1 - mp3/SFX_UI_Shop.mp3');
        this.load.audio('Common:sound:equip', 'SoupTonic UI1 SFX Pack 1 - mp3/SFX_UI_Equip.mp3');
    }
    create() {
        // this.input.setDefaultCursor('url(https://cdn.phaserfiles.com/v385/assets/input/cursors/pen.cur), pointer');
        // this.input.setDefaultCursor('none');
        this.sound.setVolume(store.volume_master);
        store.on(CommonStoreEvent.VOLUME_MASTER, (value: number) => {
            this.sound.setVolume(value);
        });
        this.scene.launch(VolumeScene.key);
        this.scene.start(LoginScene.key);
    }
}
