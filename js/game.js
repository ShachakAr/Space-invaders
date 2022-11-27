'use strict'

const HERO = 'HERO';
const ALIEN = 'ALIEN';
const LASER = '🔺';
const LASER_X = '🔹'
const SKY = 'SKY'
const GROUND = 'GROUND'
const BUNKER = 'BUNKER'
const ROCK = '↡'

const HERO_IMG = '<img src="imges/hero.png" />'
const HERO_SHILD_IMG = '<img src="imges/hero-shild.png" />'
const ALIEN_IMG = '<img src="imges/alien1.png" />'


// Matrix of cell objects. e.g.: {type: SKY, gameObject: ALIEN}
const BOARD_SIZE = 14;
const ALIENS_ROW_LENGTH = 8
const ALIENS_ROW_COUNT = 3

var gBoard;
var gGame = {
    isOn: false,
    aliensCount: 0,
    score: 0,
    movementDirection: 1,
    isLaserInterval: false,
    isAttackInterval: false

}
//TODO: add candy and freeze intervals
var gCandyInterval;
var gIsFirstclick = true

// Called when game loads
function onInitGame() {
    gBoard = createBoard()
    renderBoard(gBoard)
    updateScore(0)
    // Set stats
    document.querySelector('.lives span').innerHTML = '💚💚💚'
    document.querySelector('.rapid-fire span').innerHTML = '💨💨💨'
    document.querySelector('.shild span').innerHTML = '🕋🕋🕋'
    gGame.isOn = true
    gGame.rapidFireCount = 3
    gGame.livesCount = 3
    gGame.shildsCount = 3
    gGame.movementDirection = 1
    gIsAlienFreeze = false
    gGame.isAttackInterval = false
    gGame.isLaserInterval = false
    gAliensMoveInterval = false
    setContent()
    if (!gIsFirstclick) {
        gAliensMoveInterval = setInterval(moveAliens, ALIEN_SPEED)
    }
}

function onBtnStart() {
    const elBtn = document.querySelector('.button-start')
    const msg = (gGame.isOn) ? 'Restart the invasion' : 'Start the invasion'
    elBtn.innerText = msg
    clearInterval(gAliensMoveInterval)
    clearInterval(gBlinkLaserInterval)
    clearInterval(gAliensAttackInterval)
    gLaserPositions.splice(0, gLaserPositions.length, null)
    gAliensAttacks.splice(0, gAliensAttacks.length, null)
    gIsFirstclick = false

    gHero.isShoot = false
    gHero.isShild = false
    gHero.isRapid = false
    onInitGame()
}

// Create and returns the board with aliens on top, ground at bottom
// use the functions: createCell, createHero, createAliens
function createBoard() {
    const board = buildBoard(BOARD_SIZE, BOARD_SIZE)
    createHero(board)
    createAliens(board)
    return board
}

// Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            // Adding cells type
            var cellClass = (currCell.type === SKY) ? 'sky' : 'ground'

            strHTML += `\t<td data-i='${i}' data-j='${j}' class="cell ${cellClass}" >\n`

            // Adding game elements
            if (currCell.gameObject === ALIEN) {
                var alienImg =
                    strHTML += ALIEN_IMG
            } else if (currCell.gameObject === HERO) {
                var heroImg = (gHero.isShild) ? HERO_SHILD_IMG : HERO_IMG
                strHTML += heroImg
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    // Insert the table to an HTML container
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function gameEnding(str) {
    console.log('You', str, 'the game')
    gGame.isOn = false

    clearInterval(gAliensMoveInterval)
    clearInterval(gBlinkLaserInterval)
    clearInterval(gAliensAttackInterval)
    // clearInterval(gCandyInterval)
    setContent(str)
}

function setContent(str) {
    const elContentSpans = document.querySelectorAll('.content span')
    const elContent = document.querySelector('.content')
    const elInnerText = document.querySelector('.game-end')

    // Display instructions
    if (gGame.isOn) {
        // console.log('elContent :>> ', elContentSpans);
        for (var i = 0; i < elContentSpans.length; i++) {
            const elSpan = elContentSpans[i]
            elSpan.style.display = 'inline'
        }
        elContent.classList.remove('won')
        elContent.classList.remove('lost')
        elInnerText.innerText = ' '
        return

        // Display game end msg
    } else {
        // Hide spans
        for (var i = 0; i < elContentSpans.length; i++) {
            const elSpan = elContentSpans[i]
            // console.log('elSpan :>> ', elSpan);
            elSpan.style.display = 'none'
        }
    }

    // Present won\lost game
    elContent.classList.add(`${str}`)


    const elMsg = (str === 'won') ? 'You won the game! \nThe aliens are gone!' : 'The invaders concured Earth :('
    elInnerText.innerText = elMsg

}


function setLeftAlienIdx() {
    var leftEdge = BOARD_SIZE - 1
    for (var i = gAliensBottomRowIdx; i >= gAliensTopRowIdx; i--) {
        for (var j = BOARD_SIZE - 1; j >= 0; j--) {
            if (gBoard[i][j].gameObject === ALIEN) {
                if (j < leftEdge) leftEdge = j
                if (leftEdge === gLeftEdgeAlien) return
            }
        }
    }
    console.log('leftEdge :>> ', leftEdge);
    gLeftEdgeAlien = leftEdge
}

function setRightAlienIdx() {
    var rightEdge = 0
    for (var i = gAliensBottomRowIdx; i >= gAliensTopRowIdx; i--) {
        for (var j = 0; j <= BOARD_SIZE - 1; j++) {
            if (gBoard[i][j].gameObject === ALIEN) {
                if (j > rightEdge) rightEdge = j
                if (rightEdge === gRightEdgeAlien) return
            }
        }
    }
    console.log('rightEdge :>> ', rightEdge);
    gRightEdgeAlien = rightEdge
}

function setBottomAlienRow() {
    for (var i = gAliensBottomRowIdx; i >= gAliensTopRowIdx; i--) {
        for (var j = 0; j < BOARD_SIZE - 1; j++) {
            if (gBoard[i][j].gameObject === ALIEN) {
                return
            }
        }
        gAliensBottomRowIdx--
    }
}

// position such as: {i: 2, j: 7}
function updateCell(pos, gameObject = null) {
    gBoard[pos.i][pos.j].gameObject = gameObject;
    var elCell = getElCell(pos);
    if (gameObject === HERO) {
        var heroImg = (gHero.isShild) ? eval(HERO + '_SHILD_IMG') : eval(HERO + '_IMG')
        elCell.innerHTML = heroImg
        return
    } else if (gameObject === ALIEN) {
        elCell.innerHTML = ALIEN_IMG
        return
    }
    elCell.innerHTML = gameObject || '';
}