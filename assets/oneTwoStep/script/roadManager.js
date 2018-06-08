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
        stonePrefab: {
            default: null,
            type: cc.Prefab
        },

        offsetX: 0, // 石块X偏移
        offsetY: 0, // 石块Y偏移

        stoneSpeed: 0, // 石头速度--
        accDurTime: 10, // 加速间隔时间--
        speedUpPercent: 1.1, // 加速比
        waterBG: cc.Node,
        deadLine: cc.Node
    },

    onLoad() {
        Game.RoadManager = this;
        this.roadId = 0;
        this.roadDatas = [];
        this.curLeftAccTime = this.accDurTime;
        this.roadPool = new cc.NodePool();
        this.spawnTriggerDis = 3 * this.offsetY;
        this.stones = [];
        this.waterBG.on(cc.Node.EventType.TOUCH_START, this.onClickWater, this);
        this.deadLineAnim = this.deadLine.getComponent(cc.Animation);
    },

    initRoad() {
        for (var i = 0; i < 25; i++) {
            this.spawnStone();
        }
    },

    deadLineWarn: function() {
        var animState = this.deadLineAnim.getAnimationState(this.deadLineAnim.defaultClip.name);
        if (!animState.isPlaying) {
            this.deadLineAnim.play();
        }
    },

    onClickWater: function(event) {
        if (Game.GameManager.gameState !== GameState.Play) {
            return;
        }
        var position = this.node.convertToNodeSpaceAR(event.getLocation());
        var player = Game.PlayerManager.player;
        if (position.y < player.node.y + (this.offsetX / 2)) {
            return;
        }

        var data = Game.RoadManager.roadDatas.find(function(temp) {
            return temp.ID === player.jumpRecordId;
        }.bind(this));

        var targetRow = 0;
        var minDistance = Number.MAX_VALUE;
        for (var i = 1; i <= 4; i++) {
            if (i !== data.row) {
                var x = this.offsetX * (i - 1);
                var distance = Math.abs(position.x - x);
                if (distance < minDistance) {
                    minDistance = distance;
                    targetRow = i;
                }
            }
        }

        var fakeData = {
            ID: 0,
            line: data.line,
            row: targetRow,
            isDown: true
        }
        Game.PlayerManager.player.jumpPos.push(fakeData);

        var msg = {
            action: GLB.PLAYER_STEP_DATA,
            data: fakeData
        };
        Game.GameManager.sendEvent(msg);
    },

    spawnStoneNotify: function(data) {
        this.roadDatas.push(data);
        var stone = this.roadPool.get();
        if (!stone) {
            stone = cc.instantiate(this.stonePrefab);
        }
        stone.parent = this.node;
        stone.x = this.offsetX * (data.row - 1);
        stone.y = this.offsetY * (data.line - 1);

        stone.setSiblingIndex(0);
        var stoneComponent = stone.getComponent("stone");
        stoneComponent.init(data);
        this.stones.push(stone);
    },

    spawnStone: function() {
        this.roadId++;
        if (GLB.isRoomOwner) {
            var data = {
                ID: this.roadId,
                line: this.roadId + 1,
                row: dataFunc.randomNum(1, 4)
            }
            var msg = {
                action: GLB.ROAD_DATA,
                data: data
            };
            Game.GameManager.sendEventEx(msg);
        }
    },

    recycleStone: function(obj) {
        this.roadPool.put(obj);
        this.spawnStone();
    },

    speedUp: function() {
        this.stoneSpeed *= this.speedUpPercent;
    },

    deadSlowdown: function() {
        this.stoneSpeed *= 0.75;
    },

    update(dt) {
        if (Game.GameManager.gameState !== GameState.Play) {
            return;
        }
        this.curLeftAccTime -= dt;
        if (this.curLeftAccTime < 0) {
            this.curLeftAccTime = this.accDurTime;
            this.speedUp();
            Game.PlayerManager.player.speedUp();
        }
        var moveDis = this.stoneSpeed * dt;
        this.node.y -= moveDis;
        this.spawnTriggerDis -= moveDis;
        if (this.spawnTriggerDis < 0) {
            this.spawnTriggerDis = this.offsetY;
            this.spawnStone();
            var stone = this.stones.shift();
            if (stone) {
                this.recycleStone(stone);
            }
        }
    },
});
