import { AUTO, Game, Scale, Types } from "phaser";
import { store } from "./Store/CommonStore";
import { BootScene, LoginScene, PreloadScene, SelectGameScene } from "./Scene/Common";
import { OthelloGameScene, OthelloSettingScene } from "./Scene/Othello";
import { SidebarScene } from "./Scene/Common/SidebarScene";

const config: Types.Core.GameConfig = {
    type: AUTO,
    parent: 'game-container',
    width: store.WIDTH,
    height: store.HEIGHT,
    transparent: true,
    pixelArt: true,
    roundPixels: false,
    antialias: false,
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

        OthelloSettingScene,
        OthelloGameScene,

        SidebarScene,
    ],
};

document.addEventListener("DOMContentLoaded", () => {
    new Game(config);
});
