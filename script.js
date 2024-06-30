const PLAYFIELD_COLUMNS = 10
const PLAYFIELD_ROWS    = 20

const TETROMINO_NAMES = [
    'O',
    'I',
    'L',
    'J',
    'T',
    'Z',
    'S',
]

const TETROMINOES = {
    'O' : [
        [1, 1], 
        [1, 1],
    ],
    'I' : [
        [1],
        [1], 
        [1], 
        [1], 
    ],
    'L' : [
        [1, 0,], 
        [1, 0,], 
        [1, 1,], 
    ],
    'J' : [
        [0, 1,], 
        [0, 1,], 
        [1, 1,], 
    ], 
    'T' : [
        [1, 1, 1],
        [0, 1, 0], 
    ],   
    'Z' : [
        [1, 1, 0],
        [0, 1, 1], 
    ], 
    'S' : [
        [0, 1, 1],
        [1, 1, 0], 
    ],  
}

function getMatrixWidth(matrix) {
    if (matrix.length > 0) 
        return matrix[0].length
    else 
        return 0  
}

function getMatrixHeight(matrix) {
    return matrix.length
}

const tetrominoBase = {
    name: '',
    matrix: [],
    col: 0,
    row: 0,
    touchdown: false,
}

function generatePlayfieldElements(){
    for(let i = 0; i < PLAYFIELD_COLUMNS * PLAYFIELD_ROWS; i++){
        const div = document.createElement('div')
        document.querySelector('.tetris').append(div)
    }
    return document.querySelectorAll('.tetris div')
}

function getRandomTetrominoName() {
    const num = Math.floor(Math.random() * TETROMINO_NAMES.length)
    return TETROMINO_NAMES[num]
}

function generateTetromino() {
    const name = getRandomTetrominoName()
    const matrix = TETROMINOES[name]
    const col = Math.floor(PLAYFIELD_COLUMNS / 2) - Math.floor(matrix[0].length / 2)
    const row = getMatrixHeight(matrix) * -1

    let tetromino = tetrominoBase
    tetromino = {
        name: name,
        matrix: matrix,
        col: col,
        row: row
    }

    return tetromino
}

function convertPositionToIndex(row, col){
    return row * PLAYFIELD_COLUMNS + col
}

// drawing
function drawPlayfield(){
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            const cellIndex = convertPositionToIndex(row, column)
            const tetrominoName = playfield[row][column]
            if (!tetrominoName) {
                playfieldElements[cellIndex].className = ''
                continue
            }
            playfieldElements[cellIndex].classList.add(tetrominoName)
        }
    }
}

function drawTetromino() {
    for (let r = 0; r < tetromino.matrix.length; r++) {
        for (let c = 0; c < tetromino.matrix[r].length; c++) {
            if (!tetromino.matrix[r][c])
                continue
            if (tetromino.row + r < 0)
                continue
            playfield[tetromino.row + r][tetromino.col + c] = tetromino.name
        }
    }
}

function drawScore() {
    document.getElementById("score").innerHTML = score
}

function drawGameOver() {
    document.getElementById("gameover").style.visibility = "visible"
}

function eraseTetromino() {
    for (let r = 0; r < tetromino.matrix.length; r++) {
        for (let c = 0; c < tetromino.matrix[r].length; c++) {
            if (!tetromino.matrix[r][c])
                continue
            if (tetromino.row + r < 0)
                continue
            playfield[tetromino.row + r][tetromino.col + c] = 0
        }
    }
}

function eraseFullRows(fullRows) {
    const newPlayfield = []
    for (let r = playfield.length-1; r >= 0; r--) {
        if (!fullRows.includes(r)) {
            newPlayfield.unshift(playfield[r])
        }
    }    
    for (let r = newPlayfield.length; r < playfield.length; r++){
        newPlayfield.unshift(new Array(PLAYFIELD_ROWS).fill(0))    
    }
    playfield = newPlayfield    
}

// score
function updateScore(rowsFiredCount){
    switch(rowsFiredCount) {
        case 1:
            score += 100
            break
        case 2: 
            score += 300
            break
        case 3:
            score += 700
            break
        case 4: 
            score += 1500
            break
    }
}

// moving tetro
function redrawTetromino(tetroModifier) {
    const tetrominoNew = structuredClone(tetromino)
    tetroModifier(tetrominoNew)
    if (isCollision(tetrominoNew)) {
        return
    }
    eraseTetromino()
    tetromino = tetrominoNew
    updatePlayfield()
}

function moveRight(tetro) {
    console.log("moving right")
    if (tetro.col + getMatrixWidth(tetro.matrix) < PLAYFIELD_COLUMNS)
        tetro.col += 1
}

function moveLeft(tetro) {
    console.log("moving left")
    if (tetro.col > 0)
        tetro.col -= 1
}

