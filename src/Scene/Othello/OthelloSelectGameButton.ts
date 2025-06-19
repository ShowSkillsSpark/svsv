import { Scene } from "phaser";
import { SelectGameButton } from "../Common/SelectGameButton";
import { OthelloSettingScene } from "./OthelloSettingScene";

export class OthelloSelectGameButton extends SelectGameButton {
    scene: Scene;

    constructor(scene: Scene, x: integer, y: integer, width: integer, height: integer) {
        super(scene, x, y, width, height);
        this.scene = scene;
        const game_logo = this.scene.add.sprite(0, 0, 'Othello:assets', 32);
        const game_logo_animation_key = 'OthelloSelectGameButton:animation';
        this.scene.anims.create({
            key: game_logo_animation_key,
            frames: this.scene.anims.generateFrameNumbers('Othello:assets', {start: 32, end: 44}),
            duration: this.animation_repeat_delay,
            repeat: -1,
            repeatDelay: this.animation_repeat_delay,
            delay: Math.random() * this.animation_repeat_delay,
        });
        super.init('오델로', game_logo, game_logo_animation_key);
    }

    onpointerup() {
        this.scene.scene.start(OthelloSettingScene.key);
    }
}
