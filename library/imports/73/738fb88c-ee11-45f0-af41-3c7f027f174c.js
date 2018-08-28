"use strict";
cc._RF.push(module, '738fbiM7hFF8K9BPH8CfxdM', 'uiGamePanel');
// common/script/uiGamePanel.js

"use strict";

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

    onLoad: function onLoad() {
        this._super();
        this.isGameOverPlay = false;
        this.bgmId = cc.audioEngine.play(this.bgm, true, 0.5);
        clientEvent.on(clientEvent.eventType.gameOver, this.gameOver, this);
        clientEvent.on(clientEvent.eventType.roundStart, this.roundStart, this);
        clientEvent.on(clientEvent.eventType.leaveRoomNotify, this.leaveRoom, this);
        clientEvent.on(clientEvent.eventType.leaveRoomMedNotify, this.leaveRoom, this);

        this.selfIcon.getComponent('playerIcon').setData({ id: GLB.playerUserIds[0] });
        this.rivalIcon.getComponent('playerIcon').setData({ id: GLB.playerUserIds[1] });
        this.nodeDict["exit"].on("click", this.exit, this);
    },
    leaveRoom: function leaveRoom(data) {
        if (Game.GameManager.gameState !== GameState.Over) {
            uiFunc.openUI("uiTip", function (obj) {
                var uiTip = obj.getComponent("uiTip");
                if (uiTip) {
                    uiTip.setData("对手离开了游戏");
                }
            }.bind(this));
        }
    },
    exit: function exit() {
        uiFunc.openUI("uiExit");
    },
    roundStart: function roundStart() {
        this.nodeDict['readyGo'].getComponent(cc.Animation).play();
        this.nodeDict['readyGo'].getComponent(cc.AudioSource).play();
    },
    gameOver: function gameOver() {
        if (!this.isGameOverPlay) {
            this.isGameOverPlay = true;
            cc.audioEngine.stop(this.bgmId);
            this.nodeDict['gameOver'].getComponent(cc.Animation).play();
            this.nodeDict['gameOver'].getComponent(cc.AudioSource).play();
        }
    },
    update: function update() {
        if ((Game.GameManager.gameState === GameState.Play || Game.GameManager.gameState === GameState.Pause) && Game.PlayerManager && Game.PlayerManager.player && Game.PlayerManager.rival) {
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
    onDestroy: function onDestroy() {
        cc.audioEngine.stop(this.bgmId);
        clientEvent.off(clientEvent.eventType.gameOver, this.gameOver, this);
        clientEvent.off(clientEvent.eventType.roundStart, this.roundStart, this);
        clientEvent.off(clientEvent.eventType.leaveRoomNotify, this.leaveRoom, this);
        clientEvent.off(clientEvent.eventType.leaveRoomMedNotify, this.leaveRoom, this);
    }
});

cc._RF.pop();