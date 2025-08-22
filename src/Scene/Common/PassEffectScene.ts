import { Scene } from "phaser";
import { store } from "../../Store/CommonStore";

export class PassEffectScene extends Scene {
    static readonly key = 'PassEffectScene';

    constructor() {
        super(PassEffectScene.key);
    }

    create() {
        // Semi-transparent background
        const bg = this.add.rectangle(0, 0, store.WIDTH, store.HEIGHT, 0x000000, 0.5).setOrigin(0);

        // "PASS" text
        const pass_text = this.add.text(store.WIDTH / 2, store.HEIGHT / 2, 'PASS', {
            ...store.style.font_style,
            fontSize: (store.style.font_style.fontSize as number) * 3,
            color: store.style.color_code.pink_f,
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);


        // Tween animation
        this.tweens.add({
            targets: pass_text,
            alpha: 1,
            scale: 1,
            duration: 400,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.time.delayedCall(600, () => {
                    this.tweens.add({
                        targets: pass_text,
                        alpha: 0,
                        duration: 200,
                        onComplete: () => {
                            this.scene.stop();
                        }
                    });
                });
            }
        });
    }
}
