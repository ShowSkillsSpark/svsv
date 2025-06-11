import { Scene } from "phaser";

export class ControlPanelScene extends Scene {
    static key = 'ControlPanelScene';

    constructor() {
        super(ControlPanelScene.key);
        console.log('ControlPanelScene constructor');
    }

    create() {
        console.log('ControlPanelScene create');
        // 볼륨 조절 버튼
        // (게임 중이라면) 게임 포기
    }
}
