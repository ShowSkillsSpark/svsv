import { Scene } from "phaser";
import store from "../../../store";

export class ReversiGameScene extends Scene {
    static preload() {}
    create() {
        console.log('ReversiGameScene create');
        // store.startResultScene();
    }
}
