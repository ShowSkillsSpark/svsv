import { GameObjects, Scene } from "phaser";
import { OthelloResultScene } from "./OthelloResultScene";
import { DiskColor, GameBoardEvent, GameBoardTile, othello_store, PutType, TeamTag } from "../../Store/OthelloStore";
import { store } from "../../Store/CommonStore";

export class OthelloGameScene extends Scene {
    static readonly key = 'OthelloGameScene';

    tiles: GameObjects.Sprite[][] = [];
    disks: GameObjects.Sprite[][] = [];

    constructor() {
        super(OthelloGameScene.key);
    }

    create() {
        this.add.text(store.WIDTH/2, store.HEIGHT/20, '스트리머 vs 시청자', {
            ...store.style.font_style,
            color: store.style.color_code.green_f,
        }).setOrigin(0.5, 0);

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
                            if (othello_store.teams[othello_store.curr_turn].put === PutType.CLICK || store.DEBUG) {
                                othello_store.game_board.putDisk(x, y, othello_store.teams[othello_store.curr_turn].disk_color);
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

        this.anims.create({
            key: `${DiskColor.WHITE}-${DiskColor.BLACK}`,
            frames: this.anims.generateFrameNumbers('Othello:assets', { start: 0, end: 6 }),
        });
        this.anims.create({
            key: `${DiskColor.BLACK}-${DiskColor.WHITE}`,
            frames: this.anims.generateFrameNumbers('Othello:assets', { start: 6, end: 12 }),
        });

        othello_store.on(GameBoardEvent.SET, (x: integer, y: integer, prev_disk_color: DiskColor, disk_color: DiskColor) => {
            if (prev_disk_color === DiskColor.NONE) {
                const sprite_id = (disk_color === DiskColor.WHITE) ? 0 : 6;
                this.disks[x][y].setTexture('Othello:assets', sprite_id);
            } else {
                this.disks[x][y].anims.play(`${prev_disk_color}-${disk_color}`);
            }
        });
        othello_store.on(GameBoardEvent.PUT, () => {
            othello_store.curr_turn = (othello_store.curr_turn === TeamTag.TEAM1) ? TeamTag.TEAM2 : TeamTag.TEAM1;
        });
        othello_store.on(GameBoardEvent.PUT_FAIL, () => {});

        // this.scene.start(OthelloResultScene.key);
    }
}
