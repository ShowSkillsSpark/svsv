import { Scene } from "phaser";
import { SelectGameButton } from "../Common/SelectGameButton";
import { OthelloSettingScene } from "./OthelloSettingScene";

export class OthelloSelectGameButton extends SelectGameButton {
    static game_logo_animation_key = 'OthelloSelectGameButton:animation';
    static preload(scene: Scene) {
        scene.anims.create({
            key: OthelloSelectGameButton.game_logo_animation_key,
            frames: scene.anims.generateFrameNumbers('Othello:assets', {start: 32, end: 44}),
            duration: 1000,
            repeat: -1,
            repeatDelay: 0,
            delay: 0,
        });
    }

    scene: Scene;

    constructor(scene: Scene, x: integer, y: integer, width: integer, height: integer) {
        super(scene, x, y, width, height);
        this.scene = scene;
        const game_logo = this.scene.add.sprite(0, 0, 'Othello:assets', 32);
        super.init('오델로', game_logo, OthelloSelectGameButton.game_logo_animation_key);
    }

    onpointerup() {
        this.scene.scene.start(OthelloSettingScene.key);
    }
}
