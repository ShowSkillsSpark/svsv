import { Events } from "phaser";

class OthelloStore extends Events.EventEmitter {
    constructor() {
        super();
    }
}

export const store = new OthelloStore();
