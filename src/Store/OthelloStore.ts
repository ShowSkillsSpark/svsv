import { store, Store } from "./CommonStore";

export enum TeamTag {
    TEAM1 = 'TEAM1',
    TEAM2 = 'TEAM2',
}

export enum Timeout {
    SEC_10 = '10 초',
    SEC_20 = '20 초',
    SEC_30 = '30 초',
    SEC_40 = '40 초',
    SEC_50 = '50 초',
    SEC_60 = '60 초',
    SEC_300 = '300 초',
}

export enum DiskColor {
    WHITE = '하양',
    BLACK = '검정',
    NONE = '투명',
}

export enum PutType {
    CLICK = '클릭',
    MOST = '최다 득표',
    PROPORTIONAL = '득표 비례 확률',
}

export enum MemberShip {
    TEAM1 = '1 팀',
    TEAM2 = '2 팀',
    NONE = '불참',
}

export enum StartTeam {
    TEAM1 = '1 팀',
    TEAM2 = '2 팀',
    RANDOM = '무작위',
}

interface TeamConfigParam {
    name: string,
    timeout_index: integer,
    disk_index: integer,
    put_index: integer,
}

class TeamConfig {
    name: string;

    timeout_list = [Timeout.SEC_10, Timeout.SEC_20, Timeout.SEC_30, Timeout.SEC_40, Timeout.SEC_50, Timeout.SEC_60, Timeout.SEC_300];
    timeout_index: integer;
    get timeout() { return this.timeout_list[this.timeout_index]; }

    disk_color_list = [DiskColor.WHITE, DiskColor.BLACK];
    disk_color_index: integer;
    get disk_color() { return this.disk_color_list[this.disk_color_index]; }

    put_list = [PutType.CLICK, PutType.MOST, PutType.PROPORTIONAL];
    put_index: integer;
    get put() { return this.put_list[this.put_index]; }

    constructor({name, timeout_index, disk_index, put_index}: TeamConfigParam) {
        this.name = name;
        this.timeout_index = timeout_index;
        this.disk_color_index = disk_index;
        this.put_index = put_index;
    }

    nextTimeout(diff: integer) { this.timeout_index = (this.timeout_index + this.timeout_list.length + diff) % this.timeout_list.length; return this.timeout; }
    nextDisk(diff: integer) { this.disk_color_index = (this.disk_color_index + this.disk_color_list.length + diff) % this.disk_color_list.length; return this.disk_color; }
    nextPut(diff: integer) { this.put_index = (this.put_index + this.put_list.length + diff) % this.put_list.length; return this.put; }
}

export enum GameBoardSize {
    SIZE_8 = 8,
    SIZE_10 = 10,
    MAX_SIZE = SIZE_10,
}

export enum GameBoardTile {
    WALL = 0,
    EMPTY = 1,
    BLOCK = 2,
}

export enum OthelloGameEvent {
    SET = 'SET',
    PUT = 'PUT',
    PUT_FAIL = 'PUT_FAIL',
    PASS = 'PASS',
    END = 'END',
}

class Disk {
    x: integer;
    y: integer;
    disk_color: DiskColor;
    team_tag: TeamTag | null = null;
    constructor(x: integer, y: integer, disk_color: DiskColor) {
        this.x = x;
        this.y = y;
        this.disk_color = disk_color;
    }
}

class GameBoard {
    parent: OthelloStore;

    width_index: integer
    width_list = [GameBoardSize.SIZE_8, GameBoardSize.SIZE_10];
    get width() { return this.width_list[this.width_index]; }

    height_index: integer
    height_list = [GameBoardSize.SIZE_8, GameBoardSize.SIZE_10];
    get height() { return this.height_list[this.height_index]; }

    tiles: GameBoardTile[][] = [];
    disks: Disk[][] = [];

    counter: { [team_tag in TeamTag]: number };

    constructor(parent: OthelloStore) {
        this.parent = parent;

        this.width_index = parseInt(localStorage.getItem(`OthelloStore:game_board:width_index`) || '0');
        this.height_index = parseInt(localStorage.getItem(`OthelloStore:game_board:height_index`) || '0');

        this.counter = {
            [TeamTag.TEAM1]: 0,
            [TeamTag.TEAM2]: 0,
        }

        // this.init(DiskColor.WHITE, DiskColor.BLACK);
    }

