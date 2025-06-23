import { GameObjects, Scene, Time } from "phaser";
import { DiskColor, OthelloGameEvent, GameBoardTile, othello_store, PutType, TeamTag, StartTeam, MemberShip, Disk } from "../../Store/OthelloStore";
import { CommonStoreEvent, CommonStoreEventParam, store } from "../../Store/CommonStore";
import { OthelloSettingScene } from "./OthelloSettingScene";

const coord_to_position = (x: number, y: number) => {
    return [`${String.fromCharCode(x + 'A'.charCodeAt(0) - 1)}`, `${y}`];
}
const position_to_coord = (position: string) => {
    let x = -1, y = -1;
    if (/^[a-z]\d+.*/.test(position)) {
        x = position[0].charCodeAt(0) - 'a'.charCodeAt(0) + 1; // a = 1
        y = parseInt(position.slice(1));
    } else if (/^[A-Z]\d+.*/.test(position)) {
        x = position[0].charCodeAt(0) - 'A'.charCodeAt(0) + 1; // A = 1
        y = parseInt(position.slice(1));
    }
    return [x, y];
}
const membership_to_team = (member_ship: MemberShip) => {
    switch (member_ship) {
        case MemberShip.TEAM1:
            return TeamTag.TEAM1;
        case MemberShip.TEAM2:
            return TeamTag.TEAM2;
        case MemberShip.DEFAULT:
        case MemberShip.NONE:
            return undefined;
    }
}

class TeamPanel extends GameObjects.Container {
    team_tag: TeamTag;

    disk_set: Set<Disk> = new Set();

    timer_text: GameObjects.Text;
    timer_event: Time.TimerEvent;
    pass_text: GameObjects.Text;

    chat_nickname_list: GameObjects.Text[] = [];
    chat_position_list: GameObjects.Text[] = [];
    chat_nickname_width: number;
    chat_font_size: number;

    cover: GameObjects.Rectangle;

    chat_flag: Set<string> = new Set();

    vote: { [position: string]: number } = {};

    constructor(scene: Scene, x: number, y: number, width: number, height: number, team_tag: TeamTag) {
        super(scene, x, y);
        scene.add.existing(this);
        this.team_tag = team_tag;

        const stroke_size = width/50;
        const font_size = store.style.font_style.fontSize as number

        // 테두리
        const stroke = scene.add.graphics()
                .lineStyle(stroke_size, store.style.color.grey_f)
                .strokeRect(0, 0, width, height);
        this.add(stroke);

        // 팀 이름
        const team_name_y_offset = font_size;
        const team_name_text = scene.add.text(width/2, team_name_y_offset, othello_store.teams[team_tag].name, {
            ...store.style.font_style,
        }).setOrigin(0.5);
        this.add(team_name_text);

        // 디스크, 디스트 개수
        const disk_y_offset = team_name_y_offset + font_size*2;
        const team_disk_color = othello_store.teams[team_tag].disk_color
        const sprite_id = (team_disk_color === DiskColor.WHITE) ? 0 : 6;
        const team_disk = scene.add.sprite(width*1/4, disk_y_offset, 'Othello:assets', sprite_id).setScale(store.SCALE).setOrigin(0.5);
        const disk_count = othello_store.game_board.counter[team_tag];
        const count_text = scene.add.text(width*2/3, disk_y_offset, disk_count.toString(), {
            ...store.style.font_style,
            fontSize: font_size*(0.8+1.2*disk_count/64),
        }).setOrigin(0.5);
        this.add([team_disk, count_text]);

        // 타이머
        const timer_y_offset = disk_y_offset + font_size*2;
        const timer_label = scene.add.text(width*2/5, timer_y_offset, '남은 시간', {
            ...store.style.font_style,
            fontSize: font_size*2/3,
        }).setOrigin(0.5);
        const remain_time = (othello_store.teams[team_tag].timeout < 0) ? '무제한': `${othello_store.teams[team_tag].timeout} 초`;
        this.timer_text = scene.add.text(width*2/5, timer_y_offset + font_size, remain_time, {
            ...store.style.font_style,
            color: store.style.color_code.green_f,
        }).setOrigin(0.5);
        this.pass_text = scene.add.text(width*3/4, timer_y_offset, '턴\n종\n료', {
            ...store.style.font_style,
            fontSize: font_size*2/3,
            color: store.style.color_code.pink_a,
        }).setOrigin(0, 0.2).setInteractive().on('pointerup', () => {
            this.timer_event.repeatCount = 0;
            this.scene.sound.play('Common:sound:select', { volume: store.volume_effect });
        }).on('pointerover', () => {
            this.pass_text.setColor(store.style.color_code.pink_f);
        }).on('pointerout', () => {
            this.pass_text.setColor(store.style.color_code.pink_a);
        });
        this.add([timer_label, this.timer_text, this.pass_text]);

        this.timer_event = scene.time.addEvent({});
        scene.events.on('shutdown', () => {
            scene.time.removeEvent(this.timer_event);
        });

        // 채팅
        const chat_x_offset = font_size/4;
        const chat_y_offset = timer_y_offset + font_size*2;
        const chat_width = width - 2*chat_x_offset;
        const chat_height = height - chat_y_offset - chat_x_offset;
        const chat_stroke_size = stroke_size/2;
        const chat_stroke = scene.add.graphics()
                .lineStyle(chat_stroke_size, store.style.color.grey_f)
                .strokeRect(chat_x_offset, chat_y_offset, chat_width, chat_height);
        this.add([chat_stroke]);

        const chat_text_x_offset = chat_x_offset + font_size/8;
        const chat_count = 11;
        this.chat_font_size = font_size/2;
        this.chat_nickname_width = chat_width - this.chat_font_size*2.5;
        for (let i = 0; i < chat_count; i++) {
            const chat_nickname = scene.add.text(chat_text_x_offset, chat_y_offset + this.chat_font_size*i*1.1, 'nickname', {
                ...store.style.font_style,
                fontSize: this.chat_font_size,
            }).setCrop(0, 0, this.chat_nickname_width, this.chat_font_size);
            const chat_position = scene.add.text(chat_text_x_offset + this.chat_nickname_width + this.chat_font_size*2/3, chat_y_offset + this.chat_font_size*i*1.1, 'A1', {
                ...store.style.font_style,
                fontSize: this.chat_font_size,
            });
            this.chat_nickname_list.push(chat_nickname);
            this.chat_position_list.push(chat_position);
        }
        this.add([...this.chat_nickname_list, ...this.chat_position_list]);

        // cover
        this.cover = scene.add.rectangle(-chat_stroke_size, -chat_stroke_size, width+2*chat_stroke_size, height+2*chat_stroke_size, store.style.color.grey_0, 0.5).setOrigin(0);
        this.add(this.cover);

        const on_set = () => {
            const disk_count = othello_store.game_board.counter[team_tag];
            count_text.setText(disk_count.toString()).setFontSize(font_size*(0.8+1.2*disk_count/64));
        };
        othello_store.on(OthelloGameEvent.SET, on_set);
        scene.events.on('shutdown', () => {
            othello_store.off(OthelloGameEvent.SET, on_set);
        });

        this.clearChat();
    }

    onstartturn(disk_set: Set<Disk>, on_end_timer: (team_tag: TeamTag, disk_set: Set<Disk>, vote: { [position: string]: number }) => void) {
        this.cover.visible = false;
        this.disk_set = disk_set;
        this.scene.time.removeEvent(this.timer_event);
        this.vote = {};
        this.timer_event = this.scene.time.addEvent({
            delay: (store.DEBUG) ? 1000 : 1000,
            repeat: othello_store.teams[this.team_tag].timeout,
            callback: () => {
                this.timer_text.setText((othello_store.teams[this.team_tag].timeout < 0) ? '무제한' : `${this.timer_event.repeatCount - 1} 초`);
                if (this.timer_event.repeatCount > 6) this.timer_text.setColor(store.style.color_code.green_f).setScale(1);
                else this.timer_text.setColor(store.style.color_code.pink_f).setScale(1.3);
                if (this.timer_event.repeatCount === 0) {
                    // reset timer text
                    const remain_time = (othello_store.teams[this.team_tag].timeout < 0) ? '무제한' : `${othello_store.teams[this.team_tag].timeout} 초`;
                    this.timer_text.setText(remain_time).setColor(store.style.color_code.green_f).setScale(1);
                    // put disk
                    on_end_timer(this.team_tag, this.disk_set, this.vote);
                }
            }
        });
        this.clearChat();
    }
    onendturn() {
        this.timer_event.paused = true;
        this.cover.visible = true;
    }
    clearChat() {
        this.chat_nickname_list.forEach(text => text.setText('').setVisible(false));
        this.chat_position_list.forEach(text => text.setText('').setVisible(false));
        this.chat_flag = new Set();
    }
    addChat(channel_id: string, nickname: string, x: number, y: number, vote_text: GameObjects.Text) {
        if (this.chat_flag.has(channel_id)) return;
        this.chat_flag.add(channel_id);
        const [pos_x, pos_y] = coord_to_position(x, y);
        const position = pos_x + pos_y;
        if (!this.vote[position]) this.vote[position] = 1;
        else this.vote[position] += 1;
        vote_text.setText(`${this.vote[position]}`).setVisible(true);
        this.chat_nickname_list.forEach((text, i) => {
            if (i === this.chat_nickname_list.length - 1) text.setText(nickname).setCrop(0, 0, this.chat_nickname_width, this.chat_font_size).setVisible(true);
            else text.setText(this.chat_nickname_list[i+1].text).setCrop(0, 0, this.chat_nickname_width, this.chat_font_size).setVisible(true);
        });
        this.chat_position_list.forEach((text, i) => {
            if (i === this.chat_position_list.length - 1) text.setText(position).setVisible(true);
            else text.setText(this.chat_position_list[i+1].text).setVisible(true);
        });
    }
    endGame() {
        this.timer_event.paused = true;
    }
}

