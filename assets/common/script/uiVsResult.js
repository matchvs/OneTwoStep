var uiPanel = require("uiPanel");
cc.Class({
    extends: uiPanel,

    properties: {},

    start() {
        this.player = this.nodeDict["player"].getComponent("resultPlayerIcon");
        this.player.setData(Game.PlayerManager.player.playerId);
        this.rival = this.nodeDict["rival"].getComponent("resultPlayerIcon");
        this.rival.setData(Game.PlayerManager.rival.playerId);
        this.nodeDict["vs"].active = true;
        this.nodeDict["score"].active = false;
        this.nodeDict["lose"].active = !Game.GameManager.result;
        this.nodeDict["win"].active = Game.GameManager.result;

        this.nodeDict["quit"].on("click", this.quit, this);
    },

    quit: function() {
        var gamePanel = uiFunc.findUI("uiGamePanel");
        if (gamePanel) {
            uiFunc.closeUI("uiGamePanel");
            gamePanel.destroy();
        }
        uiFunc.closeUI(this.node.name);
        this.node.destroy();


        Game.GameManager.lobbyShow();
    }
});