    init(team1_color: DiskColor, team2_color: DiskColor) {
        this.counter = {
            [TeamTag.TEAM1]: 0,
            [TeamTag.TEAM2]: 0,
        }

        for (let x = 0; x < GameBoardSize.MAX_SIZE + 2; x++) {
            this.tiles[x] = [];
            this.disks[x] = [];
            for (let y = 0; y < GameBoardSize.MAX_SIZE + 2; y++) {
                if (x > 0 && x <= this.width && y > 0 && y <= this.height) {
                    this.tiles[x][y] = GameBoardTile.EMPTY;
                } else {
                    this.tiles[x][y] = GameBoardTile.WALL;
                }
                this.disks[x][y] = new Disk(x, y, DiskColor.NONE);
            }
        }

        this.setDisk(this.width/2, this.height/2, TeamTag.TEAM1, team1_color);
        this.setDisk(this.width/2+1, this.height/2, TeamTag.TEAM2, team2_color);
        this.setDisk(this.width/2, this.height/2+1, TeamTag.TEAM2, team2_color);
        this.setDisk(this.width/2+1, this.height/2+1, TeamTag.TEAM1, team1_color);
    }

    setDisk(x: integer, y: integer, team_tag: TeamTag, disk_color: DiskColor, event_flag = true) {
        const prev_disk = this.disks[x][y];
        const prev_disk_team = prev_disk.team_tag;
        const prev_disk_color = prev_disk.disk_color;
        this.disks[x][y].disk_color = disk_color;
        this.disks[x][y].team_tag = team_tag;
        this.counter[team_tag] += 1;
        if (prev_disk_team) this.counter[prev_disk_team] -= 1;
        if (event_flag) this.parent.emit(OthelloGameEvent.SET, x, y, prev_disk_color, disk_color);
    }
    putDisk(x: integer, y: integer, team_tag: TeamTag, disk_color: DiskColor) {
        const flip_disks = this.canPutDisk(x, y, team_tag, disk_color);
        if (flip_disks.length === 0) {
            this.parent.emit(OthelloGameEvent.PUT_FAIL);
            return false;
        }
        this.setDisk(x, y, team_tag, disk_color);
        flip_disks.forEach((disk) => {
            this.setDisk(disk.x, disk.y, team_tag, disk_color);
        });
        this.parent.emit(OthelloGameEvent.PUT);
        return true;
    }
    canPutDisk(x: integer, y: integer, team_tag: TeamTag, disk_color: DiskColor) {
        if (this.disks[x][y].disk_color !== DiskColor.NONE) return [];
        const filp_u  = this.getFlippingDisk(x, y,  0, -1, team_tag, disk_color, true); // filp up
        const filp_ur = this.getFlippingDisk(x, y,  1, -1, team_tag, disk_color, true); // filp up right
        const filp_r  = this.getFlippingDisk(x, y,  1,  0, team_tag, disk_color, true); // filp right
        const filp_dr = this.getFlippingDisk(x, y,  1,  1, team_tag, disk_color, true); // filp down right
        const filp_d  = this.getFlippingDisk(x, y,  0,  1, team_tag, disk_color, true); // filp down
        const filp_dl = this.getFlippingDisk(x, y, -1,  1, team_tag, disk_color, true); // filp down left
        const filp_l  = this.getFlippingDisk(x, y, -1,  0, team_tag, disk_color, true); // flip left
        const filp_ul = this.getFlippingDisk(x, y, -1, -1, team_tag, disk_color, true); // filp up left
        const flip_disks = [...filp_u, ...filp_ur, ...filp_r, ...filp_dr, ...filp_d, ...filp_dl, ...filp_l, ...filp_ul];
        return flip_disks;
    }
    getFlippingDisk(x: integer, y:integer, dx: integer, dy: integer, team_tag: TeamTag, target_disk_color: DiskColor, first_disk = false): Disk[] {
        const next_tile = this.tiles[y+dy][x+dx];
        if (next_tile !== GameBoardTile.EMPTY) return [];
        const curr_disk = first_disk ? [] : [this.disks[x][y]];
        const next_disk = this.disks[x+dx][y+dy];
        if (next_disk.disk_color === DiskColor.NONE) return [];
        if (next_disk.team_tag === team_tag) return [...curr_disk];
        else {
            const disk_list = this.getFlippingDisk(x+dx, y+dy, dx, dy, team_tag, target_disk_color);
            if (disk_list.length > 0) return [...disk_list, ...curr_disk];
            return [];
        }
        switch (next_disk.disk_color) {
            case DiskColor.NONE:
                return [];
            case target_disk_color:
                return [...curr_disk];
            default:
                const disk_list = this.getFlippingDisk(x+dx, y+dy, dx, dy, team_tag, target_disk_color);
                if (disk_list.length > 0) return [...disk_list, ...curr_disk];
                return [];
        }
    }
    canPutDiskSet(team_tag: TeamTag, disk_color: DiskColor) {
        const disk_set = new Set<Disk>();
        for (let x = 1; x <= this.width; x++) {
            for (let y = 1; y <= this.height; y++) {
                if (this.canPutDisk(x, y, team_tag, disk_color).length > 0) {
                    disk_set.add(this.disks[x][y]);
                }
            }
        }
        return disk_set;
    }
}

