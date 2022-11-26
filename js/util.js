'use strict'


// Returns the cell object
function getElCell(pos) {
    return document.querySelector(`[data-i='${pos.i}'][data-j='${pos.j}']`);
}

function buildBoard(rowsCount, colCount) {
    const board = []
    for (var i = 0; i < rowsCount; i++) {
        board[i] = []
        for (var j = 0; j < colCount; j++) {
            var currCell = createCell()
            if (i === rowsCount - 1) currCell.type = GROUND
            board[i][j] = currCell 

        }
    }
    return board
}

// Returns a new cell object. e.g.: {type: SKY, gameObject: ALIEN}
function createCell(gameObject = null) {
    return {
        type: SKY,
        gameObject: gameObject
    }
}

function updateScore(diff) {
    // Update model
    gGame.score += diff
    // Update DOM
    document.querySelector('.counter-box').innerText = `Score: ${gGame.score}`
}

function getImgName(str){
    

}
