import { Scene } from "phaser";
import { store } from "../../Store/CommonStore";
import { OthelloSelectGameButton } from "../Othello/OthelloSelectGameButton";
import { SelectGameButton } from "./SelectGameButton";

export class SelectGameScene extends Scene {
    static readonly key = 'SelectGameScene';
    constructor() {
        super(SelectGameScene.key);
    }

    create() {
        // title
        this.add.text(store.WIDTH/2, 0, '스트리머 vs 시청자', {
            ...store.style.font_style,
            color: store.style.color_code.green_f,
        }).setOrigin(0.5, 0);

        // buttons
        const button_width = store.WIDTH * 0.2;
        const button_height = store.HEIGHT * 0.5;
        const select_game_buttons = [
            OthelloSelectGameButton,
            OthelloSelectGameButton,
            OthelloSelectGameButton,
        ].map((game_button: typeof SelectGameButton, index: integer) => {
            return new game_button(this, store.WIDTH*(1/2 + index*3/10), store.HEIGHT/2, button_width, button_height);
        });

        // zone
        const zone_width = button_width;
        const zone_height = button_height;
        const zone_horizontal_gap = store.WIDTH*0.3;
        const left_zone = this.add.zone(store.WIDTH/2 - zone_horizontal_gap, store.HEIGHT/2, zone_width, zone_height).setOrigin(0.5);
        const center_zone = this.add.zone(store.WIDTH/2, store.HEIGHT/2, zone_width, zone_height).setOrigin(0.5);
        const right_zone = this.add.zone(store.WIDTH/2 + zone_horizontal_gap, store.HEIGHT/2, zone_width, zone_height).setOrigin(0.5);
        
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
            select_game_buttons[curr_index].onpointerup();
        }).on('pointerdown', () => {
            select_game_buttons[curr_index].onpointerdown();
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

        // if (DEBUG) select_game_buttons[curr_index].onPointerUp();
    }
}
