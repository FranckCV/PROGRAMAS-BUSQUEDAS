const cols = 5;
const rows = 5;
const sizeCell = 65;
const grid = [];
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
                f: 0,
                g: (Math.floor(Math.random() * 10) + 1) * 10, // Random initial cost
                h: 0,
                isWall: false,
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

            if (Math.random() < 0.2 && cell !== start && cell !== goal) {
                cell.isWall = true;
                cellElement.classList.add('wall');
            }
            
            if (!cell.isWall && cell !== start && cell !== goal) {
                cellElement.innerHTML += `<p class="costo">costo= ${cell.g}</p>`;
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

    // Crear la columna para el nodo padre, si es el inicio se muestra con "-"
    const parentColumn = document.createElement('div');
    parentColumn.classList.add('table-column');

    // Celda de costo del nodo padre
    const parentCostCell = document.createElement('div');
    parentCostCell.classList.add('table-cell');
    parentCostCell.innerText = parent ? parent.g : 0; // Costo es 0 si no hay padre (nodo inicial)

    // Celda separadora que solo debe ser "-" si el nodo es el inicial
    const separatorCell = document.createElement('div');
    separatorCell.classList.add('table-cell');
    separatorCell.innerText = parent.parent ? `${parent.x},${parent.y}` : '-';

    // Celda con las coordenadas del nodo padre
    const parentNameCell = document.createElement('div');
    parentNameCell.classList.add('table-cell');
    parentNameCell.innerText = parent ? `${parent.x},${parent.y}` : "-";

    // Agregar las celdas al contenedor de la columna del nodo padre
    parentColumn.appendChild(parentCostCell);
    parentColumn.appendChild(separatorCell);
    parentColumn.appendChild(parentNameCell);
    fronteraContainer.appendChild(parentColumn);

    // Añadir columnas para cada vecino
    neighbors.forEach(neighbor => {
        const neighborColumn = document.createElement('div');
        neighborColumn.classList.add('table-column');

        // Celda de costo calculado
        const costCell = document.createElement('div');
        costCell.classList.add('table-cell');
        costCell.innerHTML = `<p>${parent.g} + ${neighbor.g}</p><p><b>${parent.g + neighbor.g}</b></p>`;

        // Celda que indica el nodo padre del vecino
        const parentNodeCell = document.createElement('div');
        parentNodeCell.classList.add('table-cell');
        parentNodeCell.innerText = `${parent.x},${parent.y}`;

        // Celda con las coordenadas del vecino
        const neighborCell = document.createElement('div');
        neighborCell.classList.add('table-cell');
        neighborCell.innerText = `${neighbor.x},${neighbor.y}`;

        // Agregar las celdas a la columna del vecino
        neighborColumn.appendChild(costCell);
        neighborColumn.appendChild(parentNodeCell);
        neighborColumn.appendChild(neighborCell);

        fronteraContainer.appendChild(neighborColumn);
    });
}

function updateNodoActual(current) {
    const nodoElement = document.getElementById('Nodo');
    nodoElement.innerHTML = `<p>${current.x},${current.y}</p>`; // Muestra el nodo actual
}

function updateExplorados(closedSet) {
    const exploradosElement = document.getElementById('Explorados');
    exploradosElement.innerHTML = ''; // Limpiar explorados antes de agregar nuevos nodos

    closedSet.forEach(node => {
        const nodeElement = document.createElement('p');
        nodeElement.innerText = `${node.x},${node.y}`;
        exploradosElement.appendChild(nodeElement);
    });
}

function reconstructPath(current) {
    let delay = 0;
    ruta.innerHTML = ``;
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

async function uniformCostSearch(start, goal) {
    let openSet = [start];
    let closedSet = [];

    start.g = 0;

    while (openSet.length > 0) {
        let current = openSet.reduce((prev, node) => node.g < prev.g ? node : prev);

        updateNodoActual(current);

        addToFrontera(current, getNeighbors(current).filter(neighbor => !closedSet.includes(neighbor) && !neighbor.isWall));
        await delay(50);

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
            let tentative_g = current.g + neighbor.g;

            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
                neighbor.element.classList.add('open');
                await delay(50);
            } else if (tentative_g >= neighbor.g) {
                continue;
            }

            neighbor.g = tentative_g;
            neighbor.parent = current;

            await delay(50);
        }
    }
    ruta.innerHTML = '<span class="error">No se encontró el objetivo</span>';

}

createGrid();

const btnEmpezar = document.querySelector('#iniciar');
btnEmpezar.addEventListener('click', () => {
    uniformCostSearch(start, goal);
    btnEmpezar.disabled = true;
});


document.querySelector('#reiniciar').addEventListener('click', () => {
    location.reload();
});
