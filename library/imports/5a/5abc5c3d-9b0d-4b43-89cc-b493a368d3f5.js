"use strict";
cc._RF.push(module, '5abc5w9mw1LQ4nMtJOjaNP1', 'playerManager');
// game/script/playerManager.js

"use strict";

var GLB = require("Glb");
cc.Class({
    extends: cc.Component,

    properties: {
        player: cc.Node,
        rival: cc.Node
    },

    onLoad: function onLoad() {
        Game.PlayerManager = this;
        this.player = this.player.getComponent("player");
        this.player.init(GLB.userInfo.id);
        this.rival = this.rival.getComponent("rival");
        this.rival.init(GLB.playerUserIds[1]);
    }
});

cc._RF.pop();