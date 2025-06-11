import { Scene } from "phaser";

export class RecordScene extends Scene {
    static key = 'RecordScene';

    constructor() {
        super(RecordScene.key);
        console.log('RecordScene constructor');
    }

    create() {
        console.log('RecordScene create');
    }
}
