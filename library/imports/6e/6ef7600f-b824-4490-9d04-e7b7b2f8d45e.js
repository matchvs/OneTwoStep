"use strict";
cc._RF.push(module, '6ef76APuCREkJ0E57ey+NRe', 'Globals');
// common/script/basic/Globals.js

"use strict";

window.Game = {
    GameManager: null,
    PlayerManager: null
};

window.GameState = cc.Enum({
    None: 0,
    Pause: 1,
    Play: 2,
    Over: 3,
    End: 4
});

window.PlayerState = cc.Enum({
    Jump: -1,
    Stand: -1,
    Dead: -1
});

cc._RF.pop();