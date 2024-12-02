const x_start = 7;
const y_start = 1;

const x_goal = 5;
const y_goal = 9;

const x_enemy = 7;
const y_enemy = 8;

const cols = 10, rows = 10, sizeCell = 50, timeExecute = 500 , timeMsg = 250;
const nivelDificultad = 25;

const grid = [];
const walls = ["muro"];
const direcciones = ["IZQUIERDA","DERECHA","ARRIBA","ABAJO"];
let start, goal, mario, enemy;
let isGameOver = false; 

var mensajeDirection = '';

// CREACION DE TABLERO

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
                isEnemy: false,
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
                cell.isEnemy = true;
                cell.isWall = true;
                enemy = cell;
                cellElement.classList.add('enemy');
            }

            if ((i % 2 == 0 && j % 2 != 0) || (j % 2 == 0 && i % 2 != 0)) {
                cellElement.classList.add("cell_1");
            } else if ((j % 2 != 0 && i % 2 != 0) || (j % 2 == 0 && i % 2 == 0)) {
                cellElement.classList.add("cell_2");
            }

            if (
                Math.random() < nivelDificultad / 100
                // (i === 0 && j === 6) ||
                // (i === 1 && j === 7) ||
                // (i === 2 && j === 7) 
            && cell !== start && cell !== goal && cell !== enemy) {
                cell.isWall = true;
                cellElement.classList.add('wall');
                const randomWall = getRandomInt(walls.length);
                cellElement.classList.add(walls[randomWall]);
            }
        }
    }

    mario = start;
}

// ALGORITMO A*

function reconstructPath(node) {
    const path = [];
    while (node) {
        path.push(node);
        node = node.parent;
    }
    return path.reverse();
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Distancia Manhattan
}

function getNeighbors(node) {
    const { x, y } = node;
    const neighbors = [];

    // Revisar las celdas vecinas, excluyendo las que están fuera del mapa
    if (x > 0 && !grid[x - 1][y].isWall && !grid[x - 1][y].isEnemy) neighbors.push(grid[x - 1][y]);
    if (x < rows - 1 && !grid[x + 1][y].isWall && !grid[x + 1][y].isEnemy) neighbors.push(grid[x + 1][y]);
    if (y > 0 && !grid[x][y - 1].isWall && !grid[x][y - 1].isEnemy) neighbors.push(grid[x][y - 1]);
    if (y < cols - 1 && !grid[x][y + 1].isWall && !grid[x][y + 1].isEnemy) neighbors.push(grid[x][y + 1]);

    return neighbors;
}

function aStar(start, goal) {
    const openSet = [start];
    const closedSet = [];
    start.g = 0;
    start.h = heuristic(start, goal);
    start.f = start.g + start.h;

    while (openSet.length > 0) {
        let current = openSet.reduce((a, b) => (a.f < b.f ? a : b));

        if (current === goal) {
            const path = reconstructPath(current);
            moveMario(path);
            return path;
        }

        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);

        for (const neighbor of getNeighbors(current)) {
            if (closedSet.includes(neighbor)) continue;

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

    // console.warn("No se encontró una ruta válida.");
    mario.element.classList.add("sad_mario");
    enemy.element.classList.add("happy_enemy");
    isGameOver = true;
    return null;
}

async function moveMario(path) {
    // Función que mueve a Mario en el camino determinado por A*
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
            enemy.element.classList.add('lose_enemy');

            return;
        }

        if (checkIfCrossed()) {
            isGameOver = true;

            // alert("¡El enemigo ha atrapado a Mario!");
            return;
        }

        await delay(timeExecute);
    }
}

// SISTEMA EXPERTO

function agregarConsola(mensajeTexto) {
    const consola = document.getElementById('consola');
    consola.innerHTML += `<p>${mensajeTexto}</p>`;
    consola.scrollTop = consola.scrollHeight;
}

function agregarOutput(mensajeTexto) {
    const output = document.getElementById('output');
    output.innerHTML += `<p>${mensajeTexto}</p>`;
    output.scrollTop = output.scrollHeight; 
}


var hechosMuros = '';

function agregarMuroshechos() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const span = cell.querySelector('span');
        if (span) {
            const [x_muro, y_muro] = span.textContent.split(',').map(Number);
            if (cell.classList.contains('wall')) {
                hechosMuros += `
                    enPosicion(muro, ${x_muro}, ${y_muro}).

                `;
                hechosMuros += ` `;
            }
        }
    });
}

const session = pl.create();

