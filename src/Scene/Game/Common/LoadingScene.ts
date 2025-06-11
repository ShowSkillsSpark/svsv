import { Scene, Types } from "phaser";
import store from "../../../store";

export abstract class LoadingScene extends Scene {
    abstract setting_scene: Types.Scenes.SceneType;
    abstract game_scene: Types.Scenes.SceneType;
    abstract result_scene: Types.Scenes.SceneType;

    loadScenes () {
        const setting_scene_key = `${store.game_name}-SettingScene`;
        const game_scene_key = `${store.game_name}-GameScene`;
        const result_scene_key = `${store.game_name}-ResultScene`;

        if (!this.game.scene.getScene(setting_scene_key)) this.scene.add(setting_scene_key, this.setting_scene);
        if (!this.game.scene.getScene(game_scene_key)) this.scene.add(game_scene_key, this.game_scene);
        if (!this.game.scene.getScene(result_scene_key)) this.scene.add(result_scene_key, this.result_scene);
    }
}
