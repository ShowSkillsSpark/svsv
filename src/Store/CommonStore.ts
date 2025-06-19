import { Events, Types } from "phaser";
import { ChzzkProxy, EventType } from "chzzk-proxy";

type ChannelId = string;

class UserInfo {
    channel_id: ChannelId;
    nickname: string;
    constructor(channel_id: ChannelId, nickname: string) {
        this.channel_id = channel_id;
        this.nickname = nickname;
    }
}

export class Store extends Events.EventEmitter {}

class CommonStore extends Store {
    readonly SCALE = 4;
    readonly WIDTH = 480 * this.SCALE;
    readonly HEIGHT = 270 * this.SCALE;
    readonly DEBUG = true;

    readonly url = 'http://localhost:5173';

    readonly style = {
        color: {
            grey_0: parseInt(localStorage.getItem('CommonStore:style:color:grey_0') || '0x000000'),
            grey_1: parseInt(localStorage.getItem('CommonStore:style:color:grey_1') || '0x111111'),
            grey_2: parseInt(localStorage.getItem('CommonStore:style:color:grey_2') || '0x222222'),
            grey_3: parseInt(localStorage.getItem('CommonStore:style:color:grey_3') || '0x333333'),
            grey_4: parseInt(localStorage.getItem('CommonStore:style:color:grey_4') || '0x444444'),
            grey_5: parseInt(localStorage.getItem('CommonStore:style:color:grey_5') || '0x555555'),
            grey_6: parseInt(localStorage.getItem('CommonStore:style:color:grey_6') || '0x666666'),
            grey_7: parseInt(localStorage.getItem('CommonStore:style:color:grey_7') || '0x777777'),
            grey_8: parseInt(localStorage.getItem('CommonStore:style:color:grey_8') || '0x888888'),
            grey_9: parseInt(localStorage.getItem('CommonStore:style:color:grey_9') || '0x999999'),
            grey_a: parseInt(localStorage.getItem('CommonStore:style:color:grey_a') || '0xaaaaaa'),
            grey_b: parseInt(localStorage.getItem('CommonStore:style:color:grey_b') || '0xbbbbbb'),
            grey_c: parseInt(localStorage.getItem('CommonStore:style:color:grey_c') || '0xcccccc'),
            grey_d: parseInt(localStorage.getItem('CommonStore:style:color:grey_d') || '0xdddddd'),
            grey_e: parseInt(localStorage.getItem('CommonStore:style:color:grey_e') || '0xeeeeee'),
            grey_f: parseInt(localStorage.getItem('CommonStore:style:color:grey_f') || '0xffffff'),
            green_a: parseInt(localStorage.getItem('CommonStore:style:color:green_a') || '0x00aa6c'),
            green_f: parseInt(localStorage.getItem('CommonStore:style:color:green_f') || '0x00ffa3'),
            purple_a: parseInt(localStorage.getItem('CommonStore:style:color:purple_a') || '0x6c00aa'),
            purple_f: parseInt(localStorage.getItem('CommonStore:style:color:purple_f') || '0xa300ff'),
        },
        color_code: {
            grey_0: localStorage.getItem('CommonStore:style:color_code:grey_0') || '#000000',
            grey_1: localStorage.getItem('CommonStore:style:color_code:grey_1') || '#111111',
            grey_2: localStorage.getItem('CommonStore:style:color_code:grey_2') || '#222222',
            grey_3: localStorage.getItem('CommonStore:style:color_code:grey_3') || '#333333',
            grey_4: localStorage.getItem('CommonStore:style:color_code:grey_4') || '#444444',
            grey_5: localStorage.getItem('CommonStore:style:color_code:grey_5') || '#555555',
            grey_6: localStorage.getItem('CommonStore:style:color_code:grey_6') || '#666666',
            grey_7: localStorage.getItem('CommonStore:style:color_code:grey_7') || '#777777',
            grey_8: localStorage.getItem('CommonStore:style:color_code:grey_8') || '#888888',
            grey_9: localStorage.getItem('CommonStore:style:color_code:grey_9') || '#999999',
            grey_a: localStorage.getItem('CommonStore:style:color_code:grey_a') || '#aaaaaa',
            grey_b: localStorage.getItem('CommonStore:style:color_code:grey_b') || '#bbbbbb',
            grey_c: localStorage.getItem('CommonStore:style:color_code:grey_c') || '#cccccc',
            grey_d: localStorage.getItem('CommonStore:style:color_code:grey_d') || '#dddddd',
            grey_e: localStorage.getItem('CommonStore:style:color_code:grey_e') || '#eeeeee',
            grey_f: localStorage.getItem('CommonStore:style:color_code:grey_f') || '#ffffff',
            green_a: localStorage.getItem('CommonStore:style:color_code:grey_a') || '#00aa6c',
            green_f: localStorage.getItem('CommonStore:style:color_code:grey_f') || '#00ffa3',
            purple_a: localStorage.getItem('CommonStore:style:color_code:purple_a') || '#6c00aa',
            purple_f: localStorage.getItem('CommonStore:style:color_code:purple_f') || '#a300ff',
        },
        font_style: {} as Types.GameObjects.Text.TextStyle,
        font_padding: 0,
    };

    readonly users: { [channel_id: ChannelId]: UserInfo } = {};
    addUser(channel_id: ChannelId, nickname: string) {
        if (!(channel_id in this.users)) {
            this.users[channel_id] = new UserInfo(channel_id, nickname);
            this.emit(`CommonStore:user:addUser`, {channel_id});
        } else {
            this.users[channel_id].nickname = nickname;
        }
    }

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
        this.proxy = new ChzzkProxy({
            api_url: 'https://uohwcn08lb.execute-api.ap-northeast-2.amazonaws.com/default/chzzkProxy',
            code: sessionStorage.getItem('CommonStore:proxy:code') || (new URL(window.location.href)).searchParams.get('code') || undefined,
            state: sessionStorage.getItem('CommonStore:proxy:state') || (new URL(window.location.href)).searchParams.get('state') || undefined,
            access_token: sessionStorage.getItem('CommonStore:proxy:access_token') || undefined,
            refresh_token: sessionStorage.getItem('CommonStore:proxy:refresh_token') || undefined,
            token_type: sessionStorage.getItem('CommonStore:proxy:token_type') || undefined,
            expires_in: sessionStorage.getItem('CommonStore:proxy:expires_in') || undefined,
            scope: sessionStorage.getItem('CommonStore:proxy:scope') || undefined,
        });
        this.proxy.on(EventType.SYSTEM, (param: any) => {
            if(param?.channelId) this.addUser(param.channelId, '방장');
        });
        this.proxy.on(EventType.CHAT, (param: any) => {
            const channel_id = param.senderChannelId;
            const profile = param.profile;
            const nickname = profile.nickname;
            const content = param.content;
            const emojis = param.emojis;
            const event_time = param.eventSentAt;

            this.addUser(channel_id, nickname);
            this.emit(`CommonStore:message`, {channel_id, content, payment: 0});
        });
        this.proxy.on(EventType.DONATION, (param: any) => {
            if (param.donationType !== 'CHAT') return;
            const channel_id = param.donatorChannelId;
            const nickname = param.donatorNickname;
            const payment = param.payAmount;
            const content = param.donationText;
            const emojis = param.emojis;
            const event_time = param.eventSentAt;

            this.addUser(channel_id, nickname);
            this.emit(`CommonStore:message`, {channel_id, content, payment});
        });
    }
}

export const store = new CommonStore();
