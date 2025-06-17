import { Events, Scene, Tilemaps } from "phaser";
import store, { Color, HEIGHT, TeamTag, WIDTH } from "../../../store";


enum DiskType {
    Block = 0,
    Empty = 1,
    White = 2,
    Black = 3,
}

class Disk {
    disk_type: DiskType;
    x: number;
    y: number;

    constructor(x: number, y: number, disk_type: DiskType) {
        this.x = x;
        this.y = y;
        this.disk_type = disk_type;
    }
}

enum GameBoardEvent {
    SET = 'set',
    PUT = 'put',
    PUT_FAIL = 'put_fail',
}

class GameBoard extends Events.EventEmitter {
    max_width: number;
    max_height: number;

    disks: Disk[][] = [];

    constructor(max_width: number = 12, max_height: number = max_width) {
        super();
        this.max_width = max_width;
        this.max_height = max_height;
        for (let y=0; y<this.max_height; y++) {
            this.disks[y] = [];
            for (let x=0; x<this.max_width; x++) {
                this.disks[y][x] = new Disk(x, y, DiskType.Block);
            }
        }
    }

    initSize(width: number, height: number) {
        for (let y=0; y<this.max_height; y++) {
            for (let x=0; x<this.max_width; x++) {
                let disk_type = DiskType.Block;
                if (y>0 && y<=height && x>0 && x<=width) disk_type = DiskType.Empty;
                this.setDisk(x, y, disk_type);
            }
        }
    }

    getDisk(x: number, y: number) {
        return this.disks[y][x];
    }
    setDisk(x: number, y: number, disk_type: DiskType) {
        const prev_disk_type = this.disks[y][x].disk_type;
        this.disks[y][x].disk_type = disk_type;
        this.emit(GameBoardEvent.SET, x, y, prev_disk_type, disk_type);
    }
    canPutDisk(x: number, y: number, disk_type: DiskType) {
        if (this.disks[y][x].disk_type !== DiskType.Empty) return [];
        const filp_u  = this.chainFlip(x, y,  0, -1, disk_type, true); // filp up
        const filp_ur = this.chainFlip(x, y,  1, -1, disk_type, true); // filp up right
        const filp_r  = this.chainFlip(x, y,  1,  0, disk_type, true); // filp right
        const filp_dr = this.chainFlip(x, y,  1,  1, disk_type, true); // filp down right
        const filp_d  = this.chainFlip(x, y,  0,  1, disk_type, true); // filp down
        const filp_dl = this.chainFlip(x, y, -1,  1, disk_type, true); // filp down left
        const filp_l  = this.chainFlip(x, y, -1,  0, disk_type, true); // flip left
        const filp_ul = this.chainFlip(x, y, -1, -1, disk_type, true); // filp up left
        const flip_disks = [...filp_u, ...filp_ur, ...filp_r, ...filp_dr, ...filp_d, ...filp_dl, ...filp_l, ...filp_ul];
        return flip_disks;
    }
    putDisk(x: number, y: number, disk_type: DiskType) {
        const flip_disks = this.canPutDisk(x, y, disk_type);
        if (flip_disks.length === 0) {
            this.emit(GameBoardEvent.PUT_FAIL, x, y, disk_type);
            return false;
        }
        this.setDisk(x, y, disk_type);
        flip_disks.forEach((disk) => {
            this.setDisk(disk.x, disk.y, disk_type);
        });
        this.emit(GameBoardEvent.PUT, x, y, disk_type);
        return true;
    }

    private chainFlip(x: number, y: number, dx: number, dy: number, target_disk_type: DiskType, first_disk = false): Disk[] {
        const curr_disk = first_disk ? [] : [this.disks[y][x]];
        const next_disk = this.disks[y+dy][x+dx];
        switch (next_disk.disk_type) {
            case DiskType.Block:
            case DiskType.Empty:
                return [];
            case target_disk_type:
                return [...curr_disk];
            default:
                const disk_list = this.chainFlip(x+dx, y+dy, dx, dy, target_disk_type);
                if (disk_list.length > 0) return [...disk_list, ...curr_disk];
                return [];
        }
    }
}

export class ReversiGameScene extends Scene {
    turn: TeamTag;
    prev_pass = false;

    game_board: GameBoard;
    tilemap!: Tilemaps.Tilemap;
    layer_x: number;
    layer_y: number;
    tile_width: number;
    tile_height: number;
    tile_scale: number;

    disk_sprites: Phaser.GameObjects.Sprite[][] = [];

    constructor(key: string) {
        super(key);
        this.turn = TeamTag.Team1;

        this.game_board = new GameBoard();
        const game_width = 8;
        const game_height = 8;
        this.game_board.initSize(game_width, game_height);

        this.tile_width = 32;
        this.tile_height = 32;
        this.tile_scale = 3;
        this.layer_x = (WIDTH - this.tile_width * (game_width + 2) * this.tile_scale)/2;
        this.layer_y = (HEIGHT - this.tile_height * (game_height + 2) * this.tile_scale)/2;
    }

    create() {
        const width = 10;
        const height = 10;

        this.tilemap = this.make.tilemap({
            key: 'ReversiCsv',
            tileWidth: this.tile_width,
            tileHeight: this.tile_height,
            width,
            height,
        });
        const tileset = this.tilemap.addTilesetImage('ReversiAssets')!;
        const layer = this.tilemap.createLayer(0, tileset);

        layer?.setScale(this.tile_scale);
        layer?.setPosition(this.layer_x, this.layer_y);

        layer?.forEachTile((tile: Tilemaps.Tile) => {
            if (tile.index !== 13) return;
            const {x, y} = tile;
            const zone_x = this.layer_x + x * this.tile_width * this.tile_scale;
            const zone_y = this.layer_y + y * this.tile_height * this.tile_scale;
            const zone_width = this.tile_width * this.tile_scale;
            const zone_height = this.tile_height * this.tile_scale;
            const zone = this.add.zone(zone_x, zone_y, zone_width, zone_height).setOrigin(0);
            const marker = this.add.graphics().lineStyle(2 * this.tile_scale, Color.PURPLE).strokeRect(zone_x, zone_y, zone_width, zone_height);
            marker.visible = false;
            zone.setInteractive().on('pointerover', () => {
                marker.visible = true;
            }).on('pointerout', () => {
                marker.visible = false;
            });
            zone.on('pointerup', () => {
                const disk = this.game_board.getDisk(x, y);
                this.onClick(disk);
            });
        });

        this.anims.create({
            key: `${DiskType.White}2${DiskType.Black}`,
            frames: this.anims.generateFrameNumbers('Reversi', { start: 0, end: 6 }),
            frameRate: 10,
        });
        this.anims.create({
            key: `${DiskType.Black}2${DiskType.White}`,
            frames: this.anims.generateFrameNumbers('Reversi', { start: 6, end: 12 }),
            frameRate: 10,
        });

        this.game_board.on(GameBoardEvent.SET, this.onSet);
        this.game_board.on(GameBoardEvent.PUT, this.onPut);
        this.game_board.on(GameBoardEvent.PUT_FAIL, this.onPutFail);

        this.initGame();
    }
    private onClick(disk: Disk) {
        const {x, y} = disk;
        switch (disk.disk_type) {
            case DiskType.Empty:
                const disk_type = this.turn === TeamTag.Team1 ? DiskType.White : DiskType.Black;
                const can_put = this.game_board.canPutDisk(x, y, disk_type);
                if (can_put) {
                    this.game_board.putDisk(x, y, disk_type);
                } else {
                    console.log('cannot put');
                }
                return;
            default:
                console.log('non empty');
                return;
        }
    }
    private onSet = (x: number, y: number, prev_disk_type: DiskType, disk_type: DiskType) => {
        this.showDisk(x, y, prev_disk_type, disk_type);
    }
    private onPut = (x: number, y: number, disk_type: DiskType) => {
        console.log('put success');
        this.nextTurn();
    }
    private onPutFail = (x: number, y: number, disk_type: DiskType) => {
        console.log('put fail');
    }

    initGame(turn = TeamTag.Team1) {
        for (let y=0; y<this.game_board.max_height; y++) {
            this.disk_sprites[y] = [];
            for (let x=0; x<this.game_board.max_width; x++) { // draw disk sprites
                const sprite_x = this.layer_x + x * this.tile_width * this.tile_scale;
                const sprite_y = this.layer_y + y * this.tile_height * this.tile_scale;
                const sprite_width = this.tile_width * this.tile_scale;
                const sprite_height = this.tile_height * this.tile_scale;

                const disk_sprite = this.add.sprite(sprite_x, sprite_y, 'Reversi').setOrigin(0);
                disk_sprite.setScale(sprite_width/disk_sprite.width, sprite_height/disk_sprite.height);
                disk_sprite.visible = false;
                this.disk_sprites[y][x] = disk_sprite;
            }
        }

        this.game_board.initSize(8, 8);
        this.game_board.setDisk(4, 4, DiskType.White);
        this.game_board.setDisk(5, 5, DiskType.White);
        this.game_board.setDisk(4, 5, DiskType.Black);
        this.game_board.setDisk(5, 4, DiskType.Black);

        this.setTurn(turn);
    }
    endGame() {}

    showDisk(x: number, y: number, prev_disk_type: DiskType, disk_type: DiskType) {
        const disk_sprite = this.disk_sprites[y][x];
        switch (disk_type) {
            case DiskType.Block:
                disk_sprite.visible = false;
                break;
            case DiskType.Empty:
                disk_sprite.visible = false;
                break;
            case DiskType.Black:
            case DiskType.White:
                if (prev_disk_type === DiskType.Empty) {
                    const frame = disk_type === DiskType.White ? 0 : 6;
                    disk_sprite.setTexture('Reversi', frame);
                    disk_sprite.visible = true;
                } else if (prev_disk_type !== disk_type) {
                    disk_sprite.visible = true;
                    disk_sprite.play(`${prev_disk_type}2${disk_type}`);
                }
                break;
        }
    }

    setTurn(turn: TeamTag) {
        const disk_type = turn === TeamTag.Team1 ? DiskType.White : DiskType.Black;
        let can_put = false;
        for (let x=0; x<this.game_board.max_width; x++) {
            for (let y=0; y<this.game_board.max_height; y++) {
                const disk_list = this.game_board.canPutDisk(x, y, disk_type);
                if (disk_list.length > 0) can_put = true;
            }
        }
        if (can_put) {
            this.prev_pass = false;
            this.turn = turn;
            console.log('turn', this.turn);
        } else {
            if (this.prev_pass) { // both cannot put. end game.
                this.endGame();
            } else { // cannot put. pass turn.
                this.prev_pass = true;
                this.setTurn(this.turn);
            }
        }
        // set way
        store.teams[this.turn].set_way;
        // count down
        store.teams[this.turn].time;
    }
    nextTurn() {
        const next_turn = this.turn === TeamTag.Team1 ? TeamTag.Team2 : TeamTag.Team1;
        this.setTurn(next_turn);
    }
}
