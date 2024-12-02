const x_start = 14;
const y_start = 0;

const x_goal = 7;
const y_goal = 7;

const x_enemy = 14;
const y_enemy = 14;

const cols = 15, rows = 15, sizeCell = 40, timeExecute = 200 , timeMsg = 250;
const nivelDificultad = 10;
const grid = [];
const walls = ["muro"];
let start, goal, mario, enemy;
let isGameOver = false; 

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

            if (i === x_start && j === y_start) {
                start = cell;
                cellElement.classList.add('start');
            } else if (i === x_goal && j === y_goal) {
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
        if (isGameOver) return; // Detener si el juego terminó
        mario.element.classList.remove('start');
        mario = cell;
        mario.element.classList.add('start');
        mario.element.classList.add('path');

        // Verificar si Mario llegó al objetivo
        if (mario === goal) {
            isGameOver = true;
            console.log("¡Mario llegó al objetivo!");
            enemy.element.classList.remove('follow');
            enemy.element.classList.add('lose_enemy'); // Agregar clase de derrota al enemigo
            return;
        }

        // Verificar si Mario y el enemigo se cruzan
        if (checkIfCrossed()) {
            isGameOver = true;
            await delay(timeMsg);
            alert("¡Mario fue capturado por el enemigo!");
            return;
        }

        await new Promise(resolve => setTimeout(resolve, timeExecute));
    }
}

function placeEnemy() {
    let enemyCell;
    do {
        const x = x_enemy;
        const y = y_enemy;
        enemyCell = grid[x][y];
    } while (enemyCell.isWall || enemyCell === start || enemyCell === goal);

    enemy = enemyCell;
    enemy.element.classList.add('enemy');
    enemy.element.classList.add('follow');

}

function checkIfCrossed() {
    const marioFuture = { x: mario.x, y: mario.y };
    const enemyFuture = { x: enemy.x, y: enemy.y };

    if (marioFuture.x === enemy.x && marioFuture.y === enemy.y) {
        // Mario y el enemigo están en la misma celda
        return true;
    }

    return false;
}

async function moveEnemyExpert() {
    while (!isGameOver) { // Continuar mientras el juego no haya terminado
        let nextMove = null;

        // Regla 1: Determinar la dirección directa hacia Mario
        const dx = mario.x - enemy.x;
        const dy = mario.y - enemy.y;

        if (dx === 0 && dy !== 0) {
            // Mario está en la misma fila, moverse horizontalmente
            nextMove = dy > 0 ? grid[enemy.x][enemy.y + 1] : grid[enemy.x][enemy.y - 1];
        } else if (dy === 0 && dx !== 0) {
            // Mario está en la misma columna, moverse verticalmente
            nextMove = dx > 0 ? grid[enemy.x + 1][enemy.y] : grid[enemy.x - 1][enemy.y];
        } else if (Math.abs(dx) > Math.abs(dy)) {
            // Mario está más lejos horizontalmente, priorizar movimiento horizontal
            nextMove = dx > 0 ? grid[enemy.x + 1][enemy.y] : grid[enemy.x - 1][enemy.y];
        } else {
            // Mario está más lejos verticalmente, priorizar movimiento vertical
            nextMove = dy > 0 ? grid[enemy.x][enemy.y + 1] : grid[enemy.x][enemy.y - 1];
        }

        // Regla 2: Verificar si la celda elegida es válida (no es un muro)
        if (nextMove && !nextMove.isWall) {
            // Mover al enemigo
            enemy.element.classList.remove('enemy');
            enemy = nextMove;
            enemy.element.classList.add('enemy');
            enemy.element.classList.add('follow');
        } else {
            // Regla 3: Si la celda elegida no es válida, buscar alternativas
            console.warn("Ruta directa bloqueada, buscando alternativa...");
            const neighbors = getNeighbors(enemy);
            let bestCell = null;
            let shortestDistance = Infinity;

            for (const neighbor of neighbors) {
                if (!neighbor.isWall) {
                    const distanceToMario = heuristic(neighbor, mario); // Calcular distancia heurística a Mario
                    if (distanceToMario < shortestDistance) {
                        shortestDistance = distanceToMario;
                        bestCell = neighbor;
                    }
                }
            }

            if (bestCell) {
                enemy.element.classList.remove('enemy');
                enemy = bestCell;
                enemy.element.classList.add('enemy');
                enemy.element.classList.add('follow');
            } else {
                console.warn("El enemigo no encontró un movimiento válido.");
            }
        }

        // Regla 4: Verificar si el enemigo atrapó o cruzó a Mario
        if (enemy === mario || checkIfCrossed()) {
            isGameOver = true;
            await delay(timeMsg);
            alert("¡Mario fue capturado por el enemigo!");
            return;
        }

        // Esperar antes del siguiente movimiento
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
    
});

createGrid();

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
