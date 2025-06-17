import { Scene } from "phaser";
import store from "../../../store";

export class ReversiResultScene extends Scene {
    create() {
        console.log('ReversiResultScene create');
        // store.startLoadingScene();
    }

    static preload(scene: Scene) {}
}
