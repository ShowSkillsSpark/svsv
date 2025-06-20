import { Game, GameObjects, Scene } from "phaser";
import { CommonStoreEvent, CommonStoreEventParam, store } from "../../Store/CommonStore";
import { DiskColor, MemberShip, othello_store, PutType, StartTeam, TeamTag, Timeout } from "../../Store/OthelloStore";
import { OthelloGameScene } from "./OthelloGameScene";

enum OptionType {
    LIST = 'LIST',
    TEXT = 'TEXT',
    PAGE = 'PAGE',
}

interface OptionParam {
    label?: string;
    value?: string;
    on_left_button_click?: () => void;
    on_right_button_click?: () => void;
    height?: number;
}

class OptionContainer extends GameObjects.Container {
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);
    }
}
class ListOptionContainer extends OptionContainer {
    value_text: GameObjects.Text;

    constructor(
        scene: Scene, x: number, y: number, option_width: number,
        {label = 'label', value = 'value', on_left_button_click, on_right_button_click}: OptionParam
    ) {
        super(scene, x, y);

        const option_label_x_offset = option_width * 1 / 10;
        const label_text = this.scene.add.text(option_label_x_offset, 0, label, {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        }).setOrigin(0.5).setPadding(store.style.font_padding);
        this.add(label_text);

        const option_value_x_offset = option_width * 6 / 10;
        this.value_text = this.scene.add.text(option_value_x_offset, 0, value, {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        }).setOrigin(0.5).setPadding(store.style.font_padding);
        this.add(this.value_text);

        const option_left_button_x_offset = option_width * 3 / 10;
        const left_button = this.scene.add.sprite(option_left_button_x_offset, 0, 'Common:button_header')
                .setOrigin(0.5).setScale(store.SCALE).setFlipX(true).setTint(store.style.color.grey_a)
                .setInteractive()
                .on('pointerup', () => {on_left_button_click?.()})
                .on('pointerover', () => {left_button.setTint(store.style.color.grey_4)})
                .on('pointerout', () => {left_button.setTint(store.style.color.grey_a)});
        const option_right_button_x_offset = option_width * 9 / 10;
        const right_button = this.scene.add.sprite(option_right_button_x_offset, 0, 'Common:button_header')
                .setOrigin(0.5).setScale(store.SCALE).setTint(store.style.color.grey_a)
                .setInteractive()
                .on('pointerup', () => {on_right_button_click?.()})
                .on('pointerover', () => {right_button.setTint(store.style.color.grey_4)})
                .on('pointerout', () => {right_button.setTint(store.style.color.grey_a)});
        this.add([left_button, right_button]);
    }

    setValueText(text: string) {
        this.value_text.setText(text);
    }
}
class TextOptionContainer extends OptionContainer {
    value_text: GameObjects.Text;

    constructor(
        scene: Scene, x: number, y: number, option_width: number,
        {label = 'label', value = 'value'}: OptionParam
    ) {
        super(scene, x, y);

        const option_label_x_offset = option_width * 1 / 10;
        const label_text = this.scene.add.text(option_label_x_offset, 0, label, {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        }).setOrigin(0.5).setPadding(store.style.font_padding);
        this.add(label_text);

        const option_value_x_offset = option_width * 6 / 10;
        this.value_text = this.scene.add.text(option_value_x_offset, 0, value, {
            ...store.style.font_style,
            color: store.style.color_code.grey_0,
        }).setOrigin(0.5).setPadding(store.style.font_padding);
        this.add(this.value_text);

        const text_button = this.scene.add.graphics();
    }
}
class PageOptionContainer extends OptionContainer {
    page_index = 1;
    page_count = 1;

    users: string[] = [];
    users_flag: Set<string> = new Set();

    nickname_text: GameObjects.Text[] = [];
    page_text: GameObjects.Text;
    left_button: GameObjects.Sprite;
    right_button: GameObjects.Sprite;

