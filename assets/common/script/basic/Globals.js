window.Game = {
    GameManager: null,
    PlayerManager: null
}

window.GameState = cc.Enum({
    None: 0,
    Pause: 1,
    Play: 2,
    Over: 3,
    End: 4
})

window.PlayerState = cc.Enum({
    Jump: -1,
    Stand: -1,
    Dead: -1
})
