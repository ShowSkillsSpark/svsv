import { Events, Sound, Types } from "phaser";
import { ChzzkProxy, EventType } from "chzzk-proxy";

export class Store extends Events.EventEmitter {}

export enum CommonStoreEvent {
    CHAT = 'CHAT',
    DONATION = 'DONATION',
    VOLUME_MASTER = 'VOLUME_MASTER',
    VOLUME_BGM = 'VOLUME_BGM',
    VOLUME_EFFECT = 'VOLUME_EFFECT',
}

export interface CommonStoreEventParam {
    channel_id: string,
    nickname: string,
    message: string,
    pay?: number,
}

class CommonStore extends Store {
    readonly SCALE = 4;
    readonly WIDTH = 480 * this.SCALE;
    readonly HEIGHT = 270 * this.SCALE;
    readonly DEBUG = (import.meta.env.MODE === 'development') ? true : false;

    readonly bgm_map: { [key: string]: Sound.NoAudioSound | Sound.HTML5AudioSound | Sound.WebAudioSound } = {};
    private _bgm: Sound.NoAudioSound | Sound.HTML5AudioSound | Sound.WebAudioSound | undefined;
    private _bgm_key: string | undefined;
    set bgm(bgm: Sound.NoAudioSound | Sound.HTML5AudioSound | Sound.WebAudioSound | undefined) {
        if (this._bgm_key && bgm?.key.startsWith(this._bgm_key)) return;
        if(this._bgm) this._bgm.stop();
        this._bgm = bgm;
        this._bgm_key = bgm?.key;
        this._bgm?.play();
    }
    onVolumeMasterChange: (() => void) | undefined;
    private _volume_master: number = parseFloat(localStorage.getItem('svsv:volume:master') || '0.5');
    private _volume_bgm: number = parseFloat(localStorage.getItem('svsv:volume:bgm') || '0.3');
    private _volume_effect: number = parseFloat(localStorage.getItem('svsv:volume:effect') || '0.5');
    get volume_master() { return this._volume_master; }
    set volume_master(value: number) {
        this._volume_master = Math.max(0, Math.min(1, Number(value.toFixed(1))));
        localStorage.setItem('svsv:volume:master', this._volume_master.toString());
        this.emit(CommonStoreEvent.VOLUME_MASTER, this._volume_master);
    }
    get volume_bgm() { return this._volume_bgm; }
    set volume_bgm(value: integer) {
        this._volume_bgm = Math.max(0, Math.min(1, Number(value.toFixed(1))));
        localStorage.setItem('svsv:volume:bgm', value.toString());
        this._bgm?.setVolume(value);
        this.emit(CommonStoreEvent.VOLUME_BGM, this._volume_bgm);
    }
    get volume_effect() { return this._volume_effect; }
    set volume_effect(value: integer) {
        this._volume_effect = Math.max(0, Math.min(1, Number(value.toFixed(1))));
        localStorage.setItem('svsv:volume:effect', value.toString());
        this.emit(CommonStoreEvent.VOLUME_EFFECT, this._volume_effect);
    }

    readonly url: string;

