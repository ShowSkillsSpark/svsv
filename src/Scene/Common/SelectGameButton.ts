import { GameObjects, Scene } from "phaser";
import { store } from "../../Store/CommonStore";

export class SelectGameButton extends GameObjects.Container {
    game_logo!: GameObjects.Sprite;
    game_logo_animation_key!: string;
    animation_repeat_delay = 1667;

    game_name!: GameObjects.Text;

    private cover!: GameObjects.Rectangle;

    constructor(scene: Scene, x: integer, y: integer, width: integer, height: integer) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setSize(width, height);
    }

    init(game_name: string, game_logo: GameObjects.Sprite, game_logo_animation_key: string) {
        const logo_height = this.height * 0.8;
        const logo_size = Math.min(this.width, logo_height);
        this.game_logo = game_logo;
        this.game_logo.setScale(logo_size/this.game_logo.width).setY((logo_size - this.height)/2);

        this.game_logo_animation_key = game_logo_animation_key;
        this.game_logo.play(this.game_logo_animation_key);

        const game_name_height = this.height * 0.2;
        this.game_name = this.scene.add.text(0, logo_height/2, game_name, {
            ...store.style.font_style,
            fontSize: game_name_height,
        }).setOrigin(0.5);
        this.cover = this.scene.add.rectangle(0, 0, this.width*1.1, this.height*1.1, store.style.color.grey_0, 0.5);

        this.add([this.game_logo, this.game_name, this.cover]);
        this.onButtonState();
    }

    private _centered = false;
    private _pointerover = false;
    get centered() { return this._centered; }
    get pointerover() { return this._pointerover; }
    set centered(value: boolean) {
        this._centered = value;
        this.onButtonState();
    }
    set pointerover(value: boolean) {
        this._pointerover = value;
        this.onButtonState();
        if (value) {
            this.game_logo.anims.repeatDelay = 0;
            let startFrame = this.game_logo.anims.currentFrame?.index ? this.game_logo.anims.currentFrame.index % this.game_logo.anims.getTotalFrames() : undefined;
            this.game_logo.play({
                key: this.game_logo_animation_key,
                startFrame,
                repeatDelay: this.animation_repeat_delay/10,
                delay: 0,
            });
        } else {
            this.game_logo.anims.repeatDelay = this.animation_repeat_delay;
            this.game_logo.anims.resume();
        }
        this.game_logo.anims.reverse();
    }

    private onButtonState() {
        if (this._centered && this._pointerover) {
            this.setScale(1.2);
            this.cover.setAlpha(0);
        } else if (this._centered && !this._pointerover) {
            this.setScale(1);
            this.cover.setAlpha(0);
        } else if (!this._centered && this._pointerover) {
            this.setScale(1);
            this.cover.setAlpha(1);
        } else if (!this._centered && !this._pointerover) {
            this.setScale(0.8);
            this.cover.setAlpha(1);
        }
    }

    onpointerup() {
        console.error(this.game_name.text, 'onpointerup is not implemented.');
    }
    onpointerdown() {
        this.game_logo.anims.pause();
    }
}
