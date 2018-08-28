"use strict";
cc._RF.push(module, '455a310SeFHiqMyhHI1dATU', 'rival');
// game/script/rival.js

"use strict";

var GLB = require("Glb");
cc.Class({
    extends: cc.Component,
    properties: {
        heartNodes: [cc.Node],
        helpClip: {
            default: "",
            url: cc.AudioClip
        },
        jumpDownClip: {
            default: "",
            url: cc.AudioClip
        }
    },

    start: function start() {
        clientEvent.on(clientEvent.eventType.gameOver, this.gameOver, this);
    },
    gameOver: function gameOver() {
        if (Game.GameManager.result) {
            this.heart = 0;
            this.hpBarSet();
        }
    },


    init: function init(playerId) {
        this.stopTime = 15;
        this.curStopTime = 0;
        this.playerId = playerId;
        this.heart = 3;
        this.playerState = PlayerState.Stand;
        this.anim = this.node.getComponent(cc.Animation);
        this.jumpPos = [];
        this.jumpRecordId = 1;
        this.jumpDurTime = 0.5;
    },

    jump: function jump(pos, callBack) {
        this.playerState = PlayerState.Jump;
        if (Math.abs(this.node.x - pos.x) < 1) {
            this.anim.play("jumpForward");
        } else if (this.node.x - pos.x < 0) {
            this.anim.play("jumpRight");
        } else {
            this.anim.play("jumpLeft");
        }

        var action = cc.moveTo(this.jumpDurTime, pos);
        var finished = cc.callFunc(function () {
            this.anim.play("stand");
            this.playerState = PlayerState.Stand;
            if (callBack) {
                callBack();
            }
        }.bind(this));
        var myAction = cc.sequence(action, finished);
        this.node.runAction(myAction);
    },

    jumpDown: function jumpDown(pos) {
        this.jump(pos, function () {
            this.anim.play("down");
            cc.audioEngine.play(this.jumpDownClip, false, 1);
            setTimeout(function () {
                cc.audioEngine.play(this.helpClip, false, 0.5);
            }.bind(this), 500);
            this.dead();
        }.bind(this));
    },

    shockDead: function shockDead() {
        this.anim.play("shock");
        this.heart--;
        this.hpBarSet();
        if (this.heart <= 0) {
            // 游戏结束--
            Game.GameManager.result = true;
            clientEvent.dispatch(clientEvent.eventType.gameOver);
        } else {
            setTimeout(function () {
                this.reborn();
            }.bind(this), 1000);
        }
    },
    stopDead: function stopDead() {
        this.heart--;
        this.hpBarSet();
        if (this.heart <= 0) {
            Game.GameManager.gameState = GameState.Pause;
            var self = Game.PlayerManager.player;
            var rival = Game.PlayerManager.rival;
            var selfScore = self.jumpRecordId + self.jumpPos.length;
            var rivalScore = rival.jumpRecordId + rival.jumpPos.length;
            var msg = {
                action: GLB.GAME_OVER_EVENT,
                playerId: this.playerId,
                selfScore: selfScore,
                rivalScore: rivalScore
            };
            Game.GameManager.sendEventEx(msg);
        }
    },


    dead: function dead() {
        this.heart--;
        this.hpBarSet();
        if (this.heart <= 0) {
            // 游戏结束--
            Game.GameManager.result = true;
            clientEvent.dispatch(clientEvent.eventType.gameOver);
        } else {
            setTimeout(function () {
                if (Game.GameManager.gameState !== GameState.Over) {
                    this.reborn();
                }
            }.bind(this), 1000);
        }
    },

    hpBarSet: function hpBarSet() {
        for (var i = 0; i < this.heartNodes.length; i++) {
            if (i < this.heart) {
                this.heartNodes[i].active = true;
            } else {
                this.heartNodes[i].active = false;
            }
        }
    },


    reborn: function reborn() {
        if (Game.RoadManager.roadDatas) {
            var data = Game.RoadManager.roadDatas.find(function (temp) {
                return temp.ID === this.jumpRecordId + 1;
            }.bind(this));

            var x = Game.RoadManager.offsetX * (data.row - 1);
            var y = Game.RoadManager.offsetY * (data.line - 1);
            this.node.position = new cc.Vec2(x, y);
            this.anim.play("reborn");

            this.jumpPos = [];
            this.jumpRecordId += 2;
        }
    },

    speedUpNotify: function speedUpNotify() {
        this.jumpDurTime /= Game.RoadManager.speedUpPercent;
        this.stopTime /= Game.RoadManager.speedUpPercent;
        if (this.stopTime < 10) {
            this.stopTime = 10;
        }
        console.log("jumpDurTime:" + this.jumpDurTime);
    },

    update: function update(dt) {
        if (Game.GameManager.gameState === GameState.Over || Game.GameManager.gameState === GameState.None) {
            return;
        }
        this.curStopTime += dt;
        if (this.curStopTime > this.stopTime) {
            this.curStopTime = 0;
            this.stopDead();
        }
        if (this.jumpPos && this.jumpPos.length > 0) {
            this.curStopTime = 0;

            console.log("敌人跳：" + this.jumpRecordId);
            var data = this.jumpPos.shift();
            var x = Game.RoadManager.offsetX * (data.row - 1);
            var y = Game.RoadManager.offsetY * (data.line - 1);
            if (data.isDown) {
                this.jumpDown(cc.p(x, y));
            } else if (data.isDeadLine) {
                this.shockDead();
            } else {
                this.jump(cc.p(x, y));
                this.jumpRecordId++;
            }
        }
    },
    onDestroy: function onDestroy() {
        clientEvent.off(clientEvent.eventType.gameOver, this.gameOver, this);
    }
});

cc._RF.pop();