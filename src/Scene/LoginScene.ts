import { Scene } from "phaser";
import store, { HEIGHT, WIDTH } from "../store";

export class LoginScene extends Scene {
    static key = 'LoginScene';

    constructor() {
        super(LoginScene.key);
    }

    preload() {
        this.load.spritesheet('button_header', 'assets/Common/button_header.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        const info_text_size = 64;
        const login_text_size = 128;

        const info_text = this.add.text(WIDTH/2, HEIGHT/2 - login_text_size, '', {
            fontSize: info_text_size,
            fontFamily: 'Ramche',
            color: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setPadding(HEIGHT/200);
        const login_text = this.add.text(WIDTH/2, HEIGHT/2, '', {
            fontSize: login_text_size,
            fontFamily: 'Ramche',
            color: '#aaaaaa',
            align: 'center',
        }).setOrigin(0.5).setPadding(HEIGHT/100);

        const arrow_size = login_text_size/32;
        const button_header = this.add.sprite(WIDTH/3, HEIGHT/2, 'button_header').setOrigin(0.5).setScale(arrow_size).setTint(0xaaaaaaa);
        this.anims.create({
            key: 'header_animation',
            frames: this.anims.generateFrameNumbers('button_header', { start: 0, end: 11 }),
            frameRate: 20,
            repeat: -1,
        });
        button_header.play('header_animation');

        const button_trailer = this.add.sprite(WIDTH*2/3, HEIGHT/2, 'button_header');
        button_trailer.flipX = true;
        button_trailer.setOrigin(0.5).setScale(arrow_size).setTint(0xaaaaaaa);
        this.anims.create({
            key: 'trailer_animation',
            frames: this.anims.generateFrameNumbers('button_header', { start: 0, end: 11 }),
            frameRate: 20,
            repeat: -1,
        });
        button_trailer.play('trailer_animation');

        let repeat = 60;
        if (store.need_refresh) {
            info_text.setText('[에러] 토큰 발급에 실패했습니다. 잠시 기다려주세요.');
            login_text.setText(`${repeat}초`);
            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    repeat -= 1;
                    if (repeat == 0) window.open(window.location.origin, '_self');
                    login_text.setText(`${repeat}초`);
                },
                repeat,
            });
        } else {
            info_text.setText('[안내] 메시지 조회를 위한 권한이 필요합니다.');
            login_text.setText('오케이!').setInteractive({
                cursor: 'pointer',
            }).on('pointerup', () => {
                const client_id = 'e04f347f-43a8-4efe-a75c-48fc210f174d';
                const redirect_uri = 'http://localhost:5173/';
                const state = 'skills';
                const interlock_url = `https://chzzk.naver.com/account-interlock?clientId=${client_id}&redirectUri=${redirect_uri}&state=${state}`;
                sessionStorage.setItem('client_id',  client_id);
                sessionStorage.setItem('redirect_uri',  redirect_uri);
                window.open(interlock_url, '_self');
            }).on('pointerover', () => {
                login_text.setColor('#ffffff');
                button_header.setTint(0xffffff);
                button_trailer.setTint(0xffffff);
            }).on('pointerout', () => {
                login_text.setColor('#aaaaaa');
                button_header.setTint(0xaaaaaa);
                button_trailer.setTint(0xaaaaaa);
            });
        }

        // this.scene.launch('ControlPanelScene');
    }
}
