"use strict";
cc._RF.push(module, 'cba0aoJO9BGXozfXiIcdhgR', 'stone');
// game/script/stone.js

"use strict";

// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var GLB = require("Glb");
cc.Class({
    extends: cc.Component,

    properties: {
        clickAudio: {
            default: null,
            url: cc.AudioClip
        },
        stoneSp: {
            default: null,
            type: cc.Sprite
        },
        normalSf: {
            default: null,
            type: cc.SpriteFrame
        },
        clickSf: {
            default: null,
            type: cc.SpriteFrame
        }
    },

    start: function start() {
        // 按住效果--
        this.node.on(cc.Node.EventType.TOUCH_START, this.onClick, this);
    },


    init: function init(data) {
        this.data = data;
        this.stoneSp.spriteFrame = this.normalSf;
    },

    onClick: function onClick() {
        if (Game.GameManager.gameState !== GameState.Play) {
            return;
        }
        if (this.data.ID === Game.PlayerManager.player.jumpRecordId) {
            var exist = Game.PlayerManager.player.jumpPos.some(function (x) {
                return this.data === x;
            }.bind(this));
            if (!exist) {
                cc.audioEngine.play(this.clickAudio, false, 1);
                this.stoneSp.spriteFrame = this.clickSf;
                var msg = {
                    action: GLB.PLAYER_STEP_DATA,
                    data: this.data
                };
                Game.GameManager.sendEventEx(msg);
            }
        }
    },

    onDestroy: function onDestroy() {
        this.node.off("click", this.onClick, this);
    }
});

cc._RF.pop();