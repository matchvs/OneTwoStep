var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: uiPanel,

    properties: {
        loseClip: {
            default: null,
            url: cc.AudioClip
        },
        victoryClip: {
            default: null,
            url: cc.AudioClip
        }
    },

    start() {
        this.player = this.nodeDict["player"].getComponent("resultPlayerIcon");
        this.player.setData(Game.PlayerManager.player.playerId);
        this.rival = this.nodeDict["rival"].getComponent("resultPlayerIcon");
        this.rival.setData(Game.PlayerManager.rival.playerId);
        this.nodeDict["vs"].active = false;
        this.nodeDict["score"].active = true;

        this.nodeDict["quit"].on("click", this.quit, this);

        if (Game.GameManager.result || Game.GameManager.isRivalLeave) {
            this.nodeDict["lose"].active = false;
            this.nodeDict["win"].active = true;
            cc.audioEngine.play(this.victoryClip, false, 1);
            Game.GameManager.loginServer();
        } else {
            this.nodeDict["lose"].active = true;
            this.nodeDict["win"].active = false;
            cc.audioEngine.play(this.loseClip, false, 1);
        }
        if (!Game.GameManager.selfScore || !Game.GameManager.rivalScore) {
            var self = Game.PlayerManager.player;
            var rival = Game.PlayerManager.rival;

            Game.GameManager.selfScore = self.jumpRecordId + self.jumpPos.length;
            Game.GameManager.rivalScore = rival.jumpRecordId + rival.jumpPos.length;
        }
        this.nodeDict["playerScore"].getComponent(cc.Label).string = Game.GameManager.selfScore
        this.nodeDict["rivalScore"].getComponent(cc.Label).string = Game.GameManager.rivalScore;
    },

    quit: function() {
        mvs.engine.leaveRoom("");
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
