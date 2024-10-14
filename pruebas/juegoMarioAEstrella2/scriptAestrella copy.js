const rows = 8;
const cols = 15;
const sizeCell = 60;
let grid = [];
let start = null;
let goal = null;
let coins = [];
const nivelDificultad = 30;  // Porcentaje de paredes en el mapa
const timeExecute = 100;  // Milisegundos de retraso para visualización

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function createGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.style.gridTemplateColumns = `repeat(${cols},${sizeCell}px)`;
    gridElement.style.gridTemplateRows = `repeat(${rows},${sizeCell}px)`;

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
                isCoin: false,  // Agregamos la propiedad para la moneda
                parent: null,
                element: cellElement
            };
            grid[i][j] = cell;
            cellElement.innerHTML = `<span>${i},${j}</span>`;

            if (i === 0 && j === 0) {
                start = cell;
                cellElement.classList.add('start');
            } else if (i === rows - 1 && j === cols - 1) {
                goal = cell;
                cellElement.classList.add('goal');
            }

            if (Math.random() < nivelDificultad / 100 && cell !== start && cell !== goal) {
                cell.isWall = true;
                cellElement.classList.add('wall');
            }
        }
    }

    // Colocar monedas en posiciones aleatorias
    for (let i = 0; i < 3; i++) {
        let x = getRandomInt(rows);
        let y = getRandomInt(cols);
        let randomCell = grid[x][y];

        if (!randomCell.isWall && randomCell !== start && randomCell !== goal) {
            randomCell.isCoin = true;
            randomCell.element.classList.add('coin');
            coins.push(randomCell);  // Agregamos la moneda a la lista de monedas
        }
    }
}

function heuristic(a, b) {
    // Distancia Manhattan
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(node) {
    const neighbors = [];
    const {x, y} = node;

    if (x > 0) neighbors.push(grid[x - 1][y]);  // Arriba
    if (x < rows - 1) neighbors.push(grid[x + 1][y]);  // Abajo
    if (y > 0) neighbors.push(grid[x][y - 1]);  // Izquierda
    if (y < cols - 1) neighbors.push(grid[x][y + 1]);  // Derecha

    return neighbors;
}

function reconstructPath(current) {
    while (current.parent) {
        current.element.classList.add('path');
        current = current.parent;
    }
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function aStarSearch(start, goal) {
    let openSet = [start];
    let closedSet = [];

    start.g = 0;
    start.h = heuristic(start, goal);
    start.f = start.g + start.h;

    while (openSet.length > 0) {
        let current = openSet.reduce((prev, node) => node.f < prev.f ? node : prev);

        if (current === goal) {
            reconstructPath(current);
            return;
        }

        openSet = openSet.filter(node => node !== current);
        closedSet.push(current);
        current.element.classList.remove('open');
        current.element.classList.add('closed');

        let neighbors = getNeighbors(current).filter(neighbor => !closedSet.includes(neighbor) && !neighbor.isWall);
        for (const neighbor of neighbors) {
            let tentative_g = current.g + 1;

            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
                neighbor.element.classList.add('open');
                await delay(timeExecute);
            } else if (tentative_g >= neighbor.g) {
                continue;
            }

            neighbor.g = tentative_g;
            neighbor.h = heuristic(neighbor, goal);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.parent = current;
            await delay(timeExecute);
        }
    }

    document.getElementById('ruta').innerHTML = '<span>No se encontró el objetivo</span>';
}

async function aStarSearchMultipleGoals(start, goals) {
    let currentStart = start;
    
    // Recorremos las monedas (objetivos intermedios) primero
    for (let i = 0; i < goals.length; i++) {
        await aStarSearch(currentStart, goals[i]);
        currentStart = goals[i];  // Actualizamos el nuevo punto de partida
    }

    // Después de recoger las monedas, vamos al objetivo final
    await aStarSearch(currentStart, goal);
}

createGrid();

document.getElementById('iniciar').addEventListener('click', () => {
    const allGoals = [...coins];  // Monedas como objetivos intermedios
    aStarSearchMultipleGoals(start, allGoals);
    document.getElementById('iniciar').disabled = true;
});