export class OthelloGameScene extends Scene {
    static readonly key = 'OthelloGameScene';
    static preload(scene: Scene) {
        scene.anims.create({
            key: `${DiskColor.WHITE}-${DiskColor.BLACK}`,
            frames: scene.anims.generateFrameNumbers('Othello:assets', { start: 0, end: 6 }),
        });
        scene.anims.create({
            key: `${DiskColor.BLACK}-${DiskColor.WHITE}`,
            frames: scene.anims.generateFrameNumbers('Othello:assets', { start: 6, end: 12 }),
        });
    }

    tiles: GameObjects.Sprite[][] = [];
    disks: GameObjects.Sprite[][] = [];
    votes: GameObjects.Text[][] = [];

    team_panels: { [team_tag in TeamTag]: TeamPanel } = {} as { [team_tag in TeamTag]: TeamPanel };

    curr_turn: TeamTag = TeamTag.TEAM1;
    prev_pass = false;

    back_text!: GameObjects.Text;
    is_end = false;

    constructor() {
        super(OthelloGameScene.key);
    }

    create() {
        const scale_x = store.WIDTH / (othello_store.game_board.width + 2);
        const scale_y = store.HEIGHT / (othello_store.game_board.height + 2);
        const scale = Math.min(scale_x, scale_y) / 32;

        // 타이틀
        const title_y_offset = store.HEIGHT/20;
        this.add.text(store.WIDTH/2, title_y_offset, '스트리머 vs 시청자', {
            ...store.style.font_style,
            color: store.style.color_code.green_f,
        }).setOrigin(0.5, 0);

        // 뒤로 버튼
        const back_button_x_offset = 0;
        const back_button_y_offset = store.HEIGHT/20;
        this.back_text = this.add.text(back_button_x_offset, back_button_y_offset, '종\n료', {
            ...store.style.font_style,
            color: store.style.color_code.pink_a,
        }).setOrigin(0.5, 0)
        .setInteractive().on('pointerup', () => {
            this.sound.play('Common:sound:exit', { volume: store.volume_effect });
            this.scene.start(OthelloSettingScene.key);
        }).on('pointerover', () => {
            this.back_text.setColor(store.style.color_code.pink_f);
            this.back_text.setOrigin(0, 0);
        }).on('pointerout', () => {
            if (!this.is_end) {
                this.back_text.setColor(store.style.color_code.pink_a);
                this.back_text.setOrigin(0.5, 0);
            }
        });

        // 게임판
        const tile_width = 32 * scale;
        const tile_height = 32 * scale;
        const tile_x_offset = (store.WIDTH - tile_width * (othello_store.game_board.width + 2)) / 2;
        const tile_y_offset = tile_height / 2 +(store.style.font_style.fontSize as number) - 32 * scale / 2;

        const tint_out = store.style.color.green_a;
        const tint_over = store.style.color.green_f;
        for (let x = 0; x < othello_store.game_board.width + 2; x++) {
            this.tiles[x] = [];
            this.disks[x] = [];
            this.votes[x] = [];
            for (let y = 0; y < othello_store.game_board.height + 2; y++) {
                const pixel_x = tile_x_offset + x * tile_width;
                const pixel_y = tile_y_offset + y * tile_height;

                const tile = othello_store.game_board.tiles[x][y];
                switch (tile) {
                    case GameBoardTile.EMPTY:
                        this.tiles[x][y] = this.add.sprite(pixel_x, pixel_y, 'Othello:assets', 16)
                                .setOrigin(0).setScale(scale).setTint(tint_out).setToBack();
                        const tile_corsur = this.add.graphics()
                                .lineStyle(2 * scale, tint_over)
                                .strokeRoundedRect(pixel_x, pixel_y, tile_width, tile_height, 2 * scale);
                        tile_corsur.visible = false;
                        this.tiles[x][y].setInteractive().on('pointerup', () => {
                            if (othello_store.teams[this.curr_turn].put === PutType.CLICK) {
                            // if (othello_store.teams[this.curr_turn].put === PutType.CLICK || store.DEBUG) {
                                othello_store.game_board.putDisk(x, y, this.curr_turn, othello_store.teams[this.curr_turn].disk_color);
                            }
                        }).on('pointerover', () => {
                            tile_corsur.visible = true;
                        }).on('pointerout', () => {
                            tile_corsur.visible = false;
                        });
                        break;
                    case GameBoardTile.WALL:
                        let sprite_id;
                        if (x == 0) {
                            if (y == 0) sprite_id = 21;
                            else if (y == othello_store.game_board.height + 1) sprite_id = 23;
                            else sprite_id = 17;
                        } else if (x == othello_store.game_board.width + 1) {
                            if (y == 0) sprite_id = 22;
                            else if (y == othello_store.game_board.height + 1) sprite_id = 24;
                            else sprite_id = 18;
                        } else {
                            if (y == 0) sprite_id = 19;
                            else if (y == othello_store.game_board.height + 1) sprite_id = 20;
                            else break;
                        }
                        this.tiles[x][y] = this.add.sprite(pixel_x, pixel_y, 'Othello:assets', sprite_id)
                                .setOrigin(0).setScale(scale).setTint(tint_out).setToBack();
                        break;
                }

                const disk = othello_store.game_board.disks[x][y];
                let sprite_id = 13;
                switch (disk.disk_color) {
                    case DiskColor.WHITE:
                        sprite_id = 0;
                        break;
                    case DiskColor.BLACK:
                        sprite_id = 6;
                        break;
                    case DiskColor.NONE:
                        sprite_id = 13;
                        break;
                }
                this.disks[x][y] = this.add.sprite(pixel_x, pixel_y, 'Othello:assets', sprite_id).setOrigin(0).setScale(scale);

                this.votes[x][y] = this.add.text(pixel_x + tile_width/2, pixel_y + tile_height/2, '0', {
                    ...store.style.font_style,
                    fontSize: (store.style.font_style.fontSize as number)*2/3,
                    backgroundColor: store.style.color_code.green_a,
                }).setOrigin(0.5).setVisible(false);

                const coord_font_style = {
                    ...store.style.font_style,
                    fontSize: (store.style.font_style.fontSize as number)*2/3,
                    color: store.style.color_code.green_a,
                };
                const [pos_x, pos_y] = coord_to_position(x, y);
                if (x === 0 && y > 0 && y < othello_store.game_board.height + 1) {
                    this.add.text(pixel_x + tile_width*3/4, pixel_y + tile_height/2, pos_y, coord_font_style).setOrigin(0.5);
                }
                if (y === 0 && x > 0 && x < othello_store.game_board.width + 1) {
                    this.add.text(pixel_x + tile_width/2, pixel_y + tile_height*3/4, pos_x, coord_font_style).setOrigin(0.5);
                }
                if (x === othello_store.game_board.width + 1 && y > 0 && y < othello_store.game_board.height + 1) {
                    this.add.text(pixel_x + tile_width*1/4, pixel_y + tile_height/2, pos_y, coord_font_style).setOrigin(0.5);
                }
                if (y === othello_store.game_board.height + 1 && x > 0 && x < othello_store.game_board.width + 1) {
                    this.add.text(pixel_x + tile_width/2, pixel_y + tile_height*1/4, pos_x, coord_font_style).setOrigin(0.5);
                }
            }
        }

        // 팀 패널
        const team_panel_x_offset = tile_width / 2;
        const team_panel_y_offset = tile_y_offset + tile_height;
        const team_panel_width = (store.WIDTH - tile_width * (othello_store.game_board.width + 3)) / 2;
        const team_panel_height = store.HEIGHT - (team_panel_y_offset + tile_height/2);
        this.team_panels[TeamTag.TEAM1] = new TeamPanel(this, team_panel_x_offset, team_panel_y_offset, team_panel_width, team_panel_height, TeamTag.TEAM1);
        this.team_panels[TeamTag.TEAM2] = new TeamPanel(this, store.WIDTH - team_panel_width - team_panel_x_offset, team_panel_y_offset, team_panel_width, team_panel_height, TeamTag.TEAM2);

        const on_set = (x: integer, y: integer, prev_disk_color: DiskColor, disk_color: DiskColor) => {
            if (prev_disk_color === DiskColor.NONE || prev_disk_color === disk_color) {
                const sprite_id = (disk_color === DiskColor.WHITE) ? 0 : 6;
                this.disks[x][y].setFrame(sprite_id).setTint(store.style.color.grey_f);
            } else {
                this.disks[x][y].anims.play(`${prev_disk_color}-${disk_color}`);
            }
        };
        const on_put = (x: number, y: number) => {
            if (
                (this.curr_turn === TeamTag.TEAM1 &&  othello_store.members[store.proxy.channel_id] === MemberShip.TEAM1) ||
                (this.curr_turn === TeamTag.TEAM2 &&  othello_store.members[store.proxy.channel_id] === MemberShip.TEAM2)
            ) {
                const [pos_x, pos_y] = coord_to_position(x, y);
                store.proxy.message = pos_x + pos_y;
            }
            this.sound.play('Common:sound:open_menu', { volume: store.volume_effect });
            this.nextTurn();
        };
        const on_put_fail = () => {
            this.sound.play('Common:sound:close_menu', { volume: store.volume_effect });
        }
        othello_store.on(OthelloGameEvent.SET, on_set);
        othello_store.on(OthelloGameEvent.PUT, on_put);
        othello_store.on(OthelloGameEvent.PUT_FAIL, on_put_fail);
        this.events.on('shutdown', () => {
            othello_store.off(OthelloGameEvent.SET, on_set);
            othello_store.off(OthelloGameEvent.PUT, on_put);
            othello_store.off(OthelloGameEvent.PUT_FAIL, on_put_fail);
        });

        const vote = ({channel_id, nickname, message}: CommonStoreEventParam) => {
            const [x, y] = position_to_coord(message);
            othello_store.setMemberShip(channel_id);
            const membership = (othello_store.members[channel_id] === MemberShip.DEFAULT) ? othello_store.default_membership : othello_store.members[channel_id];
            const team_tag = membership_to_team(membership);
            if (team_tag === undefined) return;
            if (this.curr_turn !== team_tag) return;
            for (const disk of this.team_panels[team_tag].disk_set) {
                if (disk.x === x && disk.y === y) this.team_panels[team_tag].addChat(channel_id, nickname, x, y, this.votes[x][y]);
            }
        };
        store.on(CommonStoreEvent.CHAT, vote);
        store.on(CommonStoreEvent.DONATION, vote);
        this.events.on('shutdown', () => {
            store.off(CommonStoreEvent.CHAT, vote);
            store.off(CommonStoreEvent.DONATION, vote);
        });

        const bgm_tag_list = ['battle1', 'battle2', 'battle3'];
        const random_bgm_tag = bgm_tag_list[Math.floor(Math.random() * bgm_tag_list.length)];
        store.bgm = store.bgm_map['bgm:' + random_bgm_tag + ':intro'];

        switch (othello_store.start_team) {
            case StartTeam.TEAM1:
                this.setTurn(TeamTag.TEAM1);
                break;
            case StartTeam.TEAM2:
                this.setTurn(TeamTag.TEAM2);
                break;
            case StartTeam.RANDOM:
                const team_list = [TeamTag.TEAM1, TeamTag.TEAM2];
                this.setTurn(team_list[Math.round(Math.random())]);
                break;
        }
    }