    constructor(
        scene: Scene, x: number, y: number, option_width: number, option_height: number,
        { height }: OptionParam
    ) {
        super(scene, x, y);

        const line_width = option_width/100;
        const edge = scene.add.graphics()
                .lineStyle(line_width, 0x888888)
                .strokeRect(-line_width, -line_width, option_width + 2*line_width, option_height + 2*line_width);
        this.add(edge);

        const page_y_offset = option_height;
        this.page_text = scene.add.text(option_width/2, page_y_offset, ` ${this.page_index} / ${this.page_count} `, {
            ...store.style.font_style,
            backgroundColor: store.style.color_code.grey_0,
        }).setOrigin(0.5, 0);
        this.add(this.page_text);

        this.left_button = scene.add.sprite(option_width*2/6, page_y_offset, 'Common:button_header').setTint(store.style.color.grey_a)
                .setOrigin(0.5, 0.25).setScale(store.SCALE).setFlipX(true)
        this.left_button.setInteractive()
                .on('pointerover', () => {this.left_button.setTint(store.style.color.grey_4)})
                .on('pointerout', () => {this.left_button.setTint(store.style.color.grey_a)});
        this.right_button = scene.add.sprite(option_width*4/6, page_y_offset, 'Common:button_header').setTint(store.style.color.grey_a)
                .setOrigin(0.5, 0.25).setScale(store.SCALE);
        this.right_button.setInteractive()
                .on('pointerover', () => {this.right_button.setTint(store.style.color.grey_4)})
                .on('pointerout', () => {this.right_button.setTint(store.style.color.grey_a)});
        this.add([this.left_button, this.right_button]);
    }

    addUser(channel_id: string) {
        if (channel_id in this.users_flag) return;
        this.users.push(channel_id);
        this.page_count = 1 + this.users.length / 3;
        this.page_text.setText(` ${this.page_index} / ${this.page_count} `);
    }
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

        const tag_zone = scene.add.zone(this.tag_x_offset, this.tag_y_offset, this.tag_width, this.tag_height).setOrigin(0)
                .setInteractive().on('pointerup', () => {
                    this.select = true;
                });
        this.add(tag_zone);

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
                .fillRoundedRect(this.panel_x_offset, this.panel_y_offset, this.panel_width, this.panel_height, this.round)
        this.add(this.panel_background);
        const background_zone = scene.add.zone(this.panel_x_offset, this.panel_y_offset, this.panel_width, this.panel_height)
                .setOrigin(0).setInteractive();
        this.add(background_zone)

        this.select = false;
    }

    getOptionPosition(height = 1) {
        const option_x_offset = this.panel_x_offset + this.panel_width/20;
        const option_y_offset = this.panel_y_offset + this.panel_height/10 + this.option_count * (store.style.font_style.fontSize as number) * 2;
        const option_width = store.WIDTH - 2 * option_x_offset;
        const option_height = height * (store.style.font_style.fontSize as number) * 2;
        return { option_x_offset, option_y_offset, option_width, option_height };
    }
    addTextOption({label, value}: OptionParam) {
        const { option_x_offset, option_y_offset, option_width } = this.getOptionPosition();
        this.option_count += 1;
        const text_option = new TextOptionContainer(this.scene, option_x_offset, option_y_offset, option_width, {
            label, value
        });
        this.add(text_option);
        return text_option;
    }
    addListOption({label, value, on_left_button_click, on_right_button_click}: OptionParam) {
        const { option_x_offset, option_y_offset, option_width } = this.getOptionPosition();
        this.option_count += 1;
        const list_option = new ListOptionContainer(this.scene, option_x_offset, option_y_offset, option_width, {
            label, value, on_left_button_click, on_right_button_click
        });
        this.add(list_option);
        return list_option;
    }
    addPageOption({height = 1}: OptionParam) {
        const { option_x_offset, option_y_offset, option_width, option_height } = this.getOptionPosition(height);
        this.option_count += height;
        const page_param = new PageOptionContainer(this.scene, option_x_offset, option_y_offset, option_width, option_height, {
            height
        });
        this.add(page_param);
        return page_param
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
            this.onunselect();
        }
    }
    onselect = () => {};
    onunselect = () => {};
}

