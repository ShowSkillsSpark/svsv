import { GameObjects, Scene, Types } from "phaser";
import { CommonStoreEvent, store } from "../../Store/CommonStore";

class Panel extends GameObjects.Container {
    tag: GameObjects.Text;
    tag_label: string;

    constructor(scene: Scene, x: number, y: number, width: number, height: number, tag: GameObjects.Text) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setSize(width, height).setVisible(false);

        this.tag = tag;
        this.tag_label = tag.text;

        // background
        const round = store.WIDTH/100;
        const bg = scene.add.graphics().fillStyle(store.style.color.grey_e)
                .fillRoundedRect(0, 0, width, height, round);
        this.add(bg);
        
        this.tag.setInteractive().on('pointerup', () => {
            this.toggle();
        }).on('pointerover', () => {
            this.tag.setOrigin(1, 0);
        }).on('pointerout', () => {
            if (!this.visible) this.tag.setOrigin(0.5, 0);
        });
    }

    toggle(visible?: boolean) {
        const target_visible = visible ?? !this.visible;
        if (this.visible === target_visible) return;
        this.setVisible(target_visible);
        if (this.visible) {
            this.scene.sound.play('Common:sound:shop', { volume: store.volume_effect });
            this.tag.setText('닫\n기').setColor(store.style.color_code.pink_f);
        } else {
            this.scene.sound.play('Common:sound:exit', { volume: store.volume_effect });
            this.tag.setText(this.tag_label).setColor(store.style.color_code.grey_f);
        }
        this.ontoggle?.(this.visible);
    }
    ontoggle?: (value: boolean) => void;
}
class VolumePanel extends Panel {
    constructor(scene: Scene, x: number, y: number, width: number, height: number, tag: GameObjects.Text) {
        super(scene, x, y, width, height, tag);

        const master_value_text = this.addRow(this.height *3/8, '마스터', store.volume_master, () => {
            this.scene.sound.play('Common:sound:cancel', { volume: store.volume_effect });
            store.volume_master -= 0.1;
        }, () => {
            this.scene.sound.play('Common:sound:cancel', { volume: store.volume_effect });
            store.volume_master += 0.1;
        }); // master
        const bgm_value_text = this.addRow(this.height *4/8, '배경음악', store.volume_bgm, () => {
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
}
class CreditPanel extends Panel {
    constructor(scene: Scene, x: number, y: number, width: number, height: number, tag: GameObjects.Text) {
        super(scene, x, y, width, height, tag);

        const label_x_offset = this.width*1/4;
        const name_x_offset = this.width*2/4;
        const logo_x_offset = this.width*3/4;
        const y_offset = width/7;
        const gap = height/7;

        let index = 0;
        this.addText(label_x_offset, y_offset + index * gap, '기획/개발/그림', {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        });
        this.addText(name_x_offset, y_offset + index * gap, '실력발휘', {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        });
        this.addLogo(logo_x_offset, y_offset + index * gap, 'credit:logo:github', 'https://github.com/ShowSkillsSpark');
        this.addLogo(logo_x_offset + 90, y_offset + index * gap, 'credit:logo:youtube', 'https://www.youtube.com/@%EC%8B%A4%EB%A0%A5%EB%B0%9C%ED%9C%98');
        this.addLogo(logo_x_offset + 240, y_offset + index * gap, 'credit:logo:toon', 'https://toon.at/donate/skill');

        index += 1;
        this.addText(label_x_offset, y_offset + index * gap, '배경음악', {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        });
        this.addText(name_x_offset, y_offset + index * gap, 'xDeviruchi', {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        });
        this.addLogo(logo_x_offset, y_offset + index * gap, 'credit:logo:itch', 'https://itch.io/profile/xdeviruchi');
        this.addLogo(logo_x_offset + 90, y_offset + index * gap, 'credit:logo:youtube', 'https://www.youtube.com/channel/UC-co0iNy2WkUNHCtQZUHQIg');

        index += 1;
        this.addText(label_x_offset, y_offset + index * gap, '효과음', {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        });
        this.addText(name_x_offset, y_offset + index * gap, 'SoupTonic', {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        });
        this.addLogo(logo_x_offset, y_offset + index * gap, 'credit:logo:itch', 'https://itch.io/profile/souptonic');

        index += 1;
        this.addText(label_x_offset, y_offset + index * gap, '폰트', {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        });
        this.addText(name_x_offset, y_offset + index * gap, '둥근모꼴+ Fixedsys', {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        });
        this.addLogo(logo_x_offset, y_offset + index * gap, 'credit:logo:link', 'https://cactus.tistory.com/193');
    }

    addText(x: number, y: number, text: string, style: Types.GameObjects.Text.TextStyle) {
        const obj = this.scene.add.text(x, y, text, style).setOrigin(0.5);
        this.add(obj);
        return obj;
    }
    addLogo(x: number, y: number, key: string, url: string) {
        const logo = this.scene.add.image(x, y, key).setOrigin(0.5);
        const logo_height = store.style.font_style.fontSize as number;
        const scale = logo_height/logo.height;
        logo.setScale(scale).setInteractive().on('pointerup', () => {
            window.open(url, '_blank');
        });
        this.add([logo]);
        return logo;
    }
}

export class SidebarScene extends Scene {
    static readonly key = 'SidebarScene';

    constructor() {
        super(SidebarScene.key);
    }

    preload() {
        this.load.setPath('assets/Common/Sidebar/')
        this.load.image('credit:logo:github', 'github-mark.svg');
        this.load.image('credit:logo:itch', 'itchio-textless-black.svg');
        this.load.image('credit:logo:link', 'link_32dp.svg');
        this.load.image('credit:logo:toon', 'toonation-symbol.png');
        this.load.image('credit:logo:youtube', 'yt_logo_mono_light.png');
    }

    create() {
        const panel_x_offset = store.WIDTH/20;
        const panel_y_offset = store.HEIGHT/20;
        const panel_width = store.WIDTH*9/10;
        const panel_height = store.HEIGHT*9/10;

        const zone = this.add.zone(0, 0, store.WIDTH, store.HEIGHT).setOrigin(0).setVisible(false)
                .setInteractive().on('pointerup', () => {});

        // 소리
        const tag_volume = this.add.text(store.WIDTH, panel_y_offset, '소\n리', {
            ...store.style.font_style,
            backgroundColor: store.style.color_code.grey_0,
        }).setOrigin(0.5, 0)
        const panel_volume = new VolumePanel(this, panel_x_offset, panel_y_offset, panel_width, panel_height, tag_volume);

        const tag_credit = this.add.text(store.WIDTH, panel_y_offset + tag_volume.height, '제\n공', {
            ...store.style.font_style,
            backgroundColor: store.style.color_code.grey_0,
        }).setOrigin(0.5, 0)
        const panel_credit = new CreditPanel(this, panel_x_offset, panel_y_offset, panel_width, panel_height, tag_credit);

        const panel_list = [panel_volume, panel_credit];

        panel_volume.ontoggle = (value: boolean) => {
            if (value) {
                panel_credit.toggle(false);
                zone.visible = true;
            } else {
                for (const panel of panel_list) {
                    if (panel.visible) {
                        zone.visible = true;
                    }
                }
                zone.visible = false;
            }
        }
        panel_credit.ontoggle = (value: boolean) => {
            if (value) {
                panel_volume.toggle(false);
                zone.visible = true;
            } else {
                for (const panel of panel_list) {
                    if (panel.visible) {
                        zone.visible = true;
                    }
                }
                zone.visible = false;
            }
        }
    }
}
