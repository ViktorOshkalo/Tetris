const PLAYFIELD_COLUMNS = 10
const PLAYFIELD_ROWS    = 20
const pointsToChangeLevel = 1000
const initLoopIntervalMs = 500

let score = 0
let isGameOver = false
let playfield 
let cells
let pause = true
let level = 1

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
                cells[cellIndex].className = ''
                continue
            }
            cells[cellIndex].classList.add(tetrominoName)
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

function drawLevel() {
    document.getElementById("level").innerHTML = level
}

function drawGameOver() {
    document.getElementById("gameover").style.visibility = "visible"
}

function draw() {
    drawScore()
    drawTetromino()
    drawPlayfield()
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
            newPlayfield.unshift(playfield[r]) // add all non full rows to new playfield form bottom to top
        }
    }    
    for (let r = newPlayfield.length; r < playfield.length; r++){
        newPlayfield.unshift(new Array(PLAYFIELD_COLUMNS).fill(0))    // fill up the rest with empty rows 
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
function moveRight(tetro) {
    console.log("moving right")
    tetro.col += 1
}

function moveLeft(tetro) {
    console.log("moving left")
    tetro.col -= 1
}

function moveDown(tetro) {
    console.log("moving down")
    tetro.row += 1
}

function moveUp(tetro) {
    console.log("moving up")
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

function redrawTetromino(tetroModifierFunc) {
    const tetrominoNew = structuredClone(tetromino)
    tetroModifierFunc(tetrominoNew)
    if (isCollision(tetrominoNew)) {
        return
    }
    eraseTetromino()
    tetromino = tetrominoNew
    draw()
}

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
        case "Enter":
            pause = !pause
            break  
    }
})

// collisions
function isTetrominoStuck() {
    if (!isTouchDown()) 
        return false

    if (!tetromino.touchdown){   
        tetromino.touchdown = true
        return false  // allowing move tetro till next iteration check
    }

    console.log("tetromino stuck")
    return true // report as stuck when next iteration check
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
            
            break // go check next column
        }
    }
}

function isCollision(tetrominoNew) {
    // out of borders
    if (tetrominoNew.col + getMatrixWidth(tetrominoNew.matrix) > PLAYFIELD_COLUMNS)
        return true

    if (tetrominoNew.col < 0)
        return true

    if (tetrominoNew.row + getMatrixHeight(tetrominoNew.matrix) > PLAYFIELD_ROWS)
        return true

    if (tetrominoNew.row < getMatrixHeight(tetrominoNew.matrix) * -1)
        return true
 
    // intersections
    for (let r = 0; r < tetrominoNew.matrix.length; r++) {
        for (let c = 0; c < tetrominoNew.matrix[r].length; c++) {
            if (!tetrominoNew.matrix[r][c]) 
                continue
            
            row = tetrominoNew.row + r
            col = tetrominoNew.col + c
            
            if (row < 0)  
                continue

            if (isCellOfCurrentTetromino(row, col))
                continue
            
            if (!playfield[row][col])
                continue

            return true
        }
    }

    return false
}

// helper functions
function isCellOfCurrentTetromino(row, column) {
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

function checkGameOver() {
    if (tetromino.row >= 0) 
        return false

    console.log("game over")
    return true
}

function checkFullRows(){
    const fullRows = getFullRows()
    if (fullRows){
        eraseFullRows(fullRows)
        updateScore(fullRows.length)
    }
}

function checkGameSpeed() {
    if (score / level < pointsToChangeLevel)
        return

    level += 1
    drawLevel()
}

// ----------------------------------------------------------------

// init game

function init() {
    playfield = new Array(PLAYFIELD_ROWS).fill()    // matrix
        .map(() => new Array(PLAYFIELD_COLUMNS).fill(0))
    cells = generatePlayfieldElements() // html
    tetromino = generateTetromino()
    draw()
} 

// loop running
function startLoop() {
    if (isGameOver)
        return

    setTimeout(() => requestAnimationFrame(executeLoop), Math.floor(initLoopIntervalMs / level))
}

function executeLoop() {
    if (pause) {
        startLoop()
        return
    }

    redrawTetromino(moveDown)

    if (!isTetrominoStuck()){
        startLoop()
        return
    }
    
    if (checkGameOver()) {
        isGameOver = true
        drawGameOver()
        return
    }

    checkFullRows()
    checkGameSpeed()

    tetromino = generateTetromino()
    redrawTetromino(moveDown)
    draw()
    startLoop()
}

init()
startLoop()