class TeamSettingPanel extends SettingPanel {
    constructor(scene: Scene, team_tag: TeamTag, index: number, tag_title: string) {
        super(scene, tag_title, index);

        const name_value_text = this.addTextOption({label: '팀명', value: othello_store.teams[team_tag].name});

        const timeout_value_text = this.addListOption({
            label: '제한시간',
            value: othello_store.teams[team_tag].timeout,
            on_left_button_click: () => othello_store.nextTeamTimeout(team_tag, -1),
            on_right_button_click: () => othello_store.nextTeamTimeout(team_tag, +1),
        });

        const disk_color_value_text = this.addListOption({
            label: '색깔',
            value: othello_store.teams[team_tag].disk_color,
            on_left_button_click: () => othello_store.nextTeamDisk(team_tag, -1),
            on_right_button_click: () => othello_store.nextTeamDisk(team_tag, +1),
        });

        const put_value_text = this.addListOption({
            label: '놓는방식',
            value: othello_store.teams[team_tag].put,
            on_left_button_click: () => othello_store.nextTeamPut(team_tag, -1),
            on_right_button_click: () => othello_store.nextTeamPut(team_tag, +1),
        });

        othello_store.on('teams:timeout', (tt: TeamTag, timeout: Timeout) => {
            if (team_tag === tt) timeout_value_text.setValueText(timeout);
        });
        othello_store.on('teams:disk', (tt: TeamTag, disk_color: DiskColor) => {
            if (team_tag === tt) disk_color_value_text.setValueText(disk_color);
        });
        othello_store.on('teams:put', (tt: TeamTag, put: PutType) => {
            if (team_tag === tt) put_value_text.setValueText(put);
        });
    }
}
class MemberSettingPanel extends SettingPanel {
    constructor(scene: Scene, index: number) {
        super(scene, '팀원', index);

        const default_membership_value_text = this.addListOption({
            label: '기본값',
            value: othello_store.default_membership,
            on_left_button_click: () => othello_store.nextDefaultMembership(-1),
            on_right_button_click: () => othello_store.nextDefaultMembership(+1),
        });

        const page = this.addPageOption({
            height: 4,
        });

        othello_store.on('default_membership', (membership: MemberShip) => {
            default_membership_value_text.setValueText(membership);
        });

        const apply = ({channel_id, nickname, message}: CommonStoreEventParam) => {
            othello_store.setMemberShip(channel_id);
            if (message.startsWith('!지원')) {
                console.log(channel_id, nickname, message);
                page.addUser(channel_id);
            }
        };
        store.on(CommonStoreEvent.CHAT, apply);
        scene.events.on('shutdown', () => {
            store.off(CommonStoreEvent.CHAT, apply);
        });
    }
}
class GameSettingPanel extends SettingPanel {
    constructor(scene: Scene, index: number, start_game: () => void) {
        super(scene, '리버시', index);
        this.tag_text.setColor(store.style.color_code.green_f);
        const start_team_value_text = this.addListOption({
            label: '누구부터',
            value: othello_store.start_team,
            on_left_button_click: () => othello_store.nextStartTeam(-1),
            on_right_button_click: () => othello_store.nextStartTeam(+1),
        });

        const start_button = this.scene.add.text(this.panel_x_offset + this.panel_width/2, this.panel_y_offset + this.panel_height/2, '드가자!', {
            ...store.style.font_style,
            fontSize: store.style.font_style.fontSize as number * 2,
            color: store.style.color_code.green_a,
        }).setOrigin(0.5).setInteractive().on('pointerup', () => {
            start_game();
        }).on('pointerover', () => {
            start_button.setColor(store.style.color_code.grey_4);
        }).on('pointerout', () => {
            start_button.setColor(store.style.color_code.green_a);
        });
        this.add(start_button);

        othello_store.on('start_team', (start_team: StartTeam) => {
            start_team_value_text.setValueText(start_team);
        });
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
        const game_panel = new GameSettingPanel(this, 4, this.startGameScene);

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

        // if (store.DEBUG) member_panel.select = true;
        // if (store.DEBUG) this.scene.start('SelectGameScene');
        // if (store.DEBUG) this.startGameScene();
    }

    startGameScene = () => {
        othello_store.game_board.init(othello_store.teams[TeamTag.TEAM1].disk_color, othello_store.teams[TeamTag.TEAM2].disk_color);
        this.scene.start(OthelloGameScene.key);
    }
}
