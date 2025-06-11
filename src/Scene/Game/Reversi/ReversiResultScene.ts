import { Scene } from "phaser";
import store from "../../../store";

export class ReversiResultScene extends Scene {
    static preload() {}
    create() {
        console.log('ReversiResultScene create');
        // store.startSettingScene();
    }
}
