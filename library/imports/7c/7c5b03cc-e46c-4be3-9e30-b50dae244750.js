"use strict";
cc._RF.push(module, '7c5b0PM5GxL454wtQ2uJEdQ', 'playerIcon');
// common/lobby/playerIcon.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        playerSprite: {
            default: null,
            type: cc.Sprite
        }
    },
    setData: function setData(userInfo) {
        this.userInfo = userInfo;
        this.playerId = userInfo.id ? userInfo.id : userInfo.userId;
        this.playerSprite.node.active = true;
        clientEvent.on(clientEvent.eventType.playerAccountGet, this.userInfoSet, this);
        Game.GameManager.userInfoReq(this.playerId);
    },

    userInfoSet: function userInfoSet(recvMsg) {
        if (recvMsg.account == this.playerId) {
            if (recvMsg.headIcon && recvMsg.headIcon.indexOf("http") >= 0) {
                cc.loader.load({ url: recvMsg.headIcon, type: 'png' }, function (err, texture) {
                    var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                    this.playerSprite.spriteFrame = spriteFrame;
                }.bind(this));
            }
        }
    },

    onDestroy: function onDestroy() {
        clientEvent.off(clientEvent.eventType.playerAccountGet, this.userInfoSet, this);
    }
});

cc._RF.pop();