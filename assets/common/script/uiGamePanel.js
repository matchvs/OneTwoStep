var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: require("uiPanel"),

    properties: {
        bgm: {
            default: null,
            url: cc.AudioClip
        },
        loseClip: {
            default: null,
            url: cc.AudioClip
        },
        winClip: {
            default: null,
            url: cc.AudioClip
        },
        leadSpFrame: cc.SpriteFrame,
        backWardSpFrame: cc.SpriteFrame,
        stepSpTag: cc.Sprite,
        stepLb: cc.Label,
        stepThreshold: 0,
        selfIcon: cc.Node,
        rivalIcon: cc.Node
    },

    onLoad() {
        this._super();
        this.isGameOverPlay = false;
        this.bgmId = cc.audioEngine.play(this.bgm, true, 0.5);
        clientEvent.on(clientEvent.eventType.gameOver, this.gameOver, this);
        clientEvent.on(clientEvent.eventType.roundStart, this.roundStart, this);
        clientEvent.on(clientEvent.eventType.leaveRoomNotify, this.leaveRoom, this);
        this.selfIcon.getComponent('playerIcon').setData({id: GLB.playerUserIds[0]});
        this.rivalIcon.getComponent('playerIcon').setData({id: GLB.playerUserIds[1]});
        this.nodeDict["exit"].on("click", this.exit, this);
    },

    leaveRoom(data) {
        if (Game.GameManager.gameState !== GameState.Over) {
            uiFunc.openUI("uiTip", function(obj) {
                var uiTip = obj.getComponent("uiTip");
                if (uiTip) {
                    if (data.leaveRoomInfo.userId !== GLB.userInfo.id) {
                        uiTip.setData("对手离开了游戏");
                    }
                }
            }.bind(this));
        }
    },

    exit() {
        uiFunc.openUI("uiExit");
    },

    roundStart() {
        this.nodeDict['readyGo'].getComponent(cc.Animation).play();
        this.nodeDict['readyGo'].getComponent(cc.AudioSource).play();
    },

    gameOver() {
        if (!this.isGameOverPlay) {
            this.isGameOverPlay = true;
            cc.audioEngine.stop(this.bgmId);
            this.nodeDict['gameOver'].getComponent(cc.Animation).play();
            this.nodeDict['gameOver'].getComponent(cc.AudioSource).play();
        }
    },

    update() {
        if ((Game.GameManager.gameState === GameState.Play || Game.GameManager.gameState === GameState.Pause)
            && Game.PlayerManager && Game.PlayerManager.player && Game.PlayerManager.rival) {
            var stepDif = Game.PlayerManager.player.jumpRecordId - Game.PlayerManager.rival.jumpRecordId;
            if (Math.abs(stepDif) > this.stepThreshold) {
                this.stepSpTag.node.active = true;
                if (stepDif < 0) {
                    this.stepSpTag.spriteFrame = this.backWardSpFrame;
                } else {
                    this.stepSpTag.spriteFrame = this.leadSpFrame;
                }
                this.stepLb.string = Math.abs(stepDif);
            } else {
                this.stepSpTag.node.active = false;
            }
        }
    },

    onDestroy() {
        cc.audioEngine.stop(this.bgmId);
        clientEvent.off(clientEvent.eventType.gameOver, this.gameOver, this);
        clientEvent.off(clientEvent.eventType.roundStart, this.roundStart, this);
        clientEvent.off(clientEvent.eventType.leaveRoomNotify, this.leaveRoom, this);

    }

});
