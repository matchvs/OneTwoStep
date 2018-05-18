var GLB = require("Glb");
cc.Class({
    extends: cc.Component,

    properties: {
        player: cc.Node,
        rival: cc.Node
    },

    onLoad() {
        Game.PlayerManager = this;
        clientEvent.on(clientEvent.eventType.gameStart, this.initPlayers, this);
        this.player = this.player.getComponent("player");
        this.player.init(GLB.userInfo.id)
        this.rival = this.rival.getComponent("rival");
        this.rival.init(GLB.playerUserIds[1]);
    },

    onDestroy: function() {
        clientEvent.off(clientEvent.eventType.roundStart, this.initPlayers, this);
    }
});
