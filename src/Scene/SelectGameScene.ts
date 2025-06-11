import { GameObjects, Scene, Types } from "phaser";
import store, { GameName, WIDTH, HEIGHT } from "../store";

import Reversi from "./Game/Reversi";

class GameButton extends GameObjects.Container {
    game_name: GameName;
    game_scene: Types.Scenes.SceneType;

    logo: GameObjects.Sprite;
    logo_animation_key: string;
    animation_repeat_delay: number;

    cover: GameObjects.Rectangle;
    readonly index: integer;

    constructor(
        scene: Scene, x: integer, y: integer, width: integer, height: integer,
        game_name: GameName, game_scene: Types.Scenes.SceneType,
        index: integer,
    ) {
        super(scene, x, y);
        this.game_name = game_name;
        this.game_scene = game_scene;

        scene.add.existing(this);
        this.setSize(width, height);

        const logo_height = height * 0.8;
        const game_name_height = height * 0.2;
        const logo_size = Math.min(width, logo_height);

        this.cover = scene.add.rectangle(0, 0, width*1.1, height*1.1, 0x000000, 0.5);
        const zone = scene.add.zone(0, 0, width, height).setOrigin(0.5);

        const logo_asset = `${game_name}Logo`;
        this.logo = scene.add.sprite(0, 0, logo_asset);
        this.logo.setScale(logo_size/this.logo.width).setY((logo_size - height)/2);

        this.logo_animation_key = `${logo_asset}-animation-${x}`;
        this.animation_repeat_delay = 700;
        scene.anims.create({
            key: this.logo_animation_key,
            frames: scene.anims.generateFrameNumbers(logo_asset, { start: 0, end: 15 }),
            repeat: -1,
            duration: 1667,
            repeatDelay: this.animation_repeat_delay,
            delay: Math.random() * this.animation_repeat_delay,
        });
        this.logo.play(this.logo_animation_key);

        const game_name_text = this.scene.add.text(0, (logo_height)/2, game_name, {
            fontSize: game_name_height,
            fontFamily: 'Ramche',
            color: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setPadding(game_name_height/20);

        this.add([this.logo, game_name_text, zone, this.cover]);

        // zone.setInteractive({ cursor: 'pointer' });
        zone.on('pointerover', () => {
            this.logo.anims.repeatDelay = 0;
            this.logo.anims.reverse();
            this.setScale(1.2);
        });
        zone.on('pointerout', () => {
            this.logo.anims.resume();
            this.logo.anims.reverse();
            this.logo.anims.repeatDelay = this.animation_repeat_delay;
            this.setScale(1);
        });
        zone.on('pointerup', () => {
            store.startLoadingScene(scene.scene, game_name, game_scene);
            scene.sound.stopByKey(store.bgm_name);
        });
        zone.on('pointerdown', () => {
            this.logo.anims.pause();
        });

        this.index = index;
        this.centered = false;
        this.pointerover = false;
    }

    private _centered: boolean = false;
    private _pointerover: boolean = false;
    get centered() { return this._centered; }
    get pointerover() { return this._pointerover; }
    set centered(centered: boolean) {
        this._centered = centered;
        this.setButtonState(centered, this.pointerover);
    }
    set pointerover(pointerover: boolean) {
        this._pointerover = pointerover;
        this.setButtonState(this.centered, pointerover);
        if (pointerover) {
            this.logo.anims.repeatDelay = 0;
        } else {
            this.logo.anims.resume();
            this.logo.anims.repeatDelay = this.animation_repeat_delay;
        }
    }
    private setButtonState(center: boolean, focus: boolean) {
        if (center && focus) {
            this.setScale(1.2);
            this.cover.setAlpha(0);
        } else if (center && !focus) {
            this.setScale(1);
            this.cover.setAlpha(0);
        } else if (!center && focus) {
            this.setScale(1);
            this.cover.setAlpha(1);
        } else if (!center && !focus) {
            this.setScale(0.8);
            this.cover.setAlpha(1);
        }
    }

    onPointerUp() {
        store.startLoadingScene(this.scene.scene, this.game_name, this.game_scene);
        this.scene.sound.stopByKey(store.bgm_name);
    }
    onPointerDown() {
        this.logo.anims.pause();
    }
}

export class SelectGameScene extends Scene {
    static key = 'SelectGameScene';

    constructor() {
        super(SelectGameScene.key);
    }

    create() {
        const button_width = WIDTH * 0.2;
        const button_height = HEIGHT * 0.5;

        // TODO: 랜덤, 후원 타이밍, 후원한 게임
        const select_game_buttons = [
            { name: GameName.Reversi, scene: Reversi },
            { name: GameName.Reversi, scene: Reversi },
            { name: GameName.Reversi, scene: Reversi },
        ].map(({name, scene}, index) => {
            return new GameButton(this, WIDTH*(1/2 + index*3/10), HEIGHT/2, button_width, button_height, name, scene, index);
        });

        const zone_width = button_width;
        const zone_height = button_height;
        const zone_horizontal_gap = WIDTH*0.3;
        const left_zone = this.add.zone(WIDTH/2 - zone_horizontal_gap, HEIGHT/2, zone_width, zone_height).setOrigin(0.5);
        const center_zone = this.add.zone(WIDTH/2, HEIGHT/2, zone_width, zone_height).setOrigin(0.5);
        const right_zone = this.add.zone(WIDTH/2 + zone_horizontal_gap, HEIGHT/2, zone_width, zone_height).setOrigin(0.5);

        const onpointerover = (index: integer, center: boolean, focus: boolean) => {
            if (index < 0 || index >= select_game_buttons.length) return;
            select_game_buttons[index].centered = center;
            select_game_buttons[index].pointerover = focus;
        };
        const onpointerout = (index: integer, center: boolean, focus: boolean) => {
            if (index < 0 || index >= select_game_buttons.length) return;
            select_game_buttons[index].centered = center;
            select_game_buttons[index].pointerover = focus;
        }

        let curr_index = 0;
        left_zone.setInteractive().on('pointerup', () => {
            if (curr_index !== 0) {
                select_game_buttons.forEach((button, index) => {
                    button.setPosition(button.x + zone_horizontal_gap, button.y);
                    button.centered = curr_index - 1 == index;
                    button.pointerover = curr_index - 2 == index;
                });
            }
            curr_index = Math.max(curr_index - 1, 0);
        }).on('pointerdown', () => {
        }).on('pointerover', () => {
            onpointerover(curr_index - 1, false, true);
        }).on('pointerout', () => {
            onpointerout(curr_index - 1, false, false);
        });
        center_zone.setInteractive().on('pointerup', () => {
            select_game_buttons[curr_index].onPointerUp();
        }).on('pointerdown', () => {
            select_game_buttons[curr_index].onPointerDown();
        }).on('pointerover', () => {
            onpointerover(curr_index, true, true);
        }).on('pointerout', () => {
            onpointerout(curr_index, true, false);
        });
        right_zone.setInteractive().on('pointerup', () => {
            if (curr_index !== select_game_buttons.length - 1) {
                select_game_buttons.forEach((button, index) => {
                    button.setPosition(button.x - zone_horizontal_gap, button.y);
                    button.centered = curr_index + 1 == index;
                    button.pointerover = curr_index + 2 == index;
                });
            }
            curr_index = Math.min(curr_index + 1, select_game_buttons.length - 1);
        }).on('pointerdown', () => {
            
        }).on('pointerover', () => {
            onpointerover(curr_index + 1, false, true);
        }).on('pointerout', () => {
            onpointerout(curr_index + 1, false, false);
        });

        select_game_buttons[curr_index].centered = true;
    }
}
