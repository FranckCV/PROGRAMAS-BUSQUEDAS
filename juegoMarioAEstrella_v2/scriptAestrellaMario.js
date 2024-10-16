// Definicion de Variables

const cols = 10;
const rows = 10;
const sizeCell = 50;
const grid = [];
const timeExecute = 75;
const nivelDificultad = 20;
const enemies = ["muro", "hongo", "tortuga"];
let start, goal;
const sonido = document.querySelector("#sonido");

// Creacion de Tablero

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
                g: 0, // Distancia acumulada desde el inicio
                h: 0, // Heurística (distancia Manhattan hasta el objetivo)
                isWall: false,
                parent: null,
                element: cellElement
            };
            grid[i][j] = cell;
            cellElement.innerHTML = `<span>${i},${j}</span>`;

            if (i === parseInt((rows - 1)) && j === parseInt((cols - 1)/2)) {
                start = cell;
                cellElement.classList.add('start');
                cellElement.setAttribute("id","mario_inicial");
            } else if (i === 0 && j === parseInt((cols - 1)/2)) {
                goal = cell;
                cellElement.classList.add('goal');
                cellElement.setAttribute("id","recompensa");
            }

            // let start_i = getRandomInt(rows);
            // let start_j = getRandomInt(cols);
            // let goal_i = getRandomInt(rows);
            // let goal_j = getRandomInt(cols);

            // while (start_i === goal_i && start_j === goal_j) {
            //     goal_i = getRandomInt(rows);
            //     goal_j = getRandomInt(cols);
            // }

            // for (let i = 0; i < rows; i++) {
            //     for (let j = 0; j < cols; j++) {
            //         if (i === start_i && j === start_j) {
            //             start = cell;
            //             cellElement.classList.add('start');
            //             cellElement.setAttribute("id", "mario_inicial");
            //         } else if (i === goal_i && j === goal_j) {
            //             goal = cell;
            //             cellElement.classList.add('goal');
            //             cellElement.setAttribute("id", "recompensa");
            //         }
            //     }
            // }

            if ((i % 2 == 0 && j % 2 != 0 ) || (j % 2 == 0 && i % 2 != 0 )) {
                cellElement.classList.add("cell_1");
            } else if ((j % 2 != 0 && i % 2 != 0 ) || (j % 2 == 0 && i % 2 == 0 )) {
                cellElement.classList.add("cell_2");
            } 

            if (Math.random() < nivelDificultad / 100 && cell !== start && cell !== goal) {
                cell.isWall = true;
                cellElement.classList.add('wall');
                var indiceAleatorio = getRandomInt(enemies.length);
                cellElement.classList.add(enemies[indiceAleatorio]);
            }
        }
    }
    sonido.innerHTML = '<source src="aud/yt1s.com - Super Mario Bros Soundtrack.mp3" type="audio/mpeg">';
    sonido.load();
    sonido.play();

}

// Informacion de Recorrido

const ruta = document.querySelector('#Ruta');
const arbol = document.querySelector('#Frontera');

