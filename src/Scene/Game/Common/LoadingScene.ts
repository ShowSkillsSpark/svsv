import { Scene, Types } from "phaser";
import store from "../../../store";

export abstract class LoadingScene extends Scene {
    abstract game_scene: Types.Scenes.SceneType;
    abstract result_scene: Types.Scenes.SceneType;

    loadScenes () {
        const game_scene_key = `${store.game_name}GameScene`;
        const result_scene_key = `${store.game_name}ResultScene`;
        console.log(game_scene_key);

        if (!this.game.scene.getScene(game_scene_key)) this.scene.add(game_scene_key, this.game_scene);
        if (!this.game.scene.getScene(result_scene_key)) this.scene.add(result_scene_key, this.result_scene);
    }
}
