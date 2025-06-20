import { Scene } from "phaser";
import { PreloadScene } from "./PreloadScene";
import { store } from "../../Store/CommonStore";

export class LoginScene extends Scene {
    static readonly key = 'LoginScene';
    constructor() {
        super(LoginScene.key);
    }

    async create() {
        if (store.DEBUG) { this.scene.start(PreloadScene.key); return; } // NOTE: skip acquiring permission process

        const proxy = store.proxy;
        const info_text = this.add.text(store.WIDTH/2, store.HEIGHT*1/2, '', store.style.font_style).setOrigin(0.5).setPadding(store.style.font_padding);
        const button = this.add.text(store.WIDTH/2, store.HEIGHT*2/3, '', store.style.font_style).setOrigin(0.5).setPadding(store.style.font_padding).setTint(store.style.color.green_a);
        if (!proxy.access_token) {
            if (!proxy.code) {
                info_text.setText(
`[안내]
치지직 API 사용 권한이 필요합니다.
아래 버튼을 눌러 동의해주세요.
`);
                button.setText('오케이!');
                button.setInteractive({ cursor: 'pointer' }).on('pointerover', () => {
                    button.setTint(store.style.color.green_f);
                }).on('pointerout', () => {
                    button.setTint(store.style.color.green_a);
                }).on('pointerup', () => {
                    const client_id = 'e04f347f-43a8-4efe-a75c-48fc210f174d';
                    const redirect_uri = store.url;
                    const state = 'skills';
                    const interlock_url = `https://chzzk.naver.com/account-interlock?clientId=${client_id}&redirectUri=${redirect_uri}&state=${state}`;
                    sessionStorage.setItem('CommonStore:proxy:client_id',  client_id);
                    sessionStorage.setItem('CommonStore:proxy:redirect_uri',  redirect_uri);
                    window.open(interlock_url, '_self');
                });
            } else {
                proxy.createAccessToken().then(() => {
                    sessionStorage.setItem('CommonStore:proxy:access_token', proxy.access_token);
                    sessionStorage.setItem('CommonStore:proxy:refresh_token', proxy.refresh_token);
                    sessionStorage.setItem('CommonStore:proxy:token_type', proxy.token_type);
                    sessionStorage.setItem('CommonStore:proxy:expires_in', proxy.expires_in.toString());
                    sessionStorage.setItem('CommonStore:proxy:scope', proxy.scope);
                    window.open(store.url, '_self');
                }).catch(() => {
                    this.clearSession();
                    info_text.setText(`
[에러]
토큰 발급에 실패했습니다.
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
[에러]
서비스 연결에 실패했습니다.
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
        sessionStorage.getItem('CommonStore:proxy:code');
        sessionStorage.getItem('CommonStore:proxy:state');
        sessionStorage.getItem('CommonStore:proxy:access_token');
        sessionStorage.getItem('CommonStore:proxy:refresh_token');
        sessionStorage.getItem('CommonStore:proxy:token_type');
        sessionStorage.getItem('CommonStore:proxy:expires_in');
        sessionStorage.getItem('CommonStore:proxy:scope');
    }
}
