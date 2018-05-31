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
        this.nodeDict["lose"].active = !Game.GameManager.result;
        this.nodeDict["win"].active = Game.GameManager.result;

        this.nodeDict["quit"].on("click", this.quit, this);

        if (Game.GameManager.result) {
            cc.audioEngine.play(this.victoryClip, false, 1);
        } else {
            cc.audioEngine.play(this.loseClip, false, 1);
        }

        var self = Game.PlayerManager.player;
        var rival = Game.PlayerManager.rival;
        if (Game.GameManager.result) {
            rival.jumpRecordId--;
        }
        this.nodeDict["playerScore"].getComponent(cc.Label).string = self.jumpRecordId;
        this.nodeDict["rivalScore"].getComponent(cc.Label).string = rival.jumpRecordId;
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