class OthelloStore extends Store {
    readonly teams: { [team_tag in TeamTag]: TeamConfig };
    readonly members: { [channel_id: string]: MemberShip | null };

    default_membership_index: number;
    default_membership_list = [MemberShip.TEAM1, MemberShip.TEAM2, MemberShip.NONE];
    get default_membership() { return this.default_membership_list[this.default_membership_index]; }

    start_team_index: number;
    start_team_list = [StartTeam.TEAM1, StartTeam.TEAM2, StartTeam.RANDOM];
    get start_team() { return this.start_team_list[this.start_team_index]; }

    game_board: GameBoard;

    constructor() {
        super();
        this.teams = {} as { [team_tag in TeamTag]: TeamConfig };
        this.teams[TeamTag.TEAM1] = new TeamConfig({
            name: localStorage.getItem(`OthelloStore:teams:${TeamTag.TEAM1}:name`) || MemberShip.TEAM1,
            timeout_index: parseInt(localStorage.getItem(`OthelloStore:teams:${TeamTag.TEAM1}:timeout_index`) || '6'),
            disk_index: parseInt(localStorage.getItem(`OthelloStore:teams:${TeamTag.TEAM1}:disk_index`) || '0'),
            put_index: parseInt(localStorage.getItem(`OthelloStore:teams:${TeamTag.TEAM1}:put_index`) || '0'),
        });
        this.teams[TeamTag.TEAM2] = new TeamConfig({
            name: localStorage.getItem(`OthelloStore:teams:${TeamTag.TEAM2}:name`) || MemberShip.TEAM2,
            timeout_index: parseInt(localStorage.getItem(`OthelloStore:teams:${TeamTag.TEAM2}:timeout_index`) || '1'),
            disk_index: parseInt(localStorage.getItem(`OthelloStore:teams:${TeamTag.TEAM2}:disk_index`) || '1'),
            put_index: parseInt(localStorage.getItem(`OthelloStore:teams:${TeamTag.TEAM2}:put_index`) || '1'),
        });

        this.members = {};

        this.default_membership_index = parseInt(localStorage.getItem(`OthelloStore:default_membership_index`) || '1');

        this.start_team_index = parseInt(localStorage.getItem(`OthelloStore:start_team_index`) || '2');

        this.game_board = new GameBoard(this);
    }

    nextTeamTimeout(team_tag: TeamTag, diff: integer) {
        this.teams[team_tag].nextTimeout(diff);
        localStorage.setItem(`OthelloStore:teams:${team_tag}:timeout_index`, this.teams[team_tag].timeout_index.toString());
        this.emit('teams:timeout', team_tag, this.teams[team_tag].timeout);
    }
    nextTeamDisk(team_tag: TeamTag, diff: integer) {
        this.teams[team_tag].nextDisk(diff);
        localStorage.setItem(`OthelloStore:teams:${team_tag}:disk_index`, this.teams[team_tag].disk_color_index.toString());
        this.emit('teams:disk', team_tag, this.teams[team_tag].disk_color);
    }
    nextTeamPut(team_tag: TeamTag, diff: integer) {
        this.teams[team_tag].nextPut(diff);
        localStorage.setItem(`OthelloStore:teams:${team_tag}:put_index`, this.teams[team_tag].put_index.toString());
        this.emit('teams:put', team_tag, this.teams[team_tag].put);
    }
    nextDefaultMembership(diff: integer) {
        this.default_membership_index = (this.default_membership_index + this.default_membership_list.length + diff) % this.default_membership_list.length;
        localStorage.setItem(`OthelloStore:default_membership_index`, this.default_membership_index.toString());
        this.emit('default_membership', this.default_membership);
    }
    nextStartTeam(diff: integer) {
        this.start_team_index = (this.start_team_index + this.start_team_list.length + diff) % this.start_team_list.length;
        localStorage.setItem(`OthelloStore:start_team_index`, this.start_team_index.toString());
        this.emit('start_team', this.start_team);
    }
    setMemberShip(channel_id: string,membership?: MemberShip) {
        this.members[channel_id] = membership ?? null;
        this.emit('members', channel_id, this.members[channel_id]);
    }
}

export const othello_store = new OthelloStore();
