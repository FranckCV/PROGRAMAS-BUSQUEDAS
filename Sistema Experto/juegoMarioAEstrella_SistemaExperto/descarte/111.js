// Declaracion de Variables y Constantes

const x_start = 5 , y_start = 0;
const x_goal = 0 , y_goal = 10;
const x_enemy = 9 , y_enemy = 10;

const cols = 11, rows = 10, sizeCell = 50, timeExecute = 500 , timeMsg = 250;
const nivelDificultad = 5;

const grid = [];
const walls = ["muro"];
const directions = ["arriba","abajo","izquierda","derecha"]
let start, goal, mario, enemy;
let isGameOver = false; 

const hechos = [];
// const reglas = [];

// Creacion de Tablero

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
                // agregarHecho("esMario", "mario", { x: x_start, y: y_start });
            } else if (i === x_goal && j === y_goal) {
                goal = cell;
                cellElement.classList.add('goal');
                // agregarHecho("esGoal", "goal", { x: x_goal, y: y_goal });
            } else if (i === x_enemy && j === y_enemy) {
                enemy = cell;
                cellElement.classList.add('enemy');
                // agregarHecho("esEnemy", "enemy", { x: x_enemy, y: y_enemy  });
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
                // agregarHecho("esMuro", "muro", { x: cell.x, y: cell.y  });
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


// Sistema Experto basado en Reglas

const reglas = [
    {
        tipo: "moverIzquierda",
        cuando: [
            { tipo: "esEnemy", sujeto: "enemigo", objeto: { x: "X", y: "Y" } },
            { tipo: "esMario", sujeto: "mario", objeto: { x: "X-1", y: "Y" } },  // Mario está a la izquierda
            { tipo: "esMuro", sujeto: "muro", objeto: { x: "X-1", y: "Y" } }  // Verifica si hay un muro a la izquierda
        ],
        entonces: { tipo: "moverIzquierda", sujeto: "enemigo", direccion: "izquierda" }
    },
    {
        tipo: "moverDerecha",
        cuando: [
            { tipo: "esEnemy", sujeto: "enemigo", objeto: { x: "X", y: "Y" } },
            { tipo: "esMario", sujeto: "mario", objeto: { x: "X+1", y: "Y" } },  // Mario está a la derecha
            { tipo: "esMuro", sujeto: "muro", objeto: { x: "X+1", y: "Y" } }  // Verifica si hay un muro a la derecha
        ],
        entonces: { tipo: "moverDerecha", sujeto: "enemigo", direccion: "derecha" }
    },
    {
        tipo: "moverArriba",
        cuando: [
            { tipo: "esEnemy", sujeto: "enemigo", objeto: { x: "X", y: "Y" } },
            { tipo: "esMario", sujeto: "mario", objeto: { x: "X", y: "Y-1" } },  // Mario está arriba
            { tipo: "esMuro", sujeto: "muro", objeto: { x: "X", y: "Y-1" } }  // Verifica si hay un muro arriba
        ],
        entonces: { tipo: "moverArriba", sujeto: "enemigo", direccion: "arriba" }
    },
    {
        tipo: "moverAbajo",
        cuando: [
            { tipo: "esEnemy", sujeto: "enemigo", objeto: { x: "X", y: "Y" } },
            { tipo: "esMario", sujeto: "mario", objeto: { x: "X", y: "Y+1" } },  // Mario está abajo
            { tipo: "esMuro", sujeto: "muro", objeto: { x: "X", y: "Y+1" } }  // Verifica si hay un muro abajo
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
            // console.log(x_muro+" "+y_muro);
            if (cell.classList.contains('wall')) {
                agregarHecho("esMuro", "muro", { x:x_muro, y:y_muro });
            }
        }
    });
    agregarHecho("esEnemy", "enemy", { x: x_enemy, y: y_enemy  });
    agregarHecho("esGoal", "goal", { x: x_goal, y: y_goal });
    agregarHecho("esMario", "mario", { x: x_start, y: y_start });    
}





function evaluarReglas() {
    reglas.forEach(regla => {
        // Evaluamos la condición de la regla
        const condicionesCumplidas = regla.cuando.every(condicion => {
            if (condicion.tipo === "esEnemy") {
                // Verifica la posición del enemigo
                const enemigo = obtenerPosicionPersonaje(condicion.sujeto);
                return enemigo.x === condicion.objeto.x && enemigo.y === condicion.objeto.y;
            }
            if (condicion.tipo === "esMuro") {
                // Verifica si hay un muro en la posición
                return hayMuroEnPosicion(condicion.objeto.x, condicion.objeto.y);
            }
            if (condicion.tipo === "esMario") {
                // Verifica la posición de Mario
                const mario = obtenerPosicionPersonaje(condicion.sujeto);
                return mario.x === condicion.objeto.x && mario.y === condicion.objeto.y;
            }
        });

        // Si las condiciones son cumplidas, se ejecuta la acción
        if (condicionesCumplidas) {
            ejecutarAccion(regla.entonces);
        }
    });
}

function obtenerPosicionPersonaje(sujeto) {
    // Devuelve la posición del personaje dado su nombre
    if (sujeto === "mario") {
        return { x: 8, y: 10 }; // Ejemplo de posición de Mario
    }
    if (sujeto === "enemigo") {
        return { x: 9, y: 0 }; // Ejemplo de posición del enemigo
    }
}

function hayMuroEnPosicion(x, y) {
    // Aquí deberías verificar si hay un muro en la posición dada
    return hechos.some(hecho => hecho.tipo === "esMuro" && hecho.objeto.x === x && hecho.objeto.y === y);
}

function ejecutarAccion(accion) {
    // Ejecuta la acción de mover al enemigo en la dirección indicada
    console.log(`${accion.sujeto} se mueve hacia ${accion.direccion}`);
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






function consultarRegla(txtTipo , txtSujeto , txtObjeto) {
    if (txtTipo) {
        return consultar({ tipo: txtTipo }, hechos, reglas);
    } else if (txtTipo && txtSujeto) {
        return consultar({ tipo: txtTipo, sujeto: txtSujeto }, hechos, reglas);
    } else if (txtTipo && txtObjeto) {
        return consultar({ tipo: txtTipo, objeto: txtObjeto }, hechos, reglas);
    }  else if (txtTipo && txtSujeto && txtObjeto) {
        return consultar({ tipo: txtTipo, sujeto: txtSujeto , objeto: txtObjeto }, hechos, reglas);
    }
}

// const cnsultasss = consultarRegla( 
//     "posicionMario" , 
//     null , 
//     null 
// );

// console.log(cnsultasss);









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

crearHechos();
console.log(hechos);

evaluarReglas();


