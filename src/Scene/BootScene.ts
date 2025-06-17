import { Scene } from "phaser";
import store, { DEBUG } from "../store";

import { PreloadScene } from "./PreloadScene";
import { LoginScene } from "./LoginScene";

export class BootScene extends Scene {
    static key = 'BootScene';

    constructor() {
        super(BootScene.key);
    }

    preload() {
        this.load.audio('bgm-Bit Quest', 'assets/Common/Bit Quest.mp3');
        this.load.font('Ramche', 'https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2307-1@1.1/Ramche.woff2');
        this.load.spritesheet('Reversi', 'assets/Games/Reversi/Reversi.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('button_header', 'assets/Common/button_header.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        const master_volume = localStorage.getItem('master_volume') || '0.5';
        this.game.sound.setVolume(parseFloat(master_volume));
        const bgm_volume = localStorage.getItem('bgm_volume') || '0.5';
        store.bgm_name = 'bgm-Bit Quest';
        this.sound.play(store.bgm_name, { loop: true, volume: parseFloat(bgm_volume) });

        const access_token = sessionStorage.getItem('access_token');
        const refresh_token = sessionStorage.getItem('refresh_token');
        const token_type = sessionStorage.getItem('token_type');
        const expires_in = sessionStorage.getItem('expires_in');
        const scope = sessionStorage.getItem('scope');

        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');

        if (DEBUG) { this.scene.start(PreloadScene.key); return; }

        if (access_token && refresh_token && token_type && expires_in && scope) this.scene.start(PreloadScene.key);
        else if (!code || !state) this.scene.start(LoginScene.key);
        else this.scene.start(PreloadScene.key);
    }
}
