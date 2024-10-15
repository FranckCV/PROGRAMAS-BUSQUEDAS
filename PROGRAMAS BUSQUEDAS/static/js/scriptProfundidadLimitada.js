const cols = 5;
const rows = 5;
const sizeCell = 65;
const grid = [];
const timeExecute = 100;
let start, goal;
let maximoDepth = 5;

const campo = document.querySelector("#Nodo");
document.addEventListener('DOMContentLoaded',() => {
    document.querySelector("#campoNodo .tittle").innerText = "NIVEL";
    campo.innerHTML = `
        <input type="number" min="0" max="10" value="5">
    `;
    
    const campoNum = campo.querySelector("input");
    campoNum.addEventListener('click',() => {
        maximoDepth = campoNum.value;
        actualizarLevel();
    });    
});

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
                g: 0, // Distancia acumulada desde el inicio
                h: 0, // Heurística
                isWall: false,
                parent: null,
                depth: 0, // Profundidad actual
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

            if (Math.random() < 0.2 && cell !== start && cell !== goal) {
                cell.isWall = true;
                cellElement.classList.add('wall');
            }

        }
    }

    actualizarLevel();

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

function actualizarLevel() {
    ruta.innerHTML = `<span class="error">Nivel Maximo: ${maximoDepth}</span>`;
}

function addToFrontera(parent, neighbors) {
    const fronteraContainer = document.getElementById('Frontera');

    neighbors.forEach(neighbor => {
        if (neighbor === parent) return;

        if (neighbor.isWall || neighbor.parent) return;

        neighbor.g = parent.g + 1;

        const neighborColumn = document.createElement('div');
        neighborColumn.classList.add('table-column');

        const costCell = document.createElement('div');
        costCell.classList.add('table-cell');
        costCell.innerHTML = `<p><b>-</b></p>`; 

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

        neighbor.parent = parent;
    });
}


function updateNodoActual(current) {
    const nodoElement = document.getElementById('Nodo');
    document.querySelector("#campoNodo .tittle").innerHTML = "NODO";
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getNeighbors(node) {
    const neighbors = [];
    const { x, y } = node;

    if (x > 0 && !grid[x - 1][y].isWall) neighbors.push(grid[x - 1][y]); // Arriba
    if (x < rows - 1 && !grid[x + 1][y].isWall) neighbors.push(grid[x + 1][y]); // Abajo
    if (y > 0 && !grid[x][y - 1].isWall) neighbors.push(grid[x][y - 1]); // Izquierda
    if (y < cols - 1 && !grid[x][y + 1].isWall) neighbors.push(grid[x][y + 1]); // Derecha

    return neighbors;
}

async function depthLimitedSearch(node, goal, depth, maxDepth) {
    let closedSet = [];

    async function dfs(current, depth) {
        if (depth > maxDepth) return false;

        updateNodoActual(current);
        addToFrontera(current, getNeighbors(current).filter(n => !n.isWall && !closedSet.includes(n))); // Solo vecinos válidos
        await delay(timeExecute);

        if (current === goal) {
            reconstructPath(current);
            return true;
        }

        closedSet.push(current);
        current.element.classList.add('closed');
        updateExplorados(closedSet);

        const neighbors = getNeighbors(current).filter(neighbor => 
            !neighbor.isWall && 
            !closedSet.includes(neighbor) && 
            neighbor !== current.parent // Evitar repetición de padre e hijo
        );

        for (const neighbor of neighbors) {
            neighbor.parent = current;
            neighbor.depth = current.depth + 1;

            const found = await dfs(neighbor, depth + 1);
            if (found) return true;
        }

        return false;
    }

    const found = await dfs(node, 0);

    if (!found) {
        ruta.innerHTML += '<span class="error">No se encontró solución</span>';
        arbol.innerHTML += '<span class="error">No se encontró solución</span>';
    }
}


createGrid();

actualizarLevel();

const btnEmpezar = document.querySelector('#iniciar');
btnEmpezar.addEventListener('click', () => {
    depthLimitedSearch(start, goal, 0 , maximoDepth);
    btnEmpezar.disabled = true;
});

document.querySelector('#reiniciar').addEventListener('click', () => {
    location.reload();
});
