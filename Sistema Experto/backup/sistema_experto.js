const x_start = 9;
const y_start = 9;

const x_goal = 5;
const y_goal = 5;

const x_enemy = 9;
const y_enemy = 0;

const cols = 10, rows = 10, sizeCell = 50, timeExecute = 500 , timeMsg = 250;
const nivelDificultad = 0;


const grid = [];
const walls = ["muro"];
let start, goal, mario, enemy;
let isGameOver = false; 

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
            } else if (i === x_enemy && j === y_enemy) {
                enemy = cell;
                cellElement.classList.add('enemy');
            }

            if ((i % 2 == 0 && j % 2 != 0) || (j % 2 == 0 && i % 2 != 0)) {
                cellElement.classList.add("cell_1");
            } else if ((j % 2 != 0 && i % 2 != 0) || (j % 2 == 0 && i % 2 == 0)) {
                cellElement.classList.add("cell_2");
            }

            if (Math.random() < nivelDificultad / 100 && cell !== start && cell !== goal && cell !== enemy) {
                cell.isWall = true;
                cellElement.classList.add('wall');
                const randomWall = getRandomInt(walls.length);
                cellElement.classList.add(walls[randomWall]);
            }
        }
    }

    mario = start;
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
    const rutaContainer = document.getElementById('ruta'); 

    for (const cell of path) {
        if (isGameOver) return; 
        mario.element.classList.remove('start');
        mario = cell;
        mario.element.classList.add('start');
        mario.element.classList.add('path');

        const nodeInfo = document.createElement('p');
        nodeInfo.textContent = `(${mario.x}, ${mario.y})`;
        nodeInfo.classList.add('cell');
        rutaContainer.appendChild(nodeInfo);

        rutaContainer.scrollTop = rutaContainer.scrollHeight;

        if (mario === goal) {
            isGameOver = true;
            console.log("¡Mario llegó al objetivo!");
            enemy.element.classList.remove('follow');
            enemy.element.classList.add('lose_enemy');
            logFinalMessage("¡Mario alcanzó el objetivo!");
            return;
        }

        if (checkIfCrossed()) {
            isGameOver = true;
            await delay(timeMsg);
            alert("¡Mario fue capturado por el enemigo!");
            logFinalMessage("¡El enemigo capturó a Mario!");
            return;
        }

        await new Promise(resolve => setTimeout(resolve, timeExecute));
    }
}

function checkIfCrossed() {
    const marioFuture = { x: mario.x, y: mario.y };
    const enemyFuture = { x: enemy.x, y: enemy.y };

    if (marioFuture.x === enemy.x && marioFuture.y === enemy.y) {
        return true;
    }

    return false;
}

async function moveEnemyExpert() {
    while (!isGameOver) {
        let nextMove = null;

        // Regla 1: Determinar la dirección directa hacia Mario
        const dx = mario.x - enemy.x;
        const dy = mario.y - enemy.y;

        if (dx === 0 && dy !== 0) {
            nextMove = dy > 0 ? grid[enemy.x][enemy.y + 1] : grid[enemy.x][enemy.y - 1];
            logAction(`Mario está en la misma fila. El enemigo se mueve hacia ${dy > 0 ? 'derecha' : 'izquierda'}.`);
        } else if (dy === 0 && dx !== 0) {
            nextMove = dx > 0 ? grid[enemy.x + 1][enemy.y] : grid[enemy.x - 1][enemy.y];
            logAction(`Mario está en la misma columna. El enemigo se mueve hacia ${dx > 0 ? 'abajo' : 'arriba'}.`);
        } else if (Math.abs(dx) > Math.abs(dy)) {
            nextMove = dx > 0 ? grid[enemy.x + 1][enemy.y] : grid[enemy.x - 1][enemy.y];
            logAction(`Mario está más lejos horizontalmente. El enemigo se mueve hacia ${dx > 0 ? 'abajo' : 'arriba'}.`);
        } else {
            nextMove = dy > 0 ? grid[enemy.x][enemy.y + 1] : grid[enemy.x][enemy.y - 1];
            logAction(`Mario está más lejos verticalmente. El enemigo se mueve hacia ${dy > 0 ? 'derecha' : 'izquierda'}.`);
        }

        // Regla 2: Verificar si la celda elegida es válida (no es un muro)
        if (nextMove && !nextMove.isWall) {
            enemy.element.classList.remove('enemy');
            enemy = nextMove;
            enemy.element.classList.add('enemy');
            enemy.element.classList.add('follow');
        } else {
            logAction("El enemigo encontró un muro y busca una alternativa.");
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
                logAction(`El enemigo encontró una ruta alternativa y se mueve.`);
                enemy.element.classList.remove('enemy');
                enemy = bestCell;
                enemy.element.classList.add('enemy');
                enemy.element.classList.add('follow');
            } else {
                logAction("El enemigo no encontró un movimiento válido.");
            }
        }

        // Regla 4: Verificar si el enemigo atrapó o cruzó a Mario
        if (enemy === mario || checkIfCrossed()) {
            isGameOver = true;
            logAction("¡Mario fue capturado por el enemigo!");
            await delay(timeMsg);
            alert("¡Mario fue capturado por el enemigo!");
            logFinalMessage("¡El enemigo capturó a Mario!");
            return;
        }

        await new Promise(resolve => setTimeout(resolve, timeExecute));
    }
}

function logFinalMessage(message) {
    const logContainer = document.getElementById('acciones');
    const logEntry = document.createElement('p');
    logEntry.textContent = message;
    logContainer.appendChild(logEntry);

    logContainer.scrollTop = logContainer.scrollHeight;
}

function logAction(message) {
    const logContainer = document.getElementById('acciones');
    const logEntry = document.createElement('p');
    logEntry.textContent = message;
    logContainer.appendChild(logEntry);

    logContainer.scrollTop = logContainer.scrollHeight;
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