function moveDown(tetro) {
    console.log("moving down")
    if (tetro.row + getMatrixHeight(tetro.matrix) < PLAYFIELD_ROWS)
        tetro.row += 1
}

function moveUp(tetro) {
    console.log("moving up")
    if (tetro.row > 0)
        tetro.row -= 1
}

function roatate(tetro) {
    console.log("rotate")
    
    let matrxOld = tetro.matrix
    let matrixNew = []
    
    for (let j = 0; j < matrxOld[0].length; j++) {
        let rowNew = []
        for (let i = matrxOld.length-1; i >= 0; i--) {
            rowNew.push(matrxOld[i][j])
        }
        matrixNew.push(rowNew)
    }

    if (tetro.row + getMatrixHeight(matrixNew) > PLAYFIELD_ROWS)
        return

    if (tetro.col + getMatrixWidth(matrixNew) >= PLAYFIELD_COLUMNS) {
        tetro.col = PLAYFIELD_COLUMNS - getMatrixWidth(matrixNew)
    }
    
    tetro.matrix = matrixNew
}

// collisions
function isStuck() {
    if (!isTouchDown()) 
        return false

    if (!tetromino.touchdown){   
        // allowing move tetromino when first check
        tetromino.touchdown = true
        return false 
    }

    // is stuck when second check
    return true
}

function isTouchDown(){
    if (tetromino.row + getMatrixHeight(tetromino.matrix) == PLAYFIELD_ROWS)
        return true 

    for (let c = 0; c < getMatrixWidth(tetromino.matrix); c++) {
        for(let r = getMatrixHeight(tetromino.matrix)-1; r >= 0; r--) {
            if (!tetromino.matrix[r][c])
                continue

            let rowToCheck = tetromino.row + r + 1
            let colToCheck = tetromino.col + c

            if (rowToCheck < 0)
                continue

            if (playfield[rowToCheck][colToCheck])
                return true
            else 
                break
        }
    }
}

function isCollision(tetrominoNew) {
    for (let r = 0; r < tetrominoNew.matrix.length; r++) {
        for (let c = 0; c < tetrominoNew.matrix[r].length; c++) {
            if (!tetrominoNew.matrix[r][c]) 
                continue
            
            row = tetrominoNew.row + r
            col = tetrominoNew.col + c
            
            if (row < 0)  
                continue

            if (isCellOfCurrentTetro(row, col))
                continue
            
            if (!playfield[row][col])
                continue

            return true
        }
    }
    return false
}

// helper functions
function isCellOfCurrentTetro(row, column) {
    for (let r = 0; r < tetromino.matrix.length; r++) {
        for (let c = 0; c < tetromino.matrix[r].length; c++) {
            if (!tetromino.matrix[r][c])
                continue

            if (tetromino.row + r == row && tetromino.col + c == column)
                return true
        }
    }
    return false
}

function getFullRows() {
    const fullRows = []

    for (let r = 0; r < playfield.length; r++) {
        let isFull = true
        for (let c = 0; c < playfield[r].length; c++) {
            if (!playfield[r][c]) {
                isFull = false
                break 
            }
        }
        if (isFull)
            fullRows.push(r)
    }
    
    return fullRows
}

function updatePlayfield() {
    drawScore()
    drawTetromino()
    drawPlayfield()
}

// ----------------------------------------------------------------

// init game
let score = 0
let isGameOver = false

let playfieldElements = generatePlayfieldElements() // html

let playfield = new Array(PLAYFIELD_ROWS).fill()    // matrix
    .map(() => new Array(PLAYFIELD_COLUMNS).fill(0))

let tetromino = generateTetromino()
updatePlayfield()

// setup event handling
document.addEventListener("keydown", (event) => { 
    if (isGameOver)
        return
    
    switch (event.code) {
        case "ArrowRight":
            redrawTetromino(moveRight)
            break
        case "ArrowLeft":
            redrawTetromino(moveLeft)
            break
        case "ArrowDown":
            redrawTetromino(moveDown)
            break
        case "ArrowUp":
            redrawTetromino(moveUp)
            break    
        case "Space":
            redrawTetromino(roatate)
            break     
    }
})

// setup game runner
window.setInterval(gameRunner, 200)

function gameRunner() {
    if (isGameOver)
        return

    redrawTetromino(moveDown)
    
    if (!isStuck())
        return
    
    console.log("stuck")
      
    if (tetromino.row < 0) {
        console.log("game over")
        isGameOver = true
        drawGameOver()
        return
    }

    const fullRows = getFullRows()
    if (fullRows){
        eraseFullRows(fullRows)
        updateScore(fullRows.length)
    }

    console.log("new tetromino")

    tetromino = generateTetromino()
    updatePlayfield()
}