'use strict'

const ALIEN_SPEED = 2000
const ALIEN_ATTACK_SPEED = 1000
var gAliensInterval;
var gAliensAttackInterval;
const gAliensAttacks = []

var gAliensTopRowIdx;
var gAliensBottomRowIdx;
var gLeftEdgeAlien;
var gRightEdgeAlien;


var gIsAlienFreeze;

function createAliens(board) {
    gAliensTopRowIdx = 1
    gAliensBottomRowIdx = ALIENS_ROW_COUNT
    gLeftEdgeAlien = 0
    gRightEdgeAlien = ALIENS_ROW_LENGTH - 1
    for (var i = gAliensTopRowIdx; i <= ALIENS_ROW_COUNT; i++) {
        for (var j = 0; j < ALIENS_ROW_LENGTH; j++) {
            const currCell = board[i][j]
            currCell.gameObject = ALIEN
            gGame.aliensCount++
        }
    }
}

function handleAlienHit(pos) {
    // console.log('Hit')

    updateScore(10)
    gGame.aliensCount--
    updateCell(pos, null)

    // set edges if needed
    setRightAlienIdx()
    setLeftAlienIdx()
    setBottomAlienRow()
    if (gLeftEdgeAlien === 13 && gRightEdgeAlien === 0) gameEnding('won')

}

// Moving the aliens
function moveAliens() {
    if (gIsAlienFreeze || !gGame.isOn) return
    // Moving right
    if (gGame.movementDirection > 0) {
        // End of board
        if (gRightEdgeAlien === BOARD_SIZE - 1) {
            shiftBoardDown(gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)
        } else {
            shiftBoardRight(gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)
        }
    } else {
        // Moving left    
        // End of board 
        if (gLeftEdgeAlien === 0) {
            shiftBoardDown(gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)
        } else {
            shiftBoardLeft(gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)
        }
    }

}

function shiftBoardRight(board, fromI, toI) {
    for (var i = fromI; i <= toI; i++) {
        for (var j = gRightEdgeAlien; j >= gLeftEdgeAlien; j--) {
            if (board[i][j].gameObject === null) continue
            const pos = { i: i, j: j }
            // Remove alien from currPos
            updateCell(pos, null)
            // Move alien right
            pos.j++
            updateCell(pos, ALIEN)
            if (i === toI) {
                if (Math.random() <= 0.1) alienAttack(pos)
            } 
        }
    }
    gLeftEdgeAlien++
    gRightEdgeAlien++
}

function shiftBoardLeft(board, fromI, toI) {
    for (var i = fromI; i <= toI; i++) {
        for (var j = gLeftEdgeAlien; j <= gRightEdgeAlien; j++) {
            if (board[i][j].gameObject === null) continue
            const pos = { i: i, j: j }
            // Remove alien from currPos
            updateCell(pos, null)
            // Move alien down
            pos.j--
            updateCell(pos, ALIEN)
            if (i === toI) {
                if (Math.random() <= 0.1) alienAttack(pos)
            } 
        }
    }
    gLeftEdgeAlien--
    gRightEdgeAlien--
}

function shiftBoardDown(board, fromI, toI) {
   
    // If the aliens lended
    if (toI + 1 === BOARD_SIZE - 2) {
        gameEnding('lost')
        return
    }

    // Loop the rows of alieans bottom to top
    for (var i = toI; i >= fromI; i--) {
        // Loop to move each alien left to right
        for (var j = gLeftEdgeAlien; j <= gRightEdgeAlien; j++) {
            if (board[i][j].gameObject === null) continue
            const pos = { i: i, j: j }
            // Remove alien from currPos
            updateCell(pos, null)
            // Move alien down
            pos.i++
            updateCell(pos, ALIEN)
        }
    }
    gAliensBottomRowIdx++
    gAliensTopRowIdx++
    gGame.movementDirection *= -1
}


function alienAttack (pos){
    console.log('Alien attack')
    // Show rock
    pos.i++
    updateCell(pos, ROCK)
    
    // Add rock to array
    gAliensAttacks.push(pos)

    if (!gGame.isAttackInterval) {
        gGame.isAttackInterval = true
        // Move rocks
        gAliensAttackInterval = setInterval(() => {
            for (var i = 0; i < gAliensAttacks.length; i++){
                // if the first rock hit something
                if (gAliensAttacks[0] === null){
                    gAliensAttacks.splice(0, 1)
                    if (gAliensAttacks.length === 0) {
                        clearInterval(gAliensAttackInterval)
                        gGame.isAttackInterval = false
                        return
                    } else {
                        i--
                        continue
                    }
                }
                blinkAttack(i)
            }
            
        }, ALIEN_ATTACK_SPEED);
    }


}

function blinkAttack (idx){

    const currAlienRock = gAliensAttacks[idx]
    const nextCellContent = gBoard[currAlienRock.i + 1][currAlienRock.j]
    // Remove rock
    updateCell(currAlienRock, null)
    
    // Next cell is empty
    if (nextCellContent.gameObject === null){
        if (nextCellContent.type === GROUND){
            gAliensAttacks.splice(idx, 1, null)
            return
        }
        // Show rock
        currAlienRock.i++
        updateCell(currAlienRock, ROCK)
        return
    } 
    // Next cell has gameObject
    else if (nextCellContent.gameObject === HERO){
        handleHeroHit()
    } else if (nextCellContent.gameObject === BUNKER){
        handleBunkerHit()  
    }
    // Only optinos left is LASER, and the rock vanish
    gAliensAttacks.splice(idx, 1, null)


}

function handleBunkerHit (){
    console.log('hi')
}