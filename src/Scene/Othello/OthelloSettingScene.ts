import { GameObjects, Scene } from "phaser";
import { store } from "../../Store/CommonStore";
import { DiskColor, MemberShip, othello_store, PutType, StartTeam, TeamTag, Timeout } from "../../Store/OthelloStore";
import { OthelloGameScene } from "./OthelloGameScene";

enum ButtonType {
    LIST = 'LIST',
    TEXT = 'TEXT',
}

interface OptionParam {
    label: string;
    value: string;
    button_type?: ButtonType;
    on_left_button_click?: () => void;
    on_right_button_click?: () => void;
}

class SettingPanel extends GameObjects.Container {
    tag_background: GameObjects.Graphics;
    tag_text: GameObjects.Text;
    panel_background: GameObjects.Graphics;

    tag_x_offset: number;
    tag_y_offset: number;
    tag_width: number;
    tag_height: number;
    round: number;

    tag_text_x_offset: number;
    tag_text_y_offset: number;

    panel_x_offset: number;
    panel_y_offset: number;
    panel_width: number;
    panel_height: number;

    option_count = 0;

    constructor(scene: Scene, tag_name: string, index: number) {
        super(scene);
        this.scene.add.existing(this);

        const setting_x_offset = store.WIDTH/20;
        const setting_y_offset = store.HEIGHT/20;
        this.round = store.WIDTH/100;

        this.tag_width = store.WIDTH*9/10/5;
        this.tag_height = (store.style.font_style.fontSize as number) * 2;
        this.tag_x_offset = setting_x_offset + index * this.tag_width;
        this.tag_y_offset = setting_y_offset;
        this.tag_background = scene.add.graphics();
        this.add(this.tag_background);

        const zone = scene.add.zone(this.tag_x_offset, this.tag_y_offset, this.tag_width, this.tag_height).setOrigin(0);
        zone.setInteractive().on('pointerup', () => {
            this.select = true;
        });

        this.tag_text_x_offset = setting_x_offset + this.tag_width/2 + index * this.tag_width;
        this.tag_text_y_offset = this.tag_y_offset + this.tag_height/2;
        this.tag_text = scene.add.text(this.tag_text_x_offset, this.tag_text_y_offset, tag_name, store.style.font_style).setOrigin(0.5).setPadding(store.style.font_padding);
        this.add(this.tag_text);

        this.panel_x_offset = setting_x_offset;
        this.panel_y_offset = this.tag_y_offset + this.tag_height;
        this.panel_width = store.WIDTH*9/10;
        this.panel_height = store.HEIGHT*9/10 - this.panel_y_offset + setting_y_offset;
        this.panel_background = scene.add.graphics()
                .fillStyle(store.style.color.grey_e)
                .fillRoundedRect(this.panel_x_offset, this.panel_y_offset, this.panel_width, this.panel_height, this.round);
        this.add(this.panel_background);

        this.select = false;
    }

    addOption({label, value, button_type, on_left_button_click, on_right_button_click}: OptionParam) {
        const option_x_offset = this.panel_x_offset + this.panel_width/20;
        const option_y_offset = this.panel_y_offset + this.panel_height/10;

        const option_width = store.WIDTH - 2 * option_x_offset;

        const option_label_x_offset = option_x_offset + option_width * 1 / 10;
        const option_label_y_offset = option_y_offset + this.option_count * (store.style.font_style.fontSize as number) * 2;
        const label_text = this.scene.add.text(option_label_x_offset, option_label_y_offset, label, {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        }).setOrigin(0.5).setPadding(store.style.font_padding);

        const option_value_x_offset = option_x_offset + option_width * 6 / 10;
        const option_value_y_offset = option_y_offset + this.option_count * (store.style.font_style.fontSize as number) * 2;
        const value_text = this.scene.add.text(option_value_x_offset, option_value_y_offset, value, {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        }).setOrigin(0.5).setPadding(store.style.font_padding);
        this.add([label_text, value_text]);

        if (button_type === ButtonType.LIST) {
            const option_button_y_offset = option_y_offset + this.option_count * (store.style.font_style.fontSize as number) * 2;

            const option_left_button_x_offset = option_x_offset + option_width * 3 / 10;
            const left_button = this.scene.add.sprite(option_left_button_x_offset, option_button_y_offset, 'Common:button_header')
                    .setOrigin(0.5).setScale(store.SCALE).setFlipX(true).setTint(store.style.color.grey_a)
                    .setInteractive()
                    .on('pointerup', () => {on_left_button_click?.()})
                    .on('pointerover', () => {left_button.setTint(store.style.color.grey_4)})
                    .on('pointerout', () => {left_button.setTint(store.style.color.grey_a)});
            const option_right_button_x_offset = option_x_offset + option_width * 9 / 10;
            const right_button = this.scene.add.sprite(option_right_button_x_offset, option_button_y_offset, 'Common:button_header')
                    .setOrigin(0.5).setScale(store.SCALE).setTint(store.style.color.grey_a)
                    .setInteractive()
                    .on('pointerup', () => {on_right_button_click?.()})
                    .on('pointerover', () => {right_button.setTint(store.style.color.grey_4)})
                    .on('pointerout', () => {right_button.setTint(store.style.color.grey_a)});
            this.add([left_button, right_button]);
        } else if (button_type === ButtonType.TEXT) {
            const text_button = this.scene.add.graphics();
            this.add(text_button)
        }
        this.option_count += 1;

        return value_text;
    }

