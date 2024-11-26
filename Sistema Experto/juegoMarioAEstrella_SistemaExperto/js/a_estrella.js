// const x_start = 9;
// const y_start = 5;

// const x_goal = 0;
// const y_goal = 5;





// const cols = 10, rows = 10, sizeCell = 50, timeExecute = 200;
// const nivelDificultad = 20;
// const grid = [];
// const walls = ["muro"];
// let start, goal, mario, enemy;

// function createGrid() {
//     const gridElement = document.getElementById('grid');
//     gridElement.style.gridTemplateColumns = `repeat(${cols}, ${sizeCell}px)`;
//     gridElement.style.gridTemplateRows = `repeat(${rows}, ${sizeCell}px)`;

//     for (let i = 0; i < rows; i++) {
//         grid[i] = [];
//         for (let j = 0; j < cols; j++) {
//             const cellElement = document.createElement('div');
//             cellElement.classList.add('cell');
//             gridElement.appendChild(cellElement);

//             const cell = {
//                 x: i,
//                 y: j,
//                 f: 0,
//                 g: 0,
//                 h: 0,
//                 isWall: false,
//                 parent: null,
//                 element: cellElement,
//             };
//             grid[i][j] = cell;
//             cellElement.innerHTML = `<span>${i},${j}</span>`;

//             if (i === x_start && j === y_start) {
//                 start = cell;
//                 cellElement.classList.add('start');
//             } else if (i === x_goal && j === y_goal) {
//                 goal = cell;
//                 cellElement.classList.add('goal');
//             }

//             if ((i % 2 == 0 && j % 2 != 0) || (j % 2 == 0 && i % 2 != 0)) {
//                 cellElement.classList.add("cell_1");
//             } else if ((j % 2 != 0 && i % 2 != 0) || (j % 2 == 0 && i % 2 == 0)) {
//                 cellElement.classList.add("cell_2");
//             }

//             if (Math.random() < nivelDificultad / 100 && cell !== start && cell !== goal) {
//                 cell.isWall = true;
//                 cellElement.classList.add('wall');
//                 const randomWall = getRandomInt(walls.length);
//                 cellElement.classList.add(walls[randomWall]);
//             }
//         }
//     }

//     mario = start;
//     placeEnemy();
// }

// function getNeighbors(node) {
//     const { x, y } = node;
//     const neighbors = [];
//     if (x > 0) neighbors.push(grid[x - 1][y]);
//     if (x < rows - 1) neighbors.push(grid[x + 1][y]);
//     if (y > 0) neighbors.push(grid[x][y - 1]);
//     if (y < cols - 1) neighbors.push(grid[x][y + 1]);
//     return neighbors;
// }

// function heuristic(a, b) {
//     return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Distancia Manhattan
// }

// async function aStar(start, goal) {
//     const openSet = [start];
//     const closedSet = [];
//     start.g = 0;
//     start.h = heuristic(start, goal);
//     start.f = start.g + start.h;

//     while (openSet.length > 0) {
//         let current = openSet.reduce((a, b) => (a.f < b.f ? a : b));

//         if (current === goal) {
//             const path = reconstructPath(current);
//             await moveMario(path);
//             return path;
//         }

//         openSet.splice(openSet.indexOf(current), 1);
//         closedSet.push(current);

//         for (const neighbor of getNeighbors(current)) {
//             if (neighbor.isWall || closedSet.includes(neighbor) || neighbor === enemy) continue;

//             const tentativeG = current.g + 1;
//             if (tentativeG < neighbor.g || !openSet.includes(neighbor)) {
//                 neighbor.g = tentativeG;
//                 neighbor.h = heuristic(neighbor, goal);
//                 neighbor.f = neighbor.g + neighbor.h;
//                 neighbor.parent = current;

//                 if (!openSet.includes(neighbor)) openSet.push(neighbor);
//             }
//         }
//     }
//     console.warn("No se encontró una ruta válida.");
//     return null;
// }

// function reconstructPath(node) {
//     const path = [];
//     while (node) {
//         path.push(node);
//         node = node.parent;
//     }
//     return path.reverse();
// }

// async function moveMario(path) {
//     for (const cell of path) {
//         mario.element.classList.remove('start');
//         mario = cell;
//         mario.element.classList.add('start');
//         mario.element.classList.add('path');
//         await new Promise(resolve => setTimeout(resolve, timeExecute));
//     }
// }

// function placeEnemy() {
//     let enemyCell;
//     do {
//         const x = getRandomInt(rows);
//         const y = getRandomInt(cols);
//         enemyCell = grid[x][y];
//     } while (enemyCell.isWall || enemyCell === start || enemyCell === goal);

//     enemy = enemyCell;
//     enemy.element.classList.add('enemy');
// }



