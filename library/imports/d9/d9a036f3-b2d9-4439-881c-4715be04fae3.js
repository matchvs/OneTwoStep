"use strict";
cc._RF.push(module, 'd9a03bzstlEOYgcRxW+BPrj', 'player');
// game/script/player.js

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
        },

        redAnim: {
            default: null,
            type: cc.Animation
        }
    },

    start: function start() {
        clientEvent.on(clientEvent.eventType.gameOver, this.gameOver, this);
    },
    gameOver: function gameOver() {
        if (!Game.GameManager.result) {
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
                cc.audioEngine.play(this.helpClip, false, 1);
            }.bind(this), 500);
            this.dead();
        }.bind(this));
    },

    dead: function dead() {
        this.playerState = PlayerState.Dead;
        this.heart--;
        this.hpBarSet();
        this.redAnim.play();
        if (this.heart <= 0) {
            // 游戏结束--
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
        } else {
            Game.GameManager.gameState = GameState.Pause;
            Game.RoadManager.deadSlowdown();
            // 进入复活--
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

            this.playerState = PlayerState.Stand;
            this.anim.play("reborn");

            setTimeout(function () {
                if (Game.GameManager.gameState === GameState.Pause) {
                    Game.GameManager.gameState = GameState.Play;
                }
            }, 2000);

            this.jumpPos = [];
            this.jumpRecordId += 2;
        }
    },

    speedUp: function speedUp() {
        this.jumpDurTime /= Game.RoadManager.speedUpPercent;
        console.log("jumpDurTime:" + this.jumpDurTime);
        var msg = {
            action: GLB.PLAYER_SPEED_UP_EVENT
        };
        Game.GameManager.sendEvent(msg);
    },

    stopDead: function stopDead() {
        this.heart--;
        this.hpBarSet();
        if (this.heart <= 0) {
            Game.GameManager.result = false;
            clientEvent.dispatch(clientEvent.eventType.gameOver);
        }
    },
    update: function update(dt) {
        if (Game.GameManager.gameState !== GameState.Play) {
            return;
        }
        this.curStopTime += dt;
        if (this.curStopTime > this.stopTime) {
            this.curStopTime = 0;
            this.stopDead();
        }
        var worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        if (worldPos.y < 0) {
            this.curStopTime = 0;
            Game.RoadManager.deadLineWarn();
            this.dead();
            var fakeData = {
                ID: 0,
                isDeadLine: true
            };
            var msg = {
                action: GLB.PLAYER_STEP_DATA,
                data: fakeData
            };
            this.anim.play("shock");
            Game.GameManager.sendEvent(msg);
        } else if (this.playerState === PlayerState.Stand && this.jumpPos && this.jumpPos.length > 0) {
            this.curStopTime = 0;
            var data = this.jumpPos.shift();

            if (this.jumpRecordId === data.ID) {
                var x1 = Game.RoadManager.offsetX * (data.row - 1);
                var y1 = Game.RoadManager.offsetY * (data.line - 1);
                this.jump(cc.p(x1, y1));

                this.jumpRecordId++;
            } else {
                var x2 = Game.RoadManager.offsetX * (data.row - 1);
                var y2 = Game.RoadManager.offsetY * (data.line - 1);
                this.jumpDown(cc.p(x2, y2));
            }
        }
    },
    onDestroy: function onDestroy() {
        clientEvent.off(clientEvent.eventType.gameOver, this.gameOver, this);
    }
});

cc._RF.pop();