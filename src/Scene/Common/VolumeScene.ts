import { GameObjects, Scene } from "phaser";
import { CommonStoreEvent, store } from "../../Store/CommonStore";

class VolumePanel extends GameObjects.Container {
    constructor(scene: Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setSize(width, height).setVisible(false);

        // background
        const round = store.WIDTH/100;
        const zone = scene.add.zone(0, 0, width, height).setOrigin(0)
                .setInteractive().on('pointerup', () => {});
        const bg = scene.add.graphics().fillStyle(store.style.color.grey_e)
                .fillRoundedRect(0, 0, width, height, round);
        this.add([zone, bg]);


        // 닫기 버튼
        const back_button_x_offset = store.HEIGHT/20;
        const back_button_y_offset = store.HEIGHT/20;
        const close_button_text = scene.add.text(back_button_x_offset, back_button_y_offset, '닫기', {
                    ...store.style.font_style,
                    color: store.style.color_code.pink_a,
                }).setOrigin(0, 0.5)
                .setInteractive().on('pointerup', () => {
                    this.toggle();
                }).on('pointerover', () => {
                    close_button_text.setColor(store.style.color_code.pink_f);
                }).on('pointerout', () => {
                    close_button_text.setColor(store.style.color_code.pink_a);
                });
        this.add(close_button_text);

        const master_value_text = this.addRow(this.height *3/8, '마스터 볼륨', store.volume_master, () => {
            this.scene.sound.play('Common:sound:cancel', { volume: store.volume_effect });
            store.volume_master -= 0.1;
        }, () => {
            this.scene.sound.play('Common:sound:cancel', { volume: store.volume_effect });
            store.volume_master += 0.1;
        }); // master
        const bgm_value_text = this.addRow(this.height *4/8, '배경 음악', store.volume_bgm, () => {
            this.scene.sound.play('Common:sound:cancel', { volume: store.volume_effect });
            store.volume_bgm -= 0.1;
        }, () => {
            this.scene.sound.play('Common:sound:cancel', { volume: store.volume_effect });
            store.volume_bgm += 0.1;
        }); // bgm
        const sfx_value_text = this.addRow(this.height *5/8, '효과음', store.volume_effect, () => {
            this.scene.sound.play('Common:sound:cancel', { volume: store.volume_effect });
            store.volume_effect -= 0.1;
        }, () => {
            this.scene.sound.play('Common:sound:cancel', { volume: store.volume_effect });
            store.volume_effect += 0.1;
        }); // sfx

        store.on(CommonStoreEvent.VOLUME_MASTER, () => {
            master_value_text.setText((store.volume_master*10).toFixed(0));
        })
        store.on(CommonStoreEvent.VOLUME_BGM, () => {
            bgm_value_text.setText((store.volume_bgm*10).toFixed(0));
        })
        store.on(CommonStoreEvent.VOLUME_EFFECT, () => {
            sfx_value_text.setText((store.volume_effect*10).toFixed(0));
        })
    }

    addRow(
        y_offset: number, label: string, value: number,
        on_left: () => void, on_right: () => void
    ) {
        const volume_label_x_offset = this.width *1/3;
        const volume_value_x_offset = this.width *2/3;
        const volume_left_button_x_offset = volume_value_x_offset - this.width/10;
        const volume_right_button_x_offset = volume_value_x_offset + this.width/10;

        const label_text = this.scene.add.text(volume_label_x_offset, y_offset, label, {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        }).setOrigin(0.5);
        const left_button = this.scene.add.text(volume_left_button_x_offset, y_offset, '-', {
            ...store.style.font_style,
            color: store.style.color_code.green_a,
        }).setOrigin(0.5).setInteractive().on('pointerup', () => {
            on_left();
        }).on('pointerover', () => {
            left_button.setColor(store.style.color_code.grey_4);
        }).on('pointerout', () => {
            left_button.setColor(store.style.color_code.green_a);
        });
        const right_button = this.scene.add.text(volume_right_button_x_offset, y_offset, '+', {
            ...store.style.font_style,
            color: store.style.color_code.green_a,
        }).setOrigin(0.5).setInteractive().on('pointerup', () => {
            on_right();
        }).on('pointerover', () => {
            right_button.setColor(store.style.color_code.grey_4);
        }).on('pointerout', () => {
            right_button.setColor(store.style.color_code.green_a);
        });
        const value_text = this.scene.add.text(volume_value_x_offset, y_offset, (value*10).toFixed(0), {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        }).setOrigin(0.5);
        this.add([label_text, left_button, right_button, value_text]);

        return value_text;
    }

    toggle() {
        this.setVisible(!this.visible);
        if (this.visible) {
            this.scene.sound.play('Common:sound:shop', { volume: store.volume_effect });
        } else {
            this.scene.sound.play('Common:sound:exit', { volume: store.volume_effect });
        }
    }
}

export class VolumeScene extends Scene {
    static readonly key = 'VolumeScene';

    panel!: VolumePanel;

    constructor() {
        super(VolumeScene.key);
    }

    create() {
        const panel_x_offset = store.WIDTH/20;
        const panel_y_offset = store.HEIGHT/20;

        // tag
        const tax_x_move = (store.style.font_style.fontSize as number)/2;
        const tag = this.add.text(store.WIDTH + tax_x_move, panel_y_offset, '소\n리', {
            ...store.style.font_style,
            backgroundColor: store.style.color_code.grey_4,
        }).setOrigin(1, 0).setInteractive().on('pointerup', () => {
            this.panel.toggle();
        }).on('pointerover', () => {
            tag.setX(store.WIDTH);
        }).on('pointerout', () => {
            tag.setX(store.WIDTH + tax_x_move);
        });

        const panel_width = store.WIDTH*9/10;
        const panel_height = store.HEIGHT*9/10;
        this.panel = new VolumePanel(this, panel_x_offset, panel_y_offset, panel_width, panel_height);
    }
}
