// async function moveEnemyExpert() {
//     while (true) {
//         const dx = mario.x - enemy.x;
//         const dy = mario.y - enemy.y;

//         let nextMove = null;

//         if (dx === 0 && dy !== 0) {
//             nextMove = dy > 0 ? grid[enemy.x][enemy.y + 1] : grid[enemy.x][enemy.y - 1];
//         } else if (dy === 0 && dx !== 0) {
//             nextMove = dx > 0 ? grid[enemy.x + 1][enemy.y] : grid[enemy.x - 1][enemy.y];
//         } else if (Math.abs(dx) > Math.abs(dy)) {
//             nextMove = dx > 0 ? grid[enemy.x + 1][enemy.y] : grid[enemy.x - 1][enemy.y];
//         } else {
//             nextMove = dy > 0 ? grid[enemy.x][enemy.y + 1] : grid[enemy.x][enemy.y - 1];
//         }

//         if (nextMove && !nextMove.isWall && nextMove !== mario) {
//             enemy.element.classList.remove('enemy');
//             enemy = nextMove;
//             enemy.element.classList.add('enemy');
//             enemy.element.classList.add('follow');
//         }

//         await new Promise(resolve => setTimeout(resolve, timeExecute));
//     }
// }



// document.querySelector('#iniciar').addEventListener('click', async () => {
//     mario = start;
//     moveEnemyExpert();

//     const path = await aStar(start, goal);

//     if (path) {
//         console.log("Mario llegó al objetivo.");
//     } else {
//         console.warn("Mario no encontró una ruta válida.");
//     }

// });

// document.querySelector('#reiniciar').addEventListener('click', () => {
//     location.reload();
// });

// createGrid();





const x_start = 9;
const y_start = 5;

const x_goal = 0;
const y_goal = 5;

const x_enemy = 0;
const y_enemy = 0;

const cols = 10, rows = 10, sizeCell = 50, timeExecute = 200;
const nivelDificultad = 0;
const grid = [];
const walls = ["muro"];
let start, goal, mario, enemy;
let isGameOver = false; // Nueva variable para controlar el estado del juego

function createGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.style.gridTemplateColumns = `repeat(${cols}, ${sizeCell}px)`;
    gridElement.style.gridTemplateRows = `repeat(${rows}, ${sizeCell}px)`;

    for (let i = 0; i < rows; i++) {
        grid[i] = [];
        for (let j = 0; j < cols; j++) {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            gridElement.appendChild(cellElement);

            const cell = {
                x: i,
                y: j,
                f: 0,
                g: 0,
                h: 0,
                isWall: false,
                parent: null,
                element: cellElement,
            };
            grid[i][j] = cell;
            cellElement.innerHTML = `<span>${i},${j}</span>`;

            if (i === parseInt((rows - 1)) && j === parseInt((cols - 1) / 2)) {
                start = cell;
                cellElement.classList.add('start');
            } else if (i === 0 && j === 9) {
                goal = cell;
                cellElement.classList.add('goal');
            }

            if ((i % 2 == 0 && j % 2 != 0) || (j % 2 == 0 && i % 2 != 0)) {
                cellElement.classList.add("cell_1");
            } else if ((j % 2 != 0 && i % 2 != 0) || (j % 2 == 0 && i % 2 == 0)) {
                cellElement.classList.add("cell_2");
            }

            if (Math.random() < nivelDificultad / 100 && cell !== start && cell !== goal) {
                cell.isWall = true;
                cellElement.classList.add('wall');
                const randomWall = getRandomInt(walls.length);
                cellElement.classList.add(walls[randomWall]);
            }
        }
    }

    mario = start;
    placeEnemy();
}

function getNeighbors(node) {
    const { x, y } = node;
    const neighbors = [];
    if (x > 0) neighbors.push(grid[x - 1][y]);
    if (x < rows - 1) neighbors.push(grid[x + 1][y]);
    if (y > 0) neighbors.push(grid[x][y - 1]);
    if (y < cols - 1) neighbors.push(grid[x][y + 1]);
    return neighbors;
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Distancia Manhattan
}

async function aStar(start, goal) {
    const openSet = [start];
    const closedSet = [];
    start.g = 0;
    start.h = heuristic(start, goal);
    start.f = start.g + start.h;

    while (openSet.length > 0) {
        let current = openSet.reduce((a, b) => (a.f < b.f ? a : b));

        if (current === goal) {
            const path = reconstructPath(current);
            await moveMario(path);
            return path;
        }

        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);

        for (const neighbor of getNeighbors(current)) {
            if (neighbor.isWall || closedSet.includes(neighbor) || neighbor === enemy) continue;

            const tentativeG = current.g + 1;
            if (tentativeG < neighbor.g || !openSet.includes(neighbor)) {
                neighbor.g = tentativeG;
                neighbor.h = heuristic(neighbor, goal);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;

                if (!openSet.includes(neighbor)) openSet.push(neighbor);
            }
        }
    }
    console.warn("No se encontró una ruta válida.");
    return null;
}

function reconstructPath(node) {
    const path = [];
    while (node) {
        path.push(node);
        node = node.parent;
    }
    return path.reverse();
}

async function moveMario(path) {
    for (const cell of path) {
        if (isGameOver) return; // Detener si el enemigo captura a Mario
        mario.element.classList.remove('start');
        mario = cell;
        mario.element.classList.add('start');
        mario.element.classList.add('path');
        await new Promise(resolve => setTimeout(resolve, timeExecute));
    }
}

function placeEnemy() {
    let enemyCell;
    do {
        const x = getRandomInt(rows);
        const y = getRandomInt(cols);
        enemyCell = grid[x][y];
    } while (enemyCell.isWall || enemyCell === start || enemyCell === goal);

    enemy = enemyCell;
    enemy.element.classList.add('enemy');
}

async function moveEnemyExpert() {
    while (!isGameOver) { // Detener el movimiento del enemigo si el juego termina
        const dx = mario.x - enemy.x;
        const dy = mario.y - enemy.y;

        let nextMove = null;

        if (dx === 0 && dy !== 0) {
            nextMove = dy > 0 ? grid[enemy.x][enemy.y + 1] : grid[enemy.x][enemy.y - 1];
        } else if (dy === 0 && dx !== 0) {
            nextMove = dx > 0 ? grid[enemy.x + 1][enemy.y] : grid[enemy.x - 1][enemy.y];
        } else if (Math.abs(dx) > Math.abs(dy)) {
            nextMove = dx > 0 ? grid[enemy.x + 1][enemy.y] : grid[enemy.x - 1][enemy.y];
        } else {
            nextMove = dy > 0 ? grid[enemy.x][enemy.y + 1] : grid[enemy.x][enemy.y - 1];
        }

        if (nextMove && !nextMove.isWall) {
            enemy.element.classList.remove('enemy');
            enemy = nextMove;
            enemy.element.classList.add('enemy');
            enemy.element.classList.add('follow');

            if (enemy === mario) {
                isGameOver = true;
                alert("¡Mario fue capturado por el enemigo!");
                return;
            }
        }

        await new Promise(resolve => setTimeout(resolve, timeExecute));
    }
}

document.querySelector('#iniciar').addEventListener('click', async () => {
    mario = start;
    moveEnemyExpert();

    const path = await aStar(start, goal);

    if (path && !isGameOver) {
        console.log("Mario llegó al objetivo.");
    } else if (!isGameOver) {
        console.warn("Mario no encontró una ruta válida.");
    }
});

document.querySelector('#reiniciar').addEventListener('click', () => {
    location.reload();
});

createGrid();

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
