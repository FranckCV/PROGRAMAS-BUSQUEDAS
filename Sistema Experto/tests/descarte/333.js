// Declaración de Variables y Constantes
const x_start = 5 , y_start = 0;
const x_goal = 0 , y_goal = 10;
const x_enemy = 9 , y_enemy = 10;

const cols = 11, rows = 10, sizeCell = 50, timeExecute = 500 , timeMsg = 250;
const nivelDificultad = 5;

const grid = [];
const walls = ["muro"];
const directions = ["arriba","abajo","izquierda","derecha"];
let start, goal, mario, enemy;
let isGameOver = false; 

const hechos = [];

// Creación de Tablero
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

// Algoritmo A*
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
            // console.log("¡Mario llegó al objetivo!");
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



// Sistema Experto basado en Reglas
const reglas = [
    {
        tipo: "moverIzquierda",
        cuando: [
            { tipo: "esEnemy", sujeto: "enemigo", objeto: { x: "X", y: "Y" } },
            { tipo: "esMario", sujeto: "mario", objeto: { x: "X-1", y: "Y" } },
            { tipo: "esMuro", sujeto: "muro", objeto: { x: "X-1", y: "Y" } }
        ],
        entonces: { tipo: "moverIzquierda", sujeto: "enemigo", direccion: "izquierda" }
    },
    {
        tipo: "moverDerecha",
        cuando: [
            { tipo: "esEnemy", sujeto: "enemigo", objeto: { x: "X", y: "Y" } },
            { tipo: "esMario", sujeto: "mario", objeto: { x: "X+1", y: "Y" } },
            { tipo: "esMuro", sujeto: "muro", objeto: { x: "X+1", y: "Y" } }
        ],
        entonces: { tipo: "moverDerecha", sujeto: "enemigo", direccion: "derecha" }
    },
    {
        tipo: "moverArriba",
        cuando: [
            { tipo: "esEnemy", sujeto: "enemigo", objeto: { x: "X", y: "Y" } },
            { tipo: "esMario", sujeto: "mario", objeto: { x: "X", y: "Y-1" } },
            { tipo: "esMuro", sujeto: "muro", objeto: { x: "X", y: "Y-1" } }
        ],
        entonces: { tipo: "moverArriba", sujeto: "enemigo", direccion: "arriba" }
    },
    {
        tipo: "moverAbajo",
        cuando: [
            { tipo: "esEnemy", sujeto: "enemigo", objeto: { x: "X", y: "Y" } },
            { tipo: "esMario", sujeto: "mario", objeto: { x: "X", y: "Y+1" } },
            { tipo: "esMuro", sujeto: "muro", objeto: { x: "X", y: "Y+1" } }
        ],
        entonces: { tipo: "moverAbajo", sujeto: "enemigo", direccion: "abajo" }
    }
];

function agregarHecho(tipo, sujeto, objeto) {
    hechos.push({ tipo, sujeto, objeto });
}

function crearHechos() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const span = cell.querySelector('span');
        if (span) {
            const [x_muro, y_muro] = span.textContent.split(',').map(Number);
            if (cell.classList.contains('wall')) {
                agregarHecho("esMuro", "muro", { x:x_muro, y:y_muro });
            }
        }
    });
    agregarHecho("esEnemy", "enemy", { x: x_enemy, y: y_enemy });
    agregarHecho("esGoal", "goal", { x: x_goal, y: y_goal });
    agregarHecho("esMario", "mario", { x: x_start, y: y_start });
}

function evaluarReglas() {
    reglas.forEach(regla => {
        const condicionesCumplidas = regla.cuando.every(condicion => {
            if (condicion.tipo === "esEnemy") {
                const enemigo = obtenerPosicionPersonaje(condicion.sujeto);
                return enemigo.x === condicion.objeto.x && enemigo.y === condicion.objeto.y;
            }
            if (condicion.tipo === "esMuro") {
                return hayMuroEnPosicion(condicion.objeto.x, condicion.objeto.y);
            }
            if (condicion.tipo === "esMario") {
                const mario = obtenerPosicionPersonaje(condicion.sujeto);
                return mario.x === condicion.objeto.x && mario.y === condicion.objeto.y;
            }
        });

        if (condicionesCumplidas) {
            ejecutarAccion(regla.entonces);
        }
    });
}

function obtenerPosicionPersonaje(sujeto) {
    if (sujeto === "mario") {
        return { x: mario.x, y: mario.y };
    }
    if (sujeto === "enemigo") {
        return { x: enemy.x, y: enemy.y };
    }
}

function hayMuroEnPosicion(x, y) {
    return hechos.some(hecho => hecho.tipo === "esMuro" && hecho.objeto.x === x && hecho.objeto.y === y);
}

function ejecutarAccion(accion) {
    logAction(`${accion.sujeto} se mueve hacia ${accion.direccion}`);
    if (accion.direccion === "izquierda") {
        enemy.x--;
    } else if (accion.direccion === "derecha") {
        enemy.x++;
    } else if (accion.direccion === "arriba") {
        enemy.y--;
    } else if (accion.direccion === "abajo") {
        enemy.y++;
    }

    enemy.element.classList.remove('enemy');
    const newCell = grid[enemy.x][enemy.y];
    enemy = newCell;
    newCell.element.classList.add('enemy');
}

function logAction(message) {
    const logContainer = document.getElementById('acciones');
    const logEntry = document.createElement('p');
    logEntry.textContent = message;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}


function logFinalMessage(message) {
    const logContainer = document.getElementById('acciones');
    const logEntry = document.createElement('p');
    logEntry.textContent = message;
    logContainer.appendChild(logEntry);

    logContainer.scrollTop = logContainer.scrollHeight;
}

function checkIfCrossed() {
    const marioFuture = { x: mario.x, y: mario.y };
    const enemyFuture = { x: enemy.x, y: enemy.y };

    return marioFuture.x === enemy.x && marioFuture.y === enemy.y;
}

async function moveEnemyExpert() {
    while (!isGameOver) {
        // Evaluar las reglas y mover al enemigo
        evaluarReglas();
        await new Promise(resolve => setTimeout(resolve, timeExecute));
    }
}

document.querySelector('#iniciar').addEventListener('click', async () => {
    mario = start;
    moveEnemyExpert();

    const path = await aStar(start, goal);

    if (path && !isGameOver) {
        // console.log("Mario llegó al objetivo.");
    } else if (!isGameOver) {
        console.warn("Mario no encontró una ruta válida.");
    }
});

document.querySelector('#reiniciar').addEventListener('click', () => {
    location.reload();
});

createGrid();
crearHechos();
console.log(hechos);
evaluarReglas();
