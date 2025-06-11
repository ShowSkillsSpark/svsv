import { ChzzkProxy } from "chzzk-proxy";
import { Game, Scene, Scenes, Types } from "phaser";

export enum GameName {
    Reversi = '리버시',
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
};

class Store {
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
        const loading_scene_key = `${game_name}-LoadingScene`;
        scene.scene.game.scene.getScene(loading_scene_key) || scene.add(loading_scene_key, load_scene);
        scene.start(loading_scene_key);
    }
    startSettingScene(scene: Scenes.ScenePlugin) { scene.start(`${this.game_name}-SettingScene`); }
    startGameScene(scene: Scenes.ScenePlugin) { scene.start(`${this.game_name}-GameScene`); }
    startResultScene(scene: Scenes.ScenePlugin) { scene.start(`${this.game_name}-ResultScene`); }
}

export default new Store();

export const WIDTH = 1920;
export const HEIGHT = 1080;