    readonly style = {
        color: {
            grey_0: parseInt(localStorage.getItem('svsv:style:color:grey_0') || '0x000000'),
            grey_1: parseInt(localStorage.getItem('svsv:style:color:grey_1') || '0x111111'),
            grey_2: parseInt(localStorage.getItem('svsv:style:color:grey_2') || '0x222222'),
            grey_3: parseInt(localStorage.getItem('svsv:style:color:grey_3') || '0x333333'),
            grey_4: parseInt(localStorage.getItem('svsv:style:color:grey_4') || '0x444444'),
            grey_5: parseInt(localStorage.getItem('svsv:style:color:grey_5') || '0x555555'),
            grey_6: parseInt(localStorage.getItem('svsv:style:color:grey_6') || '0x666666'),
            grey_7: parseInt(localStorage.getItem('svsv:style:color:grey_7') || '0x777777'),
            grey_8: parseInt(localStorage.getItem('svsv:style:color:grey_8') || '0x888888'),
            grey_9: parseInt(localStorage.getItem('svsv:style:color:grey_9') || '0x999999'),
            grey_a: parseInt(localStorage.getItem('svsv:style:color:grey_a') || '0xaaaaaa'),
            grey_b: parseInt(localStorage.getItem('svsv:style:color:grey_b') || '0xbbbbbb'),
            grey_c: parseInt(localStorage.getItem('svsv:style:color:grey_c') || '0xcccccc'),
            grey_d: parseInt(localStorage.getItem('svsv:style:color:grey_d') || '0xdddddd'),
            grey_e: parseInt(localStorage.getItem('svsv:style:color:grey_e') || '0xeeeeee'),
            grey_f: parseInt(localStorage.getItem('svsv:style:color:grey_f') || '0xffffff'),
            green_a: parseInt(localStorage.getItem('svsv:style:color:green_a') || '0x00aa6c'),
            green_f: parseInt(localStorage.getItem('svsv:style:color:green_f') || '0x00ffa3'),
            purple_a: parseInt(localStorage.getItem('svsv:style:color:purple_a') || '0x6c00aa'),
            purple_f: parseInt(localStorage.getItem('svsv:style:color:purple_f') || '0xa300ff'),
            pink_a: parseInt(localStorage.getItem('svsv:style:color:pink_a') || '0xaa006c'),
            pink_f: parseInt(localStorage.getItem('svsv:style:color:pink_f') || '0xff00a3'),
        },
        color_code: {
            grey_0: localStorage.getItem('svsv:style:color_code:grey_0') || '#000000',
            grey_1: localStorage.getItem('svsv:style:color_code:grey_1') || '#111111',
            grey_2: localStorage.getItem('svsv:style:color_code:grey_2') || '#222222',
            grey_3: localStorage.getItem('svsv:style:color_code:grey_3') || '#333333',
            grey_4: localStorage.getItem('svsv:style:color_code:grey_4') || '#444444',
            grey_5: localStorage.getItem('svsv:style:color_code:grey_5') || '#555555',
            grey_6: localStorage.getItem('svsv:style:color_code:grey_6') || '#666666',
            grey_7: localStorage.getItem('svsv:style:color_code:grey_7') || '#777777',
            grey_8: localStorage.getItem('svsv:style:color_code:grey_8') || '#888888',
            grey_9: localStorage.getItem('svsv:style:color_code:grey_9') || '#999999',
            grey_a: localStorage.getItem('svsv:style:color_code:grey_a') || '#aaaaaa',
            grey_b: localStorage.getItem('svsv:style:color_code:grey_b') || '#bbbbbb',
            grey_c: localStorage.getItem('svsv:style:color_code:grey_c') || '#cccccc',
            grey_d: localStorage.getItem('svsv:style:color_code:grey_d') || '#dddddd',
            grey_e: localStorage.getItem('svsv:style:color_code:grey_e') || '#eeeeee',
            grey_f: localStorage.getItem('svsv:style:color_code:grey_f') || '#ffffff',
            green_a: localStorage.getItem('svsv:style:color_code:grey_a') || '#00aa6c',
            green_f: localStorage.getItem('svsv:style:color_code:grey_f') || '#00ffa3',
            purple_a: localStorage.getItem('svsv:style:color_code:purple_a') || '#6c00aa',
            purple_f: localStorage.getItem('svsv:style:color_code:purple_f') || '#a300ff',
            pink_a: localStorage.getItem('svsv:style:color:pink_a') || '#aa006c',
            pink_f: localStorage.getItem('svsv:style:color:pink_f') || '#ff00a3',
        },
        font_style: {} as Types.GameObjects.Text.TextStyle,
        font_padding: 0,
    };

    readonly proxy: ChzzkProxy;

    constructor() {
        super();
        const font_size = 16;
        this.style.font_style = {
            fontFamily: 'DungGeunMo',
            fontSize: font_size * this.SCALE,
            color: this.style.color_code.grey_f,
            align: 'center',
        };
        this.style.font_padding = font_size * this.SCALE / 10;
        this.url = this.DEBUG ? import.meta.env.VITE_TEST_REDIRECT_URL : 'https://showskillsspark.github.io/svsv';
        this.proxy = new ChzzkProxy({
            api_url: this.DEBUG ? import.meta.env.VITE_TEST_PROXY_URL : 'https://uohwcn08lb.execute-api.ap-northeast-2.amazonaws.com/default/chzzkProxy',
            code: sessionStorage.getItem('svsv:proxy:code') || (new URL(window.location.href)).searchParams.get('code') || undefined,
            state: sessionStorage.getItem('svsv:proxy:state') || (new URL(window.location.href)).searchParams.get('state') || undefined,
            access_token: sessionStorage.getItem('svsv:proxy:access_token') || undefined,
            refresh_token: sessionStorage.getItem('svsv:proxy:refresh_token') || undefined,
            token_type: sessionStorage.getItem('svsv:proxy:token_type') || undefined,
            expires_in: sessionStorage.getItem('svsv:proxy:expires_in') || undefined,
            scope: sessionStorage.getItem('svsv:proxy:scope') || undefined,
        });
        this.proxy.on(EventType.CHAT, (param: any) => {
            const { channelId, senderChannelId, profile, content, emojis, messageTime } = param;
            const { nickname, badges, verifiedMark } = profile;
            const { key, value } = emojis;
            this.emit(CommonStoreEvent.CHAT, {
                channel_id: senderChannelId,
                nickname,
                message: content,
            } as CommonStoreEventParam);
        });
        this.proxy.on(EventType.DONATION, (param: any) => {
            const { donationType, channelId, donatorChannelId, donatorNickname, payAmount, donationText, emojis } = param;
            const { key, value } = emojis;
            this.emit(CommonStoreEvent.DONATION, {
                channel_id: donatorChannelId,
                nickname: donatorNickname,
                message: donationText,
                pay: parseInt(payAmount),
            } as CommonStoreEventParam);
        });
    }
}

export const store = new CommonStore();