    putDisk(team_tag: TeamTag, disk_set: Set<Disk>, vote: { [position: string]: number }) {
        let did_put = false;
        if (othello_store.teams[team_tag].put === PutType.MOST && Object.keys(vote).length > 0) {
            let most_count = 0;
            let most_position = '';
            for (const position in vote) {
                const count = vote[position];
                if (most_count < count) {
                    most_count = count;
                    most_position = position;
                } else if (count === most_count) {
                    if (Math.random() < 0.5) most_position = position;
                }
            }
            const [x, y] = position_to_coord(most_position);
            did_put = othello_store.game_board.putDisk(x, y, team_tag, othello_store.teams[team_tag].disk_color);
        } else if (othello_store.teams[team_tag].put === PutType.PROPORTIONAL && Object.keys(vote).length > 0) {
            const position_list = [];
            for (const position in vote) {
                for (let i = 0; i < vote[position]; i++) {
                    position_list.push(position);
                }
            }
            const random_disk = position_list[Math.floor(Math.random() * position_list.length)];
            const [x, y] = position_to_coord(random_disk);
            did_put = othello_store.game_board.putDisk(x, y, team_tag, othello_store.teams[team_tag].disk_color);
        }
        
        if (othello_store.teams[team_tag].put === PutType.CLICK || Object.keys(vote).length === 0 || !did_put) { // no click nor no vote
            const random_disk = [...disk_set][Math.floor(Math.random() * disk_set.size)];
            othello_store.game_board.putDisk(random_disk.x, random_disk.y, team_tag, othello_store.teams[team_tag].disk_color);
        }
    }
    setTurn(team_tag: TeamTag) {
        const disk_color = othello_store.teams[team_tag].disk_color;
        const disk_set = othello_store.game_board.canPutDiskSet(team_tag, disk_color);
        if (disk_set.size > 0) {
            this.team_panels[this.curr_turn].onendturn();
            this.team_panels[team_tag].onstartturn(disk_set, (team_tag, disk_set, vote) => {
                this.putDisk(team_tag, disk_set, vote);
            });
            this.curr_turn = team_tag;
            this.prev_pass = false;
            // show available position
            for (let x = 1; x <= othello_store.game_board.width; x++) {
                for (let y = 1; y <= othello_store.game_board.height; y++) {
                    if (disk_set.has(othello_store.game_board.disks[x][y])) {
                        this.disks[x][y].setFrame(14).setTint(store.style.color.green_a);
                    } else if (othello_store.game_board.disks[x][y].disk_color === DiskColor.NONE) {
                        this.disks[x][y].setFrame(13);
                    }
                    this.votes[x][y].setVisible(false);
                }
            }
        } else {
            if (this.prev_pass) {
                this.endGame();
            } else {
                this.prev_pass = true;
                this.setTurn(this.curr_turn);
            }
        }
    }
    nextTurn() {
        const next_turn = this.curr_turn === TeamTag.TEAM1 ? TeamTag.TEAM2 : TeamTag.TEAM1;
        this.setTurn(next_turn);
    }