function addToFrontera(parent, neighbors) {
    const fronteraContainer = document.getElementById('Frontera');

    // Crear la columna para el nodo padre, si es el inicio se muestra con "-"
    const parentColumn = document.createElement('div');
    parentColumn.classList.add('table-column');

    const parentCostCell = document.createElement('div');
    parentCostCell.classList.add('table-cell');
    parentCostCell.innerHTML = parent ? `<span> ${parent.g} + ${parent.h}</span><b>${parent.f}</b>` : "g: -, h: -, f: -";

    const parentNameCell = document.createElement('div');
    parentNameCell.classList.add('table-cell');
    parentNameCell.innerHTML = parent ? `${parent.x},${parent.y}` : "-";

    parentColumn.appendChild(parentCostCell);
    parentColumn.appendChild(parentNameCell);
    fronteraContainer.appendChild(parentColumn);

    neighbors.forEach(neighbor => {
        const neighborColumn = document.createElement('div');
        neighborColumn.classList.add('table-column');

        const costCell = document.createElement('div');
        costCell.classList.add('table-cell');
        costCell.innerHTML = `
            <span> ${neighbor.g} + ${neighbor.h} </span><b>${neighbor.f}</b>
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
    const fronteraContainer = document.getElementById('Frontera').children;

    sonido.innerHTML = '<source src="aud/gangnam style.mp3" type="audio/mpeg">';
    sonido.load();
    sonido.play();

    const caminoCoords = [];
    
    ruta.innerHTML = '';
    while (current) {
        caminoCoords.push(`${current.x},${current.y}`);
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

    setTimeout(() => {
        for (let column of fronteraContainer) {
            const coords = column.querySelector('.table-cell:last-child').innerText;
            if (caminoCoords.includes(coords)) {
                column.classList.add('final-path'); 
            }
        }
    }, delay * 20);

    
}

// Algoritmo A*

function getNeighbors(node) {
    const neighbors = [];
    const { x, y } = node;

    if (x > 0) neighbors.push(grid[x - 1][y]); // Arriba
    if (x < rows - 1) neighbors.push(grid[x + 1][y]); // Abajo
    if (y > 0) neighbors.push(grid[x][y - 1]); // Izquierda
    if (y < cols - 1) neighbors.push(grid[x][y + 1]); // Derecha

    return neighbors;
}

function heuristic(node, goal) {
    return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y); // Distancia Manhattan
}

function delay(ms) {
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

    ruta.innerHTML = '<span>No se encontró el objetivo</span>';
    sonido.innerHTML = '<source src="aud/loose.mp3" type="audio/mpeg">';
    sonido.load();
    sonido.play();
    document.getElementById("mario_inicial").classList.add('sad_mario');
}

// Preparacion del Juego

createGrid();

const btnEmpezar = document.querySelector('#iniciar');
btnEmpezar.addEventListener('click', () => {
    aStarSearch(start, goal);
    btnEmpezar.disabled = true;
});

document.querySelector('#reiniciar').addEventListener('click', () => {
    location.reload();
});



// const tabla = document.querySelector("#grid");
// const muros = document.querySelectorAll(".wall");
// const inicio = document.getElementById("mario_inicial");
// const final = document.getElementById("recompensa");

// muros.forEach(muro => {
//     tabla.addEventListener("mouseenter", function() {
//         tabla.style.transform = "rotateX(30deg) translateY(-60px) rotateZ(90deg)";
//         muro.style.transform = "rotateY(20deg) rotateZ(-90deg) scaleY(1.2) translateY(-20px)";
//         inicio.style.transform = "rotateY(20deg) rotateZ(-90deg) scaleY(1.2) translateY(-20px)";
//         inicio.style.backgroundColor = "#00000000";
//         final.style.transform = "rotateY(20deg) rotateZ(-90deg) scaleY(1.2) translateY(-20px)";
//     });

//     tabla.addEventListener("mouseleave", function() {
//         tabla.style.transform = "";
//         muro.style.transform = "";
//         inicio.style.transform = "";
//         inicio.style.backgroundColor = "green";
//         final.style.transform = "";
//     });
// })


const tabla = document.querySelector("#grid");
const celdas = document.querySelectorAll(".cell");

celdas.forEach(celda => {
    tabla.addEventListener("mouseenter", function() {
        tabla.style.animation = "giro_grid 7s ease-in-out infinite";
        if (
            celda.classList.contains("wall") || 
            celda.classList.contains("start") || 
            celda.classList.contains("goal") || 
            celda.classList.contains("open")) 
        {
            celda.style.animation = "giro_cell 7s ease-in-out infinite";
        } else {
            celda.querySelector("span").style.animation = "giro_texto 7s ease-in-out infinite";
        }
    });

    tabla.addEventListener("mouseleave", function() {
        tabla.style.animation = "";
        celda.style.animation = "";
        celda.querySelector("span").style.animation = "";
    });
})