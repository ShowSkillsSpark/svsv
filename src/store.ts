import { ChzzkProxy } from "chzzk-proxy";
import { Game, Scene, Scenes, Types } from "phaser";

export enum GameName {
    Reversi = '리버시',
}

export enum TeamTag {
    Team1 = '1 팀',
    Team2 = '2 팀',
}

export enum TeamMember {
    Streamer = '스트리머',
    Viewer = '시청자',
}

export enum SetWay {
    Click = '클릭',
    Most = '다수결',
    Probability = '득표 비례 확률',
}

export class Team {
    private _tag: TeamTag;
    private _name: string;
    private _member: TeamMember;
    private _time: number;
    private _set_way: SetWay;

    constructor(tag: TeamTag) {
        this._tag = tag;

        const name_tag = '팀 이름'
        const member_tag = '팀 구성'
        const time_tag = '제한 시간'
        const set_way_tag = '착수 방식'

        this._name = localStorage.getItem(`${tag}:${name_tag}`) || (tag === TeamTag.Team1 ? '스트리머' : '시청자');
        this._member = (localStorage.getItem(`${tag}:${member_tag}`) || (tag === TeamTag.Team1 ? TeamMember.Streamer : TeamMember.Viewer)) as TeamMember;
        this._time = parseInt(localStorage.getItem(`${tag}:${time_tag}`) || '30');
        this._set_way = (localStorage.getItem(`${tag}:${set_way_tag}`) || (this._member === TeamMember.Streamer ? SetWay.Click : SetWay.Most)) as SetWay;
    }

    get name() { return this._name; }
    set name(name: string) {
        this._name = name;
    }

    get member() { return this._member; }
    set member(member: TeamMember) {
        this._member = member;
    }

    get time() { return this._time; }
    set time(time: number) {
        this._time = time;
    }

    get set_way() { return this._set_way; }
    set set_way(set_way: SetWay) {
        this._set_way = set_way;
    }
}

interface GetProxyParam {
    api_url: string;
    code: string;
    state: string;
    access_token?: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: string;
    scope?: string;
}

class Store {
    readonly teams: { [key in TeamTag]: Team } = {} as { [key in TeamTag]: Team };

    constructor() {
        this.teams[TeamTag.Team1] = new Team(TeamTag.Team1);
        this.teams[TeamTag.Team2] = new Team(TeamTag.Team2);
    }

    private _proxy: ChzzkProxy | undefined;
    getProxy(param?: GetProxyParam): ChzzkProxy {
        if (!this._proxy) {
            if (!param) throw new Error('param is undefined');
            const {api_url, code, state, access_token, refresh_token, token_type, expires_in, scope} = param;
            this._proxy = new ChzzkProxy({api_url, code, state, access_token, refresh_token, token_type, expires_in, scope});
        }
        return this._proxy;
    }

    need_refresh = false;

    bgm_name = '';

    game_name: GameName | undefined;
    startLoadingScene(scene: Scenes.ScenePlugin, game_name: GameName, load_scene: Types.Scenes.SceneType) {
        this.game_name = game_name;
        const loading_scene_key = `${game_name}LoadingScene`;
        scene.scene.game.scene.getScene(loading_scene_key) || scene.add(loading_scene_key, load_scene);
        scene.start(loading_scene_key);
    }
    startGameScene(scene: Scenes.ScenePlugin) { scene.start(`${this.game_name}GameScene`); }
    startResultScene(scene: Scenes.ScenePlugin) { scene.start(`${this.game_name}ResultScene`); }
}

export default new Store();

export const DEBUG = true;
// export const DEBUG = false;

export const WIDTH = 1920;
export const HEIGHT = 1080;

// export const WIDTH = 640;
// export const HEIGHT = 360;

// export const WIDTH = 320;
// export const HEIGHT = 180;

export enum Color {
    GREY_0 = 0x000000,
    GREY_1 = 0x111111,
    GREY_2 = 0x222222,
    GREY_3 = 0x333333,
    GREY_4 = 0x444444,
    GREY_5 = 0x555555,
    GREY_6 = 0x666666,
    GREY_7 = 0x777777,
    GREY_8 = 0x888888,
    GREY_9 = 0x999999,
    GREY_A = 0xAAAAAA,
    GREY_B = 0xBBBBBB,
    GREY_C = 0xCCCCCC,
    GREY_D = 0xDDDDDD,
    GREY_E = 0xEEEEEE,
    GREY_F = 0xFFFFFF,
    GREEN = 0x00FFA3,
    PURPLE = 0xA400FF,

    CODE_GREY_0 = '#000000',
    CODE_GREY_1 = '#111111',
    CODE_GREY_2 = '#222222',
    CODE_GREY_3 = '#333333',
    CODE_GREY_4 = '#444444',
    CODE_GREY_5 = '#555555',
    CODE_GREY_6 = '#666666',
    CODE_GREY_7 = '#777777',
    CODE_GREY_8 = '#888888',
    CODE_GREY_9 = '#999999',
    CODE_GREY_A = '#AAAAAA',
    CODE_GREY_B = '#BBBBBB',
    CODE_GREY_C = '#CCCCCC',
    CODE_GREY_D = '#DDDDDD',
    CODE_GREY_E = '#EEEEEE',
    CODE_GREY_F = '#FFFFFF',
    CODE_GREEN = '#00FFA3',
    CODE_PURPLE = '#A400FF',
}