    endGame() {
        for (let x = 1; x <= othello_store.game_board.width; x++) {
            for (let y = 1; y <= othello_store.game_board.height; y++) {
                if (othello_store.game_board.disks[x][y].disk_color === DiskColor.NONE) {
                    this.disks[x][y].setFrame(13);
                }
            }
        }
        const streamer_team = membership_to_team(othello_store.members[store.proxy.channel_id]);
        const viewer_team = (streamer_team === TeamTag.TEAM1) ? TeamTag.TEAM2 : TeamTag.TEAM1;
        if (!streamer_team) store.bgm = store.bgm_map['bgm:victory:intro']; // streamser is not a member
        else {
            const streamer_count = othello_store.game_board.counter[streamer_team];
            const viewer_count = othello_store.game_board.counter[viewer_team];
            if (streamer_count/2 > viewer_count) store.bgm = store.bgm_map['bgm:victory2:intro'];
            else if (streamer_count > viewer_count) store.bgm = store.bgm_map['bgm:victory:intro'];
            else if (streamer_count === viewer_count) store.bgm = store.bgm_map['bgm:draw:intro'];
            else if (streamer_count*2 > viewer_count) store.bgm = store.bgm_map['bgm:defeat:intro'];
            else store.bgm = store.bgm_map['bgm:defeat2:intro'];
        }
        
        this.team_panels[TeamTag.TEAM1].endGame();
        this.team_panels[TeamTag.TEAM2].endGame();

        this.is_end = true;
        this.back_text.setColor(store.style.color_code.pink_f);
        this.back_text.setOrigin(0, 0);
    }
}