    set select(value: boolean) {
        if (value) {
            this.tag_background
                .fillStyle(store.style.color.grey_e)
                .fillRoundedRect(this.tag_x_offset, this.tag_y_offset, this.tag_width, this.tag_height*2, this.round);
            this.tag_text.setTint(store.style.color.grey_0);
            this.setToTop();
            this.onselect();
        } else {
            this.tag_background
                .fillStyle(store.style.color.grey_6)
                .fillRoundedRect(this.tag_x_offset, this.tag_y_offset, this.tag_width, this.tag_height*2, this.round);
            this.tag_text.setTint(store.style.color.grey_f);
        }
    }
    onselect = () => {};
}

class TeamSettingPanel extends SettingPanel {
    constructor(scene: Scene, team_tag: TeamTag, index: number, tag_title: string) {
        super(scene, tag_title, index);

        const name_value_text = this.addOption({label: '팀명', value: othello_store.teams[team_tag].name});
        const timeout_value_text = this.addOption({
            label: '제한시간',
            value: othello_store.teams[team_tag].timeout,
            button_type: ButtonType.LIST,
            on_left_button_click: () => othello_store.nextTeamTimeout(team_tag, -1),
            on_right_button_click: () => othello_store.nextTeamTimeout(team_tag, +1),
        });
        const disk_color_value_text = this.addOption({
            label: '색깔',
            value: othello_store.teams[team_tag].disk_color,
            button_type: ButtonType.LIST,
            on_left_button_click: () => othello_store.nextTeamDisk(team_tag, -1),
            on_right_button_click: () => othello_store.nextTeamDisk(team_tag, +1),
        });
        const put_value_text = this.addOption({
            label: '놓는방식',
            value: othello_store.teams[team_tag].put,
            button_type: ButtonType.LIST,
            on_left_button_click: () => othello_store.nextTeamPut(team_tag, -1),
            on_right_button_click: () => othello_store.nextTeamPut(team_tag, +1),
        });

        othello_store.on(`OthelloStore:teams:${team_tag}:timeout`, (timeout: Timeout) => {
            timeout_value_text.setText(timeout);
        });
        othello_store.on(`OthelloStore:teams:${team_tag}:disk`, (disk_color: DiskColor) => {
            disk_color_value_text.setText(disk_color);
        });
        othello_store.on(`OthelloStore:teams:${team_tag}:put`, (put: PutType) => {
            put_value_text.setText(put);
        });
    }
}
class MemberSettingPanel extends SettingPanel {
    constructor(scene: Scene, index: number) {
        super(scene, '팀원', index);
        const default_membership_value_text = this.addOption({
            label: '기본값',
            value: othello_store.default_membership,
            button_type: ButtonType.LIST,
            on_left_button_click: () => othello_store.nextDefaultMembership(-1),
            on_right_button_click: () => othello_store.nextDefaultMembership(+1),
        });

        othello_store.on('OthelloStore:default_membership', (membership: MemberShip) => {
            default_membership_value_text.setText(membership);
        });
    }
}
class GameSettingPanel extends SettingPanel {
    constructor(scene: Scene, index: number) {
        super(scene, '리버시', index);
        this.tag_text.setColor(store.style.color_code.green_f);
        const start_team_value_text = this.addOption({
            label: '누구부터',
            value: othello_store.start_team,
            button_type: ButtonType.LIST,
            on_left_button_click: () => othello_store.nextStartTeam(-1),
            on_right_button_click: () => othello_store.nextStartTeam(+1),
        });

        othello_store.on('OthelloStore:start_team', (start_team: StartTeam) => {
            start_team_value_text.setText(start_team);
        });

        const start_button = this.scene.add.text(this.panel_x_offset + this.panel_width/2, this.panel_y_offset + this.panel_height/2, '드가자!', {
            ...store.style.font_style,
            fontSize: store.style.font_style.fontSize as number * 2,
            color: store.style.color_code.green_a,
        }).setOrigin(0.5).setInteractive().on('pointerup', () => {
            this.scene.scene.start(OthelloGameScene.key);
        }).on('pointerover', () => {
            start_button.setColor(store.style.color_code.grey_4);
        }).on('pointerout', () => {
            start_button.setColor(store.style.color_code.green_a);
        });
        this.add(start_button);
    }
}

export class OthelloSettingScene extends Scene {
    static readonly key = 'OthelloSettingScene';
    constructor() {
        super(OthelloSettingScene.key);
    }

    create() {
        const team1_panel = new TeamSettingPanel(this, TeamTag.TEAM1, 0, MemberShip.TEAM1);
        const team2_panel = new TeamSettingPanel(this, TeamTag.TEAM2, 1, MemberShip.TEAM2);
        const member_panel = new MemberSettingPanel(this, 2.5);
        const game_panel = new GameSettingPanel(this, 4);

        team1_panel.onselect = () => {
            team2_panel.select = false;
            member_panel.select = false;
            game_panel.select = false;
        }
        team2_panel.onselect = () => {
            team1_panel.select = false;
            member_panel.select = false;
            game_panel.select = false;
        }
        member_panel.onselect = () => {
            team1_panel.select = false;
            team2_panel.select = false;
            game_panel.select = false;
        }
        game_panel.onselect = () => {
            team1_panel.select = false;
            team2_panel.select = false;
            member_panel.select = false;
        }

        team1_panel.select = true;
        othello_store.game_board.init();
        // if (store.DEBUG) this.scene.start(OthelloGameScene.key);
    }
}
