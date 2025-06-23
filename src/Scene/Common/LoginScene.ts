import { Scene } from "phaser";
import { PreloadScene } from "./PreloadScene";
import { store } from "../../Store/CommonStore";
import { version } from "../../../package.json"

export class LoginScene extends Scene {
    static readonly key = 'LoginScene';
    constructor() {
        super(LoginScene.key);
    }

    preload() {
        this.load.audio('select', 'assets/Common/SoupTonic UI1 SFX Pack 1 - mp3/SFX_UI_MenuSelections.mp3');
        this.load.audio('confirm', 'assets/Common/SoupTonic UI1 SFX Pack 1 - mp3/SFX_UI_Confirm.mp3');
        this.load.audio('bgm:login:intro', 'assets/Common/xDeviruchi - 8-bit Fantasy  & Adventure Music (2021)/Separated Files/Take some rest and eat some food!/xDeviruchi - Take some rest and eat some food! (Intro).wav');
        this.load.audio('bgm:login', 'assets/Common/xDeviruchi - 8-bit Fantasy  & Adventure Music (2021)/Separated Files/Take some rest and eat some food!/xDeviruchi - Take some rest and eat some food! (Loop).wav');
    }

    async create() {
        // version
        const version_text = this.add.text(0, store.HEIGHT, version, {
            ...store.style.font_style,
        }).setOrigin(0, 1);

        const bgm = this.sound.add('bgm:login:intro', { volume: store.volume_bgm });
        bgm.on('complete', () => {
            store.bgm = this.sound.add('bgm:login', { loop: true, volume: store.volume_bgm });
        });
        store.bgm_map['bgm:login:intro'] = bgm;
        store.bgm = store.bgm_map['bgm:login:intro'];

        // if (store.DEBUG) { this.scene.start(PreloadScene.key); return; } // NOTE: skip acquiring permission process

        const proxy = store.proxy;
        const info_text = this.add.text(store.WIDTH/2, store.HEIGHT*1/2, '', store.style.font_style).setOrigin(0.5).setPadding(store.style.font_padding);
        const button = this.add.text(store.WIDTH/2, store.HEIGHT*2/3, '', store.style.font_style).setOrigin(0.5).setPadding(store.style.font_padding).setTint(store.style.color.green_a);
        if (!proxy.access_token) {
            if (!proxy.code) {
                info_text.setText(
`[안내] 치지직 API 사용 권한이 필요합니다.

아래 버튼을 눌러 동의해주세요.
`);
                button.setText('오케이!');
                button.setInteractive({ cursor: 'pointer' }).on('pointerover', () => {
                    button.setTint(store.style.color.green_f);
                    this.sound.play('select', { volume: store.volume_effect });
                }).on('pointerout', () => {
                    button.setTint(store.style.color.green_a);
                }).on('pointerup', () => {
                    const client_id = store.DEBUG ? 'e6865229-3d57-4a2a-9cbf-98b47198a3c9' : 'e04f347f-43a8-4efe-a75c-48fc210f174d';
                    const redirect_uri = store.url;
                    const state = 'skills';
                    const interlock_url = `https://chzzk.naver.com/account-interlock?clientId=${client_id}&redirectUri=${redirect_uri}&state=${state}`;
                    sessionStorage.setItem('svsv:proxy:client_id',  client_id);
                    sessionStorage.setItem('svsv:proxy:redirect_uri',  redirect_uri);
                    this.sound.play('confirm', { volume: store.volume_effect });
                    window.open(interlock_url, '_self');
                });
            } else {
                proxy.createAccessToken().then(() => {
                    sessionStorage.setItem('svsv:proxy:access_token', proxy.access_token);
                    sessionStorage.setItem('svsv:proxy:refresh_token', proxy.refresh_token);
                    sessionStorage.setItem('svsv:proxy:token_type', proxy.token_type);
                    sessionStorage.setItem('svsv:proxy:expires_in', proxy.expires_in.toString());
                    sessionStorage.setItem('svsv:proxy:scope', proxy.scope);
                    window.open(store.url, '_self');
                }).catch(() => {
                    this.clearSession();
                    info_text.setText(`
[에러] 토큰 발급에 실패했습니다.

잠시 후 재시도합니다.
`);
                    let repeat = 60;
                    button.setText(`${repeat}초`);
                    this.time.addEvent({
                        delay: 1000,
                        callback: () => {
                            repeat -= 1;
                            if (repeat == 0) window.open(store.url, '_self');
                            button.setText(`${repeat}초`);
                        },
                        repeat,
                    });
                });
            }
        } else {
            proxy.connect().then(() => {
                this.scene.start(PreloadScene.key);
            }).catch(() => {
                this.clearSession();
                info_text.setText(`
[에러] 서비스 연결에 실패했습니다.

잠시 후 재시도합니다.
`);
                let repeat = 60;
                button.setText(`${repeat}초`);
                this.time.addEvent({
                    delay: 1000,
                    callback: () => {
                        repeat -= 1;
                        if (repeat == 0) window.open(store.url, '_self');
                        button.setText(`${repeat}초`);
                    },
                    repeat,
                });
            });
        }
    }

    clearSession() {
        sessionStorage.getItem('svsv:proxy:code');
        sessionStorage.getItem('svsv:proxy:state');
        sessionStorage.getItem('svsv:proxy:access_token');
        sessionStorage.getItem('svsv:proxy:refresh_token');
        sessionStorage.getItem('svsv:proxy:token_type');
        sessionStorage.getItem('svsv:proxy:expires_in');
        sessionStorage.getItem('svsv:proxy:scope');
    }
}
