import { Scene } from "phaser";
import { SelectGameButton } from "../Common/SelectGameButton";
import { store } from "../../Store/CommonStore";
import { YachtSettingScene } from "./YachtSettingScene";


export class YachtSelectGameButton extends SelectGameButton {
    static game_logo_animation_key = 'YachtSelectGameButton:animation';
    static animation_duration = 2000;
    static preload(scene: Scene) {
        scene.anims.create({
            key: YachtSelectGameButton.game_logo_animation_key,
            frames: scene.anims.generateFrameNumbers('Yacht:assets', {start: 0, end: 11}),
            duration: this.animation_duration,
            repeat: -1,
            repeatDelay: this.animation_duration*2,
            delay: this.animation_duration*Math.random()*2,
        });
    }

    scene: Scene;

    constructor(scene: Scene, x: integer, y: integer, width: integer, height: integer) {
        super(scene, x, y, width, height);
        this.scene = scene;
        const game_logo = this.scene.add.sprite(0, 0, 'Yacht:assets', 0);
        super.init('야추', game_logo, YachtSelectGameButton.game_logo_animation_key);
    }

    onpointerup() {
        this.scene.sound.play('Common:sound:pause', { volume: store.volume_effect });
        this.scene.scene.start(YachtSettingScene.key);
    }
}
