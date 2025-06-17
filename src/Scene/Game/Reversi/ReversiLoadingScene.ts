import { GameObjects, Scene, Types } from "phaser";
import store, { Color, DEBUG, HEIGHT, TeamTag, WIDTH } from "../../../store";

import { LoadingScene } from "../Common/LoadingScene";
import { ReversiGameScene } from "./ReversiGameScene";
import { ReversiResultScene } from "./ReversiResultScene";

class Panel extends GameObjects.Container {
    fontSize = 64;
    label_center = WIDTH*3/20;
    offset_y = this.fontSize;
    gap = this.fontSize * 1.5;

    left_button_center = WIDTH*7/20;
    right_button_center = WIDTH*14/20;
    text_center = (this.left_button_center + this.right_button_center)/2;

    constructor(scene: Scene) {
        super(scene);
        scene.add.existing(this);
        const background = scene.add.graphics()
                .fillStyle(Color.GREY_F)
                .fillRoundedRect(0, 0, WIDTH*8/10, HEIGHT*7/10, WIDTH/100);
        this.add(background);

        this.setY(HEIGHT*1/10);
    }
}

class TeamPanel extends Panel {
    constructor(scene: Scene, tag: TeamTag, style: Types.GameObjects.Text.TextStyle) {
        super(scene);
        // 팀 이름
        const name_label = scene.add.text(this.label_center, this.offset_y + 0 * this.gap, '팀 이름', {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        const name_text = scene.add.text(this.text_center, this.offset_y + 0 * this.gap, store.teams[tag].name, {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        this.add([name_label, name_text]);
        // const name_edit = scene.add.sprite(this.right_button_center, this.offset_y + 0 * this.gap, 'ReversiAssets').setOrigin(0.5).setTint(0);
        // name_edit.setScale(this.fontSize/name_edit.height);
        // this.add([name_edit]);

        // 팀 구성
        const member_label = scene.add.text(this.label_center, this.offset_y + 1 * this.gap, '팀 구성', {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        const member_text = scene.add.text(this.text_center, this.offset_y + 1 * this.gap, store.teams[tag].member, {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        this.add([member_label, member_text]);
        // const member_left_button = scene.add.sprite(this.left_button_center, this.offset_y + 1 * this.gap, 'ReversiAssets').setOrigin(0.5).setTint(0);
        // const member_right_button = scene.add.sprite(this.right_button_center, this.offset_y + 1 * this.gap, 'ReversiAssets').setOrigin(0.5).setTint(0);
        // member_left_button.setScale(this.fontSize/member_left_button.height);
        // member_right_button.setScale(this.fontSize/member_right_button.height);
        // this.add([member_left_button, member_right_button]);

        // 제한 시간
        const time_label = scene.add.text(this.label_center, this.offset_y + 2 * this.gap, '제한 시간', {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        const time_text = scene.add.text(this.text_center, this.offset_y + 2 * this.gap, `${store.teams[tag].time} 초`, {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        this.add([time_label, time_text]);
        // const time_left_button = scene.add.sprite(this.left_button_center, this.offset_y + 2 * this.gap, 'ReversiAssets').setOrigin(0.5).setTint(0);
        // const time_right_button = scene.add.sprite(this.right_button_center, this.offset_y + 2 * this.gap, 'ReversiAssets').setOrigin(0.5).setTint(0);
        // time_left_button.setScale(this.fontSize/time_left_button.height);
        // time_right_button.setScale(this.fontSize/time_right_button.height);
        // this.add([time_left_button, time_right_button]);

        // 착수 방식
        const set_way_label = scene.add.text(this.label_center, this.offset_y + 3 * this.gap, '착수 방식', {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        const set_way_text = scene.add.text(this.text_center, this.offset_y + 3 * this.gap, store.teams[tag].set_way, {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        this.add([set_way_label, set_way_text]);
        // const set_way_left_button = scene.add.sprite(this.left_button_center, this.offset_y + 3 * this.gap, 'ReversiAssets').setOrigin(0.5).setTint(0);
        // const set_way_right_button = scene.add.sprite(this.right_button_center, this.offset_y + 3 * this.gap, 'ReversiAssets').setOrigin(0.5).setTint(0);
        // set_way_left_button.setScale(this.fontSize/set_way_left_button.height);
        // set_way_right_button.setScale(this.fontSize/set_way_right_button.height);
        // this.add([set_way_left_button, set_way_right_button]);
    }
}

class GamePanel extends Panel {
    constructor(scene: Scene, tag: string, style: Types.GameObjects.Text.TextStyle) {
        super(scene);

        // 선수
        const start_turn_label = scene.add.text(this.label_center, this.offset_y + 0 * this.gap, '선수', {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        const start_turn_text = scene.add.text(this.text_center, this.offset_y + 0 * this.gap, '무작위', {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        this.add([start_turn_label, start_turn_text]);

        // 게임 크기
        const game_size_label = scene.add.text(this.label_center, this.offset_y + 1 * this.gap, '보드 크기', {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        const game_size_text = scene.add.text(this.text_center, this.offset_y + 1 * this.gap, '8x8', {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        this.add([game_size_label, game_size_text]);

        // 편집
        // const start_turn_label = scene.add.text(this.label_center, this.offset_y + 0 * this.gap, '선수', {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        // const start_turn_text = scene.add.text(this.text_center, this.offset_y + 0 * this.gap, '무작위', {...style, fontSize: this.fontSize, color: Color.CODE_GREY_0.toString()}).setOrigin(0.5);
        // this.add([start_turn_label, start_turn_text]);

        // 게임 시작
        const start_game_button = scene.add.graphics().fillStyle(Color.GREY_2).fillRoundedRect(WIDTH*3/10, this.offset_y + 4.5 * this.gap, WIDTH*2/10, HEIGHT/10);
        const start_game_button_text = scene.add.text(WIDTH*4/10, this.offset_y + 5 * this.gap, '게임 시작', {...style, fontSize: this.fontSize, color: Color.CODE_GREEN.toString()}).setOrigin(0.5);
        start_game_button_text.setInteractive().on('pointerup', () => {
            store.startGameScene(scene.scene);
        });
        scene.tweens.add({
            targets: start_game_button_text,
            ease: 'Linear',
            duration: 1000,
            repeat: -1,
            scale: 1.2,
            yoyo: true,
        });
        this.add([start_game_button, start_game_button_text]);

        // if (DEBUG) store.startGameScene(scene.scene);
    }
}

abstract class Setting extends GameObjects.Container {
    private index: number;
    private _tag: string;

    selector_tab: GameObjects.Graphics;
    selector_title: GameObjects.Text;
    selector_title_style: Types.GameObjects.Text.TextStyle;
    
    constructor(scene: Scene, index: number, tag: string, style: Types.GameObjects.Text.TextStyle, panel: Panel) {
        super(scene);
        scene.add.existing(this);
        this.index = index;
        this._tag = tag;
        this.selector_title_style = style;

        // selector
        this.selector_tab = scene.add.graphics();
        this.selector_title = scene.add.text(WIDTH/10 + this.index * WIDTH/5, HEIGHT*1/20, this._tag, style).setOrigin(0.5);
        const zone = scene.add.zone(this.index * WIDTH/5, 0, WIDTH/5, HEIGHT/10).setOrigin(0);
        zone.setInteractive().on('pointerup', () => {
            this.selected = true;
        });

        this.add([this.selector_tab, this.selector_title, zone, panel]);

        this.setPosition(WIDTH/10, HEIGHT/10);
        this.selected = false;
    }

    set title(title: string) {
        this._tag = title;
        this.selector_title.setText(this._tag);
    }

    set selected(selected: boolean) {
        if (selected) {
            this.selector_title.setTint(Color.GREY_0);
            this.selector_tab.fillStyle(Color.GREY_F).fillRoundedRect(this.index * WIDTH/5, 0, WIDTH/5, HEIGHT/5, WIDTH/100);
            this.onselect?.();
        } else {
            if (this.selector_title_style.color !== Color.CODE_GREEN.toString()) this.selector_title.setTint(Color.GREY_C);
            else this.selector_title.setTint(Color.GREY_F);
            this.selector_tab.fillStyle(Color.GREY_4).fillRoundedRect(this.index * WIDTH/5, 0, WIDTH/5, HEIGHT/5, WIDTH/100);
        }
    }

    onselect: (() => void) | undefined;
}

class TeamSetting extends Setting {
    constructor(scene: Scene, index: number, tag: TeamTag, style: Types.GameObjects.Text.TextStyle) {
        super(scene, index, tag, style, new TeamPanel(scene, tag, style));
    }
}
class GameSetting extends Setting {
    constructor(scene: Scene, index: number, tag: string, style: Types.GameObjects.Text.TextStyle) {
        super(scene, index, tag, {...style, color: Color.CODE_GREEN.toString()}, new GamePanel(scene, tag, style));
    }
}

export class ReversiLoadingScene extends LoadingScene {
    game_scene: Types.Scenes.SceneType;
    result_scene: Types.Scenes.SceneType;

    constructor(key: string) {
        super(key);
        this.game_scene = ReversiGameScene;
        this.result_scene = ReversiResultScene;
    }

    preload() {
        this.loadScenes();
        this.load.setPath('assets/Games/Reversi/');
        this.load.spritesheet('ReversiAssets', 'Reversi.png', { frameWidth: 32, frameHeight: 32 });
        this.load.tilemapCSV('ReversiCsv', 'Reversi.csv');
        // ReversiGameScene.preload(this);
        // ReversiResultScene.preload(this);
    }

    create() {
        const selector_font = {
            fontSize: 64,
            fontFamily: 'Ramche',
            color: Color.CODE_GREY_F.toString(),
            align: 'center',
        };

        const team1_setting = new TeamSetting(this, 0, TeamTag.Team1, selector_font);
        const team2_setting = new TeamSetting(this, 1, TeamTag.Team2, selector_font);
        const game_setting = new GameSetting(this, 3, '리버시', selector_font);

        team1_setting.onselect = () => {
            team1_setting.setToTop();
            team2_setting.selected = false;
            game_setting.selected = false;
        };
        team2_setting.onselect = () => {
            team2_setting.setToTop();
            team1_setting.selected = false;
            game_setting.selected = false;
        };
        game_setting.onselect = () => {
            game_setting.setToTop();
            team1_setting.selected = false;
            team2_setting.selected = false;
        };
        team1_setting.selected = true;
    }
}
