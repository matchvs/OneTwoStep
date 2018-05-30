var GLB = require("Glb");
cc.Class({
    extends: cc.Component,
    properties: {
        heartNodes: [cc.Node],
        jumpDownClip: {
            default: "",
            url: cc.AudioClip
        }
    },

    init: function(playerId) {
        this.playerId = playerId;
        this.heart = 3;
        this.playerState = PlayerState.Stand;
        this.anim = this.node.getComponent(cc.Animation);
        this.jumpPos = [];
        this.jumpRecordId = 1;
        this.jumpDurTime = 0.5;
    },

    jump: function(pos, callBack) {
        this.playerState = PlayerState.Jump;
        if (Math.abs(this.node.x - pos.x) < 1) {
            this.anim.play("jumpForward");
        } else if (this.node.x - pos.x < 0) {
            this.anim.play("jumpRight");
        } else {
            this.anim.play("jumpLeft");
        }

        var action = cc.moveTo(this.jumpDurTime, pos);
        var finished = cc.callFunc(function() {
            this.anim.play("stand");
            this.playerState = PlayerState.Stand;
            if (callBack) {
                callBack();
            }
        }.bind(this));
        var myAction = cc.sequence(action, finished);
        this.node.runAction(myAction);
    },

    jumpDown: function(pos) {
        this.jump(pos, function() {
            this.anim.play("down");
            cc.audioEngine.play(this.jumpDownClip, false, 1);
            this.dead();
        }.bind(this));
    },

    dead: function() {
        this.playerState = PlayerState.Dead;
        this.heart--;
        this.hpBarSet();
        if (this.heart <= 0) {
            // 游戏结束--
            Game.GameManager.result = false;
            clientEvent.dispatch(clientEvent.eventType.gameOver);
        } else {
            Game.GameManager.gameState = GameState.Pause;
            // 进入复活--
            setTimeout(function() {
                this.reborn();
            }.bind(this), 1000);
        }
    },

    hpBarSet() {
        for (var i = 0; i < this.heartNodes.length; i++) {
            if (i < this.heart) {
                this.heartNodes[i].active = true;
            } else {
                this.heartNodes[i].active = false;
            }
        }
    },

    reborn: function() {
        var data = dataFunc.queryByID("roadTemplate", this.jumpRecordId);
        var x = Game.RoadManager.offsetX * (data.row - 1);
        var y = Game.RoadManager.offsetY * (data.line - 1);
        this.node.position = new cc.Vec2(x, y);

        this.playerState = PlayerState.Stand;
        this.anim.play("reborn");

        setTimeout(function() {
            if (Game.GameManager.gameState === GameState.Pause) {
                Game.GameManager.gameState = GameState.Play;
            }
        }, 1000);

        this.jumpPos = [];
        this.jumpRecordId++;
    },

    speedUp: function() {
        this.jumpDurTime /= Game.RoadManager.speedUpPercent;
        console.log("jumpDurTime:" + this.jumpDurTime);
        var msg = {
            action: GLB.PLAYER_SPEED_UP_EVENT
        };
        Game.GameManager.sendEvent(msg);
    },

    update() {
        if (Game.GameManager.gameState !== GameState.Play) {
            return;
        }
        var worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        if (worldPos.y < 200) {
            Game.RoadManager.deadLineWarn();
        }
        if (worldPos.y < 0) {
            this.dead();
            var fakeData = {
                ID: 0,
                isDeadLine: true
            }
            var msg = {
                action: GLB.PLAYER_STEP_DATA,
                data: fakeData
            };
            Game.GameManager.sendEvent(msg);
        } else if (this.playerState === PlayerState.Stand
            && this.jumpPos && this.jumpPos.length > 0) {
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
    }
});
