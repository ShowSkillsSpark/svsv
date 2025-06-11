import { Scene } from "phaser";
import store, { WIDTH, HEIGHT, GameName } from "../store";

import { SelectGameScene } from "./SelectGameScene";
import { LoginScene } from "./LoginScene";

export class PreloadScene extends Scene {
    static key = 'PreloadScene';

    constructor() {
        super(PreloadScene.key);
    }

    preload() {
        this.load.spritesheet(`${GameName.Reversi}Logo`, `assets/SelectGame/${GameName.Reversi}Logo.png`, { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        // loading animation
        const spin_coin = this.add.sprite(WIDTH/2, HEIGHT/3, 'Reversi').setOrigin(0.5).setScale(4);
        this.anims.create({
            key: 'spin',
            frames: this.anims.generateFrameNumbers('Reversi', { start: 0, end: 12 }),
            frameRate: 10,
            repeat: -1,
        });
        spin_coin.play('spin');

        const loading_text = this.add.text(WIDTH/2, HEIGHT/2, '연결 중...', {
            fontSize: 128,
            fontFamily: 'Ramche',
            color: '#ffffff',
            align: 'center',
        }).setOrigin(0.5);

        // this.scene.start(SelectGameScene.key); return; // TODO: DEBUG

        // connect chzzk
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code')!;
        const state = url.searchParams.get('state')!;
        const api_url = 'https://uohwcn08lb.execute-api.ap-northeast-2.amazonaws.com/default/chzzkProxy';
        const access_token = sessionStorage.getItem('access_token') || undefined;
        const refresh_token = sessionStorage.getItem('refresh_token') || undefined;
        const token_type = sessionStorage.getItem('token_type') || undefined;
        const expires_in = sessionStorage.getItem('expires_in') || undefined;
        const scope = sessionStorage.getItem('scope') || undefined;

        const chzzk = store.getProxy({api_url, code, state, access_token, refresh_token, token_type, expires_in, scope});

        chzzk.connect().then(() => {
            sessionStorage.setItem('access_token', chzzk.access_token);
            sessionStorage.setItem('refresh_token', chzzk.refresh_token);
            sessionStorage.setItem('token_type', chzzk.token_type);
            sessionStorage.setItem('expires_in', chzzk.expires_in.toString());
            sessionStorage.setItem('scope', chzzk.scope);
            store.need_refresh = false;
            this.scene.start(SelectGameScene.key);
        }).catch(() => {
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
            sessionStorage.removeItem('token_type');
            sessionStorage.removeItem('expires_in');
            sessionStorage.removeItem('scope');
            store.need_refresh = true;
            this.scene.start(LoginScene.key);
        });
    }
}
