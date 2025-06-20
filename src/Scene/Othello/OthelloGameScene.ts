import { GameObjects, Scene } from "phaser";
import { DiskColor, OthelloGameEvent, GameBoardTile, othello_store, PutType, TeamTag, StartTeam } from "../../Store/OthelloStore";
import { store } from "../../Store/CommonStore";
import { OthelloSettingScene } from "./OthelloSettingScene";

class TeamPanel extends GameObjects.Container {
    cover: GameObjects.Rectangle;

    constructor(scene: Scene, x: number, y: number, width: number, height: number, team_tag: TeamTag) {
        super(scene, x, y);
        scene.add.existing(this);

        const stroke_size = width/50;

        // 테두리
        const stroke = scene.add.graphics()
                .lineStyle(stroke_size, store.style.color.grey_f)
                .strokeRect(0, 0, width, height);
        this.add(stroke);

        // 팀 이름
        const team_name_text = scene.add.text(width/2, height*1/4, othello_store.teams[team_tag].name, {
            ...store.style.font_style,
        }).setOrigin(0.5);
        this.add(team_name_text);

        // 디스크, 디스트 개수
        const disk_y_offset = height*2/3;
        const team_disk_color = othello_store.teams[team_tag].disk_color
        const sprite_id = (team_disk_color === DiskColor.WHITE) ? 0 : 6;
        const team_disk = scene.add.sprite(width*1/3, disk_y_offset, 'Othello:assets', sprite_id).setScale(store.SCALE).setOrigin(0.5);
        const count_text = scene.add.text(width*2/3, disk_y_offset, othello_store.game_board.counter[team_tag].toString(), {
            ...store.style.font_style,
        }).setOrigin(0.5);
        this.add([team_disk, count_text]);

        this.cover = scene.add.rectangle(-stroke_size, -stroke_size, width+2*stroke_size, height+2*stroke_size, store.style.color.grey_0, 0.5).setOrigin(0);
        this.add(this.cover);

        const on_set = () => {
            const disk_count = othello_store.game_board.counter[team_tag];
            count_text.setText(disk_count.toString());
        };
        othello_store.on(OthelloGameEvent.SET, on_set);
        scene.events.on('shutdown', () => {
            othello_store.off(OthelloGameEvent.SET, on_set);
        });
    }

    onstartturn() {
        this.cover.visible = false;
    }
    onendturn() {
        this.cover.visible = true;
    }
}

class TeamChat extends GameObjects.Container {
    constructor(scene: Scene) {
        super(scene);
        scene.add.existing(this);
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

    team_panels: { [team_tag in TeamTag]: TeamPanel } = {} as { [team_tag in TeamTag]: TeamPanel };

    curr_turn: TeamTag = TeamTag.TEAM1;
    prev_pass = false;

    constructor() {
        super(OthelloGameScene.key);
    }

    create() {
        // 타이틀
        const title_y_offset = store.HEIGHT/20;
        this.add.text(store.WIDTH/2, title_y_offset, '스트리머 vs 시청자', {
            ...store.style.font_style,
            color: store.style.color_code.green_f,
        }).setOrigin(0.5, 0);

        // 게임판
        const scale_x = store.WIDTH / (othello_store.game_board.width + 2);
        const scale_y = store.HEIGHT / (othello_store.game_board.height + 2);
        const scale = Math.min(scale_x, scale_y) / 32;

        const tile_width = 32 * scale;
        const tile_height = 32 * scale;
        const tile_x_offset = (store.WIDTH - tile_width * (othello_store.game_board.width + 2)) / 2;
        const tile_y_offset = tile_height / 2 +(store.style.font_style.fontSize as number) - 32 * scale / 2;

        const tint_out = store.style.color.green_a;
        const tint_over = store.style.color.green_f;
        for (let x = 0; x < othello_store.game_board.width + 2; x++) {
            this.tiles[x] = [];
            this.disks[x] = [];
            for (let y = 0; y < othello_store.game_board.height + 2; y++) {
                const pixel_x = tile_x_offset + x * tile_width;
                const pixel_y = tile_y_offset + y * tile_height;

                const tile = othello_store.game_board.tiles[x][y];
                switch (tile) {
                    case GameBoardTile.EMPTY:
                        this.tiles[x][y] = this.add.sprite(pixel_x, pixel_y, 'Othello:assets', 16)
                                .setOrigin(0).setScale(scale).setTint(tint_out).setToBack();
                        const zone = this.add.graphics()
                                .lineStyle(2 * scale, tint_over)
                                .strokeRoundedRect(pixel_x, pixel_y, tile_width, tile_height, 2 * scale);
                        zone.visible = false;
                        this.tiles[x][y].setInteractive().on('pointerup', () => {
                            if (othello_store.teams[this.curr_turn].put === PutType.CLICK || store.DEBUG) {
                                othello_store.game_board.putDisk(x, y, this.curr_turn, othello_store.teams[this.curr_turn].disk_color);
                            }
                        }).on('pointerover', () => {
                            zone.visible = true;
                        }).on('pointerout', () => {
                            zone.visible = false;
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
            }
        }

        // 팀 패널
        const team_panel_x_offset = tile_width / 2;
        const team_panel_y_offset = tile_y_offset + tile_height;
        const team_panel_width = (store.WIDTH - tile_width * (othello_store.game_board.width + 2)) / 2;
        const team_panel_height = (store.HEIGHT - team_panel_y_offset) / 3;
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
        const on_put = () => {
            this.nextTurn();
        };
        const on_put_fail = () => {
            console.log('failed to put')
        }
        othello_store.on(OthelloGameEvent.SET, on_set);
        othello_store.on(OthelloGameEvent.PUT, on_put);
        othello_store.on(OthelloGameEvent.PUT_FAIL, on_put_fail);
        this.events.on('shutdown', () => {
            othello_store.off(OthelloGameEvent.SET, on_set);
            othello_store.off(OthelloGameEvent.PUT, on_put);
            othello_store.off(OthelloGameEvent.PUT_FAIL, on_put_fail);
        });

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
        // this.scene.start('SelectGameScene');
        // this.scene.start(OthelloResultScene.key);
    }

    setTurn(team_tag: TeamTag) {
        const disk_color = othello_store.teams[team_tag].disk_color;
        const disk_set = othello_store.game_board.canPutDiskSet(team_tag, disk_color);
        if (disk_set.size > 0) {
            this.team_panels[this.curr_turn].onendturn();
            this.team_panels[team_tag].onstartturn();
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
        // set way
        // count down
    }
    nextTurn() {
        const next_turn = this.curr_turn === TeamTag.TEAM1 ? TeamTag.TEAM2 : TeamTag.TEAM1;
        this.setTurn(next_turn);
    }

    endGame() {
        console.log('game over');
        // show game result
        // go to setting button
        this.scene.start(OthelloSettingScene.key);
    }
}
