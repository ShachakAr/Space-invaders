'use strict'

const LASER_SPEED = 80;

var gHero = {
    pos: { i: 12, j: 5 },
    isShoot: false,
    isRapid: false,
    isShild: false
};

var gBlinkLaserInterval;

const gLaserPositions = []

// creates the hero and place it on board
function createHero(board) {
    const currCell = board[gHero.pos.i][gHero.pos.j]
    currCell.gameObject = HERO
}

// Handle game keys
function onKeyDown(event) {
    // console.log(event.key)
    if (gIsFirstclick) return

    switch (event.key) {
        case 'ArrowLeft':
            moveHero(-1)
            break
        case 'ArrowRight':
            moveHero(1)
            break
        case ' ':
            shoot()
            break
        case 'n':
            explodeProjectile()
            break
        case 'x':
            rapidFire()
            break
        case 'z':
            shild()
            break

    }
}

// Move the hero right (1) or left (-1)
function moveHero(dir) {
    if (!gGame.isOn) return
    if (gHero.pos.j + dir < 0 || gHero.pos.j + dir > BOARD_SIZE - 1) dir = 0
    // Moving from
    updateCell(gHero.pos, null)
    gHero.pos.j += dir
    // Moving to
    updateCell(gHero.pos, HERO)

}


// Sets an interval for shutting (blinking) the laser up towards aliens
function shoot() {

    if (gHero.isRapid) {
        gHero.isShoot = false
    }
    // there an active laser/ game-over
    if (gHero.isShoot || !gGame.isOn) return

    gHero.isShoot = true
    const laserNextPos = { i: gHero.pos.i - 1, j: gHero.pos.j }
    // add laser location to the array
    gLaserPositions.push(laserNextPos)

    // if there is no active interval
    if (!gGame.isLaserInterval) {
        const laserSpeed = gHero.isRapid ? LASER_SPEED * 1.5 : LASER_SPEED
        gGame.isLaserInterval = true
        gBlinkLaserInterval = setInterval(() => {
            for (var i = 0; i < gLaserPositions.length; i++) {

                if (gLaserPositions[0] === null) {
                    gLaserPositions.splice(0, 1)
                    if (gLaserPositions.length === 0) {
                        clearInterval(gBlinkLaserInterval)
                        gGame.isLaserInterval = false
                        return
                    } else {
                        i--
                        continue
                    }
                }

                blinkLaser(gLaserPositions[i], i)
                if (gLaserPositions[i] !== null) gLaserPositions[i].i--
            }
        }, laserSpeed)

    }
    else { console.log('there is an interval runing') }

}

// Update livesCount / gameOver
function handleHeroHit() {
    console.log('hero hit')
    if (gHero.isShild) return
    
    gGame.livesCount--
    var livesStr = ''
    for (var i = 0; i < gGame.livesCount; i++) {
        livesStr += '💚'
    }
    const elLivesSpan = document.querySelector('.lives span')
    elLivesSpan.innerHTML = livesStr
    if (gGame.livesCount === 0)  gameEnding('lose')
}

function shild(){
    console.log('shild on')
    if (gGame.shildsCount === 0) return
    var shildsStr =''
    gGame.shildsCount--
    for (var i = 0; i < gGame.shildsCount; i++){
        shildsStr += '🕋'
    }
    const elShildsSpan = document.querySelector('.shild span')
    elShildsSpan.innerHTML = shildsStr
    gHero.isShild = true
    setTimeout(() => {
       gHero.isShild = false
    }, 3000);
}

function rapidFire() {
    if (gGame.rapidFireCount < 1) return
    gGame.rapidFireCount--
    var rapidFireStr = ''
    for (var i = 0; i < gGame.rapidFireCount; i++) {
        rapidFireStr += '💨'
    }
    const elRapidFireSpan = document.querySelector('.rapid-fire span')
    // console.log('elRapidFireSpan :>> ', elRapidFireSpan);
    elRapidFireSpan.innerHTML = rapidFireStr

    gHero.isRapid = true
    // Set 
    setTimeout(() => {
        gHero.isRapid = false
    }, 3000);
}

function explodeProjectile() {
    if (!gHero.isShoot || gHero.isRapid) return
    // stop laser movment
    clearInterval(gBlinkLaserInterval)
    gGame.isLaserInterval = false
    // Run loop to find negs
    explodeAlienNegs(gLaserPositions[0].i, gLaserPositions[0].j, gBoard)
    // Clear laserpos array
    gLaserPositions.splice(0, 1, null)
    // console.log(gLaserPositions)
}

function explodeAlienNegs(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].gameObject === ALIEN) handleAlienHit({ i: i, j: j })
            updateCell({ i: i, j: j }, null)
        }
    }
    gHero.isShoot = false
}

// renders a LASER at specific cell for short time and removes it
function blinkLaser(nextPos, idx) {
    const laserImg = (gHero.isRapid) ? LASER_X : LASER

    // Hitting the end of the board
    if (nextPos.i < 0) {
        gHero.isShoot = false
        nextPos.i++
        updateCell(nextPos, null)
        // Remove laser from the positions array
        gLaserPositions.splice(idx, 1, null)
        return
    }

    const nextCell = gBoard[nextPos.i][nextPos.j]
    const lastPos = { i: nextPos.i + 1, j: nextPos.j }

    // Hitting empty cell
    if (!nextCell.gameObject) {
        // Show laser
        updateCell(nextPos, laserImg)
        // Remove laser from last cell
        if (gBoard[lastPos.i][lastPos.j].gameObject === HERO) return
        updateCell(lastPos, null)
        return

        // hitting a laser   
    } else if (nextCell.gameObject === LASER) {
        // Show laser
        updateCell(nextPos, laserImg)
        // Remove laser from last cell
        if (gBoard[lastPos.i][lastPos.j].gameObject === HERO) return
        updateCell(lastPos, null)
        // Remove laser from the positions array
        gLaserPositions.splice(idx - 1, 1, null)
        return

    } else if (nextCell.gameObject === ALIEN) {
        // Remove laser from last cell
        gHero.isShoot = false
        updateCell(lastPos, null)
        // Remove alien and acts accordingly
        handleAlienHit(nextPos)
        // Remove laser from the positions array
        gLaserPositions.splice(idx, 1, null)

        return

    } else if (nextCell.gameObject === BUNKER) {
        console.log('You hit a bunker wall')
        gHero.isShoot = false

        // Remove laser from the positions array
        gLaserPositions.splice(idx, 1, null)

        return
    } else if (nextCell.gameObject === ROCK) {
        gHero.isShoot = false
        // Remove laser from last cell
        updateCell(lastPos, null)
        // Remove ROCK
        updateCell(nextPos, null)
        // Remove rock from array
        const rockIdx = gAliensAttacks.findIndex(object => {
            return (object.i === nextPos.i && object.j === nextPos.j)

        })
        gAliensAttacks.splice(rockIdx, 1, null)
        // Remove laser from the positions array
        gLaserPositions.splice(idx, 1, null)

    }
}

