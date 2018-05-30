var GLB = require("Glb");
cc.Class({
    extends: cc.Component,

    properties: {
        player: cc.Node,
        rival: cc.Node
    },

    onLoad() {
        Game.PlayerManager = this;
        this.player = this.player.getComponent("player");
        this.player.init(GLB.userInfo.id)
        this.rival = this.rival.getComponent("rival");
        this.rival.init(GLB.playerUserIds[1]);
    }
});
