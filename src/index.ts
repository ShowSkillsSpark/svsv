import { AUTO, Game, Scale, Types } from "phaser";
import store, { WIDTH, HEIGHT } from "./store";

import { BootScene } from "./Scene/BootScene";
import { LoginScene } from "./Scene/LoginScene";
import { PreloadScene } from "./Scene/PreloadScene";
import { SelectGameScene } from "./Scene/SelectGameScene";
import { RecordScene } from "./Scene/Game/RecordScene";

const config: Types.Core.GameConfig = {
    type: AUTO,
    parent: 'game-container',
    width: WIDTH,
    height: HEIGHT,
    transparent: true,
    pixelArt: true,
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
    },
    fullscreenTarget: 'game-container',
    preserveDrawingBuffer: true,
    scene: [
        BootScene,
        LoginScene,
        PreloadScene,
        SelectGameScene,
        RecordScene,
    ],
};

document.addEventListener("DOMContentLoaded", () => {
    new Game(config);
});
