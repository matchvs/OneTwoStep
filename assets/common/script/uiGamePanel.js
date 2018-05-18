var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: require("uiPanel"),

    properties: {
        bgAudio: {
            default: null,
            url: cc.AudioClip
        },
        leadSpFrame: cc.SpriteFrame,
        backWardSpFrame: cc.SpriteFrame,
        stepSpTag: cc.Sprite,
        stepLb: cc.Label,
        stepThreshold: 0
    },

    onLoad() {
        this._super();
        cc.audioEngine.play(this.bgAudio, true, 1);
    },

    update() {
        if (Game.GameManager.gameState === GameState.Play
            && Game.PlayerManager && Game.PlayerManager.player && Game.PlayerManager.rival) {
            var stepDif = Game.PlayerManager.player.jumpRecordId - Game.PlayerManager.rival.jumpRecordId;
            if (Math.abs(stepDif) > this.stepThreshold) {
                this.stepSpTag.node.active = true;
                if (stepDif < 0) {
                    this.stepSpTag.SpriteFrame = this.backWardSpFrame;
                } else {
                    this.stepSpTag.SpriteFrame = this.leadSpFrame;
                }
                this.stepLb.string = Math.abs(stepDif);
            } else {
                this.stepSpTag.node.active = false;
            }
        }
    }

});
