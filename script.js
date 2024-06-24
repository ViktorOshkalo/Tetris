const PLAYFIELD_COLUMNS = 10
const PLAYFIELD_ROWS    = 20

const TETROMINO_NAMES = [
    'O',
    'I',
    'L',
    'T',
    'Z',
]

const TETROMINOES = {
    'O' : [
        [1, 1], 
        [1, 1]
    ],
    'I' : [
        [1, 1, 1, 1], 
    ],
    'L' : [
        [1, 0,], 
        [1, 0,], 
        [1, 1,], 
    ],
    'T' : [
        [1, 1, 1],
        [0, 1, 0], 
    ],   
    'Z' : [
        [1, 0,],
        [1, 1,], 
        [0, 1,], 
    ], 
}

let tetrominoBase = {
    name: '',
    matrix: [],
    col: 0,
    row: 0
}

let playfield = new Array(PLAYFIELD_ROWS).fill()
    .map(() => new Array(PLAYFIELD_COLUMNS).fill(0))

let tetrominoes = new Array()

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
    const row = 0

    tetrominoBase = {
        name: name,
        matrix: matrix,
        col: col,
        row: row
    }

    return tetrominoBase
}

function convertPositionToIndex(row, col){
    return row * PLAYFIELD_COLUMNS + col
}

function drawPlayfield(){
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            const tetrominoName = playfield[row][column]
            if (!tetrominoName) continue
            const cellIndex = convertPositionToIndex(row, column)
            playfieldElements[cellIndex].classList.add(tetrominoName)
        }
    }
}

function updatePlayfield() {
    tetrominoes.forEach(tetro => {
        console.log(tetro)
        for (let r = 0; r < tetro.matrix.length; r++) {
            for (let c = 0; c < tetro.matrix[r].length; c++) {
                if (tetro.matrix[r][c]) {
                    playfield[tetro.row + r][tetro.col + c] = tetro.name
                }   
            }
        }
    });
}

let playfieldElements = generatePlayfieldElements() 

let tetromino1 = generateTetromino()
tetrominoes.push(tetromino1)

let tetromino2 = generateTetromino()
tetromino2.row = 10
tetromino2.col = 6

tetrominoes.push(tetromino2)

updatePlayfield()
console.table(playfield)

drawPlayfield()