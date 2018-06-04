var obj = {
    RANDOM_MATCH: 1,  // 随机匹配
    PROPERTY_MATCH: 2,  // 属性匹配
    MAX_PLAYER_COUNT: 2,
    PLAYER_COUNTS: [2],
    COOPERATION: 1,
    COMPETITION: 2,
    GAME_START_EVENT: "gameStart",
    GAME_TIME: "gameTime",
    READY: "ready",
    ROUND_START: "roundStart",
    PLAYER_STEP_DATA: "playerStep",
    ROAD_DATA: "roadData",
    SCORE_DATA: "scoreData",
    PLAYER_SPEED_UP_EVENT: "playerSpeedUp",
    GAME_OVER_EVENT: "gameOver",

    channel: 'MatchVS',
    platform: 'alpha',

    gameId: 201372,
    gameVersion: 1,
    appKey: '9a93e36777004e98905a7e66d0808a42',
    secret: 'daf7049c6e3e48e08bfe90abd5b77b0e',

    gameType: 2,
    matchType: 1,
    tagsInfo: { "title": "A" },
    userInfo: null,
    playerUserIds: [],
    playerSet: new Set(),
    isRoomOwner: false,
    events: {},

    syncFrame: true,
    FRAME_RATE: 20,
    roomId: 0,
    playertime: 180,
    isGameOver: false
};
module.exports = obj;