var mvs = require("Matchvs");
var GLB = require("Glb");

cc.Class({
    extends: cc.Component,
    onLoad() {
        Game.GameManager = this;
        cc.game.addPersistRootNode(this.node);
        cc.director.getCollisionManager().enabled = true;
        clientEvent.init();
        dataFunc.loadConfigs();
        this.matchVsInit();
        uiFunc.openUI("uiMaskLayout", function() {
        });

        this.gameState = GameState.None;
        this.gameTime = Game.GameSeconds;
        clientEvent.on(clientEvent.eventType.gameOver, function() {
            // 打开结算界面--
            console.log("游戏结束");
            Game.GameManager.gameState = GameState.Over;
        }, this);

        mvs.response.sendEventNotify = this.sendEventNotify.bind(this);
    },

    startGame: function() {
        cc.director.loadScene('game', function() {
            uiFunc.openUI("uiGamePanel", function() {
                this.gameState = GameState.Play;
            }.bind(this));
        }.bind(this));
    },


    matchVsInit: function() {
        mvs.response.initResponse = this.initResponse.bind(this);
        mvs.response.errorResponse = this.errorResponse.bind(this);
        var result = mvs.engine.init(mvs.response, GLB.channel, GLB.platform, GLB.gameId);
        if (result !== 0) {
            console.log('初始化失败,错误码:' + result);
        }
    },

    errorResponse: function(error) {
        console.log("错误信息：" + error);
    },

    initResponse: function() {
        console.log('初始化成功，开始注册用户');
        mvs.response.registerUserResponse = this.registerUserResponse.bind(this); // 用户注册之后的回调
        var result = mvs.engine.registerUser();
        if (result !== 0) {
            console.log('注册用户失败，错误码:' + result);
        } else {
            console.log('注册用户成功');
        }
    },

    registerUserResponse: function(userInfo) {
        var deviceId = 'abcdef';
        var gatewayId = 0;
        GLB.userInfo = userInfo;

        console.log('开始登录,用户Id:' + userInfo.id)

        mvs.response.loginResponse = this.loginResponse.bind(this); // 用户登录之后的回调
        var result = mvs.engine.login(
            userInfo.id, userInfo.token,
            GLB.gameId, GLB.gameVersion,
            GLB.appKey, GLB.secret,
            deviceId, gatewayId
        );
        if (result !== 0) {
            console.log('登录失败,错误码:' + result);
        }
    },

    loginResponse: function(info) {
        if (info.status !== 200) {
            console.log('登录失败,异步回调错误码:' + info.status);
        } else {
            console.log('登录成功');
            this.lobbyShow();
        }
    },

    lobbyShow: function() {
        uiFunc.openUI("uiLobbyPanel");
    },

    // 玩家行为通知--
    sendEventNotify: function(info) {
        var cpProto = JSON.parse(info.cpProto);
        if (info.cpProto.indexOf(GLB.GAME_START_EVENT) >= 0) {
            GLB.playerUserIds = [GLB.userInfo.id]
            var remoteUserIds = JSON.parse(info.cpProto).userIds;
            remoteUserIds.forEach(function(id) {
                if (GLB.userInfo.id !== id) {
                    GLB.playerUserIds.push(id);
                }
            });
            this.startGame();
        }

        if (info.cpProto.indexOf(GLB.PLAYER_STEP_DATA) >= 0) {
            if (info.srcUserId !== GLB.userInfo.id) {
                Game.PlayerManager.rival.jumpPos.push(cpProto.data);
            }
        }

        if (info.cpProto.indexOf(GLB.PLAYER_SPEED_UP_EVENT) >= 0) {
            if (info.srcUserId !== GLB.userInfo.id) {
                Game.PlayerManager.rival.speedUpNotify();
            }
        }

        if (info.cpProto.indexOf(GLB.GAME_OVER_EVENT) >= 0) {
            clientEvent.dispatch(clientEvent.eventType.gameOver);
        }
    },

    sendEventEx: function(msg) {
        var result = mvs.engine.sendEventEx(0, JSON.stringify(msg), 0, GLB.playerUserIds);
        if (result.result !== 0) {
            console.log(msg.action, result.result);
        }
    },

    sendEvent: function(msg) {
        var result = mvs.engine.sendEvent(JSON.stringify(msg));
        if (result.result !== 0) {
            console.log(msg.action, result.result);
        }
    }
});
