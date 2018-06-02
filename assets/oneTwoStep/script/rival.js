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
            setTimeout(function() {
                cc.audioEngine.play(this.helpClip, false, 0.5);
            }.bind(this), 500);
            this.dead();
        }.bind(this));
    },

    shockDead() {
        this.anim.play("shock");
        this.heart--;
        this.hpBarSet();
        if (this.heart <= 0) {
            // 游戏结束--
            Game.GameManager.result = true;
            Game.GameManager.gameOver();
        } else {
            setTimeout(function() {
                this.reborn();
            }.bind(this), 1000);
        }
    },

    dead: function() {
        this.heart--;
        this.hpBarSet();
        if (this.heart <= 0) {
            // 游戏结束--
            Game.GameManager.result = true;
            clientEvent.dispatch(clientEvent.eventType.gameOver);
        } else {
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
        var data = dataFunc.queryByID("roadTemplate", this.jumpRecordId - 1);
        var x = Game.RoadManager.offsetX * (data.row - 1);
        var y = Game.RoadManager.offsetY * (data.line - 1);
        this.node.position = new cc.Vec2(x, y);
        this.anim.play("reborn");
    },

    speedUpNotify: function() {
        this.jumpDurTime /= Game.RoadManager.speedUpPercent;
        console.log("jumpDurTime:" + this.jumpDurTime);
    },

    update() {
        if (this.jumpPos && this.jumpPos.length > 0) {
            var data = this.jumpPos.shift();
            var x = Game.RoadManager.offsetX * (data.row - 1);
            var y = Game.RoadManager.offsetY * (data.line - 1);
            if (data.isDown) {
                this.jumpDown(cc.p(x, y));
            } else if (data.isDeadLine) {
                this.shockDead();
            } else {
                this.jump(cc.p(x, y));
            }
            this.jumpRecordId++;
        }
    }
});
