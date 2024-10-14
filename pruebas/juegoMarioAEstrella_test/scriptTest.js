const cols = 15;
const rows = 5;
const sizeCell = 65;
const grid = [];
const timeExecute = 75;
const nivelDificultad = 25;
let start, goal;

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
                f: Infinity, // f inicial debe ser infinito para que la primera comparación siempre sea menor
                g: Infinity, // g inicial debe ser infinito para evitar que los valores se sumen incorrectamente
                h: 0,
                isWall: false,
                parent: null,
                element: cellElement
            };
            grid[i][j] = cell;
            cellElement.innerHTML = `<span>${i},${j}</span>`;

            // Definir la celda de inicio y la meta
            if (i === rows - 1 && j === 0) {
                start = cell;
                cellElement.classList.add('start');
            } else if (i === rows - 1 && j === cols - 1) {
                goal = cell;
                cellElement.classList.add('goal');
            }

            // Generar muros aleatorios en base a nivelDificultad
            if (Math.random() < nivelDificultad / 100 && cell !== start && cell !== goal) {
                cell.isWall = true;
                cellElement.classList.add('wall');
            }
        }
    }
}

function getNeighbors(node) {
    const neighbors = [];
    const { x, y } = node;

    if (x > 0) neighbors.push(grid[x - 1][y]); // Arriba
    if (x < rows - 1) neighbors.push(grid[x + 1][y]); // Abajo
    if (y > 0) neighbors.push(grid[x][y - 1]); // Izquierda
    if (y < cols - 1) neighbors.push(grid[x][y + 1]); // Derecha

    return neighbors;
}

const ruta = document.querySelector('#Ruta');
const arbol = document.querySelector('#Frontera');

function addToFrontera(parent, neighbors) {
    const fronteraContainer = document.getElementById('Frontera');

    // Crear la columna para el nodo padre
    const parentColumn = document.createElement('div');
    parentColumn.classList.add('table-column');

    const parentCostCell = document.createElement('div');
    parentCostCell.classList.add('table-cell');
    parentCostCell.innerText = parent ? parent.g : 0;

    const separatorCell = document.createElement('div');
    separatorCell.classList.add('table-cell');
    separatorCell.innerText = parent.parent ? `${parent.x},${parent.y}` : '-';

    const parentNameCell = document.createElement('div');
    parentNameCell.classList.add('table-cell');
    parentNameCell.innerText = parent ? `${parent.x},${parent.y}` : "-";

    parentColumn.appendChild(parentCostCell);
    parentColumn.appendChild(separatorCell);
    parentColumn.appendChild(parentNameCell);
    fronteraContainer.appendChild(parentColumn);

    neighbors.forEach(neighbor => {
        const neighborColumn = document.createElement('div');
        neighborColumn.classList.add('table-column');
        
        // var valorG = 0;

        // if (neighbor.g == Infinity) {
        //     valorG = 0;
        // } else {
        //     valorG == neighbor.g;
        // }

        const costCell = document.createElement('div');
        costCell.classList.add('table-cell');
        costCell.innerHTML = `
            <p>g(n): ${neighbor.g}</p>
            <p>h(n): ${neighbor.h}</p>
            <p><b>f(n): ${neighbor.g + neighbor.h}</b></p>
        `;

        const parentNodeCell = document.createElement('div');
        parentNodeCell.classList.add('table-cell');
        parentNodeCell.innerText = `${parent.x},${parent.y}`;

        const neighborCell = document.createElement('div');
        neighborCell.classList.add('table-cell');
        neighborCell.innerText = `${neighbor.x},${neighbor.y}`;

        neighborColumn.appendChild(costCell);
        neighborColumn.appendChild(parentNodeCell);
        neighborColumn.appendChild(neighborCell);

        fronteraContainer.appendChild(neighborColumn);
    });
}

function updateNodoActual(current) {
    const nodoElement = document.getElementById('Nodo');
    nodoElement.innerHTML = `<p>${current.x},${current.y}</p>`;
}

function updateExplorados(closedSet) {
    const exploradosElement = document.getElementById('Explorados');
    exploradosElement.innerHTML = '';

    closedSet.forEach(node => {
        const nodeElement = document.createElement('p');
        nodeElement.innerText = `${node.x},${node.y}`;
        exploradosElement.appendChild(nodeElement);
    });
}

function reconstructPath(current) {
    let delay = 0;
    ruta.innerHTML = '';
    while (current) {
        const node = current;
        setTimeout(() => {
            if (node && node.element) {
                node.element.classList.add('path');
                ruta.innerHTML += `<p>${node.x},${node.y}</p>`;
            }
        }, delay * 20);
        current = current.parent;
        delay++;
    }
}

function heuristic(node, goal) {
    return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y); // Distancia Manhattan
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function busqueda_Aestrella(start, goal) {
    let openSet = [start];
    let closedSet = [];

    start.g = 0;
    start.h = heuristic(start, goal);
    start.f = start.g + start.h;

    while (openSet.length > 0) {
        let current = openSet.reduce((prev, node) => node.f < prev.f ? node : prev);

        updateNodoActual(current);
        addToFrontera(current, getNeighbors(current).filter(neighbor => !closedSet.includes(neighbor) && !neighbor.isWall));
        await delay(timeExecute);

        if (current === goal) {
            reconstructPath(current);
            return;
        }

        openSet = openSet.filter(node => node !== current);
        closedSet.push(current);
        current.element.classList.remove('open');
        current.element.classList.add('closed');
        updateExplorados(closedSet);

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
}

createGrid();

// Botón para iniciar la búsqueda
const btnEmpezar = document.querySelector('#iniciar');
btnEmpezar.addEventListener('click', () => {
    busqueda_Aestrella(start, goal);
    btnEmpezar.disabled = true;
});

// Botón para reiniciar
document.querySelector('#reiniciar').addEventListener('click', () => {
    location.reload();
});
