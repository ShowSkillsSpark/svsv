import { Scene } from "phaser";
import store from "../../../store";

export class ReversiSettingScene extends Scene {
    static preload() {}
    create() {
        console.log('ReversiSettingScene create');
        // store.startGameScene();
    }
}