function consultaProlog(posXstart , posYstart , posXenemy , posYenemy) {
    hechosMuros = '';
    agregarMuroshechos();
    var hechos = `
        enPosicion(mario, ${posXstart}, ${posYstart}).
        enPosicion(enemy, ${posXenemy}, ${posYenemy}).
    ` + hechosMuros
    ;
    const campoHechos = document.getElementById('hechos');
    campoHechos.innerHTML = `<p>${hechos}</p>`;
    campoHechos.scrollTop = campoHechos.scrollHeight; 

    var reglas = `

        moverIzq :- 
            enPosicion(mario, W, X), 
            enPosicion(enemy, Z, Y), 
            Y > X,
            write('${direcciones[0]}').

        moverDer :- 
            enPosicion(mario, W, X), 
            enPosicion(enemy, Z, Y), 
            X > Y,
            write('${direcciones[1]}').

        moverArriba :- 
            enPosicion(mario, X, W), 
            enPosicion(enemy, Z, Y), 
            Z > X,
            write('${direcciones[2]}').

        moverAbajo :- 
            enPosicion(mario, X, W), 
            enPosicion(enemy, Z, Y), 
            X > Z,
            write('${direcciones[3]}').

        moverFila :- 
            enPosicion(mario, Z, X), 
            enPosicion(enemy, Z, Y), 
            ( 
                Y > X -> moverIzq ; moverDer 
            ).

        moverColumna :- 
            enPosicion(mario, X, Y), 
            enPosicion(enemy, Z, Y), 
            ( 
                Z > X -> moverArriba ; moverAbajo
            ).

        moverDistancia :- 
            enPosicion(mario, X, Y), 
            enPosicion(enemy, Z, W), 
            (
                (abs(W - Y) < abs(Z - X) -> 
                    (W > Y -> moverIzq ; moverDer)
                ) ;
                
                (abs(Z - X) < abs(W - Y) -> 
                    (Z > X -> moverArriba ; moverAbajo)
                ) ;

                (abs(W - Y) =:= abs(Z - X) -> 
                    (W > Y -> moverIzq ; moverArriba) 
                )
            ).

        mover :- 
            enPosicion(mario, X, Y), 
            enPosicion(enemy, Z, W),
            (
                Z =:= X -> moverFila ;
                Y =:= W -> moverColumna ;
                moverDistancia
            ).

    `;

    var program = hechos + reglas;

    session.consult(program, {
        success: function () {
            agregarConsola("Program loaded successfully.");
        },
        error: function (err) {
            agregarConsola("Error loading the program:" + err);
        }
    });

    const query = `
        mover.
    `; 

    session.query(query, {
    success: function () {
        agregarConsola("Query executed successfully.");
        session.answer({
            success: function (answer) {
                agregarConsola("Answer received:"+answer);
                if (answer) {
                    agregarOutput("true");
                } else {
                    agregarConsola("No answer found for the query.");
                    agregarOutput("false");
                }
            },
            fail: function (fail) {
                agregarConsola("Query failed:"+fail);
                agregarOutput("false");
            },
            error: function (err) {
                agregarConsola("Error getting the answer:"+ err);
                agregarOutput("false");
            }
        });
    },
    error: function (err) {
        agregarConsola("Error running the query:"+err);
        agregarOutput("false");
    }
    });

    mensajeDirection = mensajeExternoTextoProlog;
    // console.log(hechos);
    agregarOutput(mensajeExternoTextoProlog);
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
        consultaProlog(mario.x,mario.y,enemy.x,enemy.y);
        var direction = mensajeDirection;

        switch (direction) {
            case direcciones[0]:
                nextMove = grid[enemy.x][enemy.y - 1];  // Mover a la izquierda
                break;
            case direcciones[1]:
                nextMove = grid[enemy.x][enemy.y + 1];  // Mover a la derecha
                break;
            case direcciones[2]:
                nextMove = grid[enemy.x - 1][enemy.y];  // Mover hacia arriba
                break;
            case direcciones[3]:
                nextMove = grid[enemy.x + 1][enemy.y];  // Mover hacia abajo
                break;
            default:
                console.log('Dirección desconocida - ', direction);
                break;
        }

        logAction(direction);

        if (nextMove && !nextMove.isWall) {
            enemy.element.classList.remove('enemy');
            enemy = nextMove;
            enemy.element.classList.add('enemy');
            enemy.element.classList.add('follow');
        } 
        // else {
        //     const neighbors = getNeighbors(enemy);
        //     let bestCell = null;
        //     let shortestDistance = Infinity;

        //     for (const neighbor of neighbors) {
        //         if (!neighbor.isWall) {
        //             const distanceToMario = heuristic(neighbor, mario); 
        //             if (distanceToMario < shortestDistance) {
        //                 shortestDistance = distanceToMario;
        //                 bestCell = neighbor;
        //             }
        //         }
        //     }

        //     if (bestCell) {
        //         enemy.element.classList.remove('enemy');
        //         enemy = bestCell;
        //         enemy.element.classList.add('enemy');
        //         enemy.element.classList.add('follow');
        //     } else {
        //     }
        // }

        if (enemy === mario || checkIfCrossed()) {
            isGameOver = true;
            await delay(timeMsg);
            return;
        }

        await new Promise(resolve => setTimeout(resolve, timeExecute));
    }
}

function logAction(message) {
    const actionsContainer = document.getElementById('acciones');
    const actionElement = document.createElement('p');
    actionElement.textContent = "Da un paso en dirección "+message;
    actionsContainer.appendChild(actionElement);
}


// INIALIZACION DEL SISTEMA

document.querySelector('#iniciar').addEventListener('click', async () => {
    mario = start;
    moveEnemyExpert();

    const path = await aStar(start, goal);

    if (path && !isGameOver) {
        console.log("Mario llegó al objetivo.");
        // enemy.element.classList.add('enemy_sad');
    } else if (!isGameOver) {
        console.warn("Mario no encontró una ruta válida.");
    }
});

document.querySelector('#reiniciar').addEventListener('click', () => {
    location.reload();
});

createGrid();
