const hechos = [
    { tipo: "enPosicion", sujeto: "mario", objeto: { x: 2, y: 8 } },
    { tipo: "enPosicion", sujeto: "enemy", objeto: { x: 2, y: 0 } },
    { tipo: "enPosicion", sujeto: "muro", objeto: { x: 1, y: 4 } },
    { tipo: "enPosicion", sujeto: "muro", objeto: { x: 1, y: 3 } },
    { tipo: "enPosicion", sujeto: "muro", objeto: { x: 7, y: 2 } },
    { tipo: "enPosicion", sujeto: "muro", objeto: { x: 3, y: 4 } },
    { tipo: "enPosicion", sujeto: "muro", objeto: { x: 1, y: 6 } },
    { tipo: "enPosicion", sujeto: "muro", objeto: { x: 2, y: 4 } },
];

const reglas = [
    {
        tipo: "moverIzq",
        cuando: [
            { tipo: "enPosicion", sujeto: "mario", objeto: { x: "Z", y: "X" } },
            { tipo: "enPosicion", sujeto: "enemy", objeto: { x: "Z", y: "Y" } }
        ],
        entonces: { tipo: "moverIzq", sujeto: "X", objeto: "Y" }
    },
    {
        tipo: "moverDer",
        cuando: [
            { tipo: "enPosicion", sujeto: "mario", objeto: { x: "Z", y: "X" } },
            { tipo: "enPosicion", sujeto: "enemy", objeto: { x: "Z", y: "Y" } }
        ],
        entonces: { tipo: "moverDer", sujeto: "Y", objeto: "X" }
    },
];

function compararObjetos(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function generarBindings(condiciones, hechos, bindingActual = {}) {
    if (condiciones.length === 0) {
        return [bindingActual];
    }

    const [condicion, ...restoCondiciones] = condiciones;
    const posiblesBindings = [];

    for (const hecho of hechos) {
        if (condicion.tipo === hecho.tipo) {
            const nuevoBinding = { ...bindingActual };
            let esCompatible = true;

            for (const [variable, valor] of Object.entries(condicion)) {
                if (variable !== "tipo") {
                    if (typeof valor === 'object' && valor !== null) {
                        const hechoObjeto = hecho[variable];
                        if (!compararObjetos(valor, hechoObjeto)) {
                            esCompatible = false;
                            break;
                        } else {
                            nuevoBinding[variable] = valor;
                        }
                    } else if (valor === "X" || valor === "Y" || valor === "Z") {
                        if (
                            nuevoBinding[valor] &&
                            nuevoBinding[valor] !== hecho[variable]
                        ) {
                            esCompatible = false;
                            break;
                        }
                        nuevoBinding[valor] = hecho[variable];
                    } else if (valor !== hecho[variable]) {
                        esCompatible = false;
                        break;
                    }
                }
            }

            if (esCompatible) {
                posiblesBindings.push(
                    ...generarBindings(restoCondiciones, hechos, nuevoBinding)
                );
            }
        }
    }

    return posiblesBindings;
}

function aplicarBinding(plantilla, binding) {
    const hecho = {};
    for (const [key, value] of Object.entries(plantilla)) {
        hecho[key] = binding[value] || value;
    }
    return hecho;
}

function evaluarRegla(regla, hechos) {
    console.log(`Evaluando regla: ${JSON.stringify(regla)}`);
    const posiblesBindings = [];

    const bindings = generarBindings(regla.cuando, hechos);
    for (const binding of bindings) {
        const yaRegistrado = hechos.some(
            (hecho) =>
                hecho.tipo === "sonHermanos" &&
                ((hecho.sujeto === binding.X && hecho.objeto === binding.Y) ||
                    (hecho.sujeto === binding.Y && hecho.objeto === binding.X))
        );
        if (!yaRegistrado) {
            posiblesBindings.push(binding);
        }
    }

    console.log(`Posibles bindings: ${JSON.stringify(posiblesBindings)}`);

    const soluciones = posiblesBindings.map((binding) =>
        aplicarBinding(regla.entonces, binding)
    );

    console.log(`Soluciones encontradas: ${JSON.stringify(soluciones)}`);
    return soluciones;
}

function consultar(consulta, hechos, reglas) {
    console.log(`Realizando consulta: ${JSON.stringify(consulta)}`);

    const resultadosHechos = hechos.filter((hecho) =>
        Object.entries(consulta).every(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                return compararObjetos(hecho[key], value);  // Comparación profunda
            }
            return hecho[key] === value;
        })
    );
    console.log(`Resultados directos de hechos: ${JSON.stringify(resultadosHechos)}`);

    const resultadosReglas = reglas.flatMap((regla) =>
        evaluarRegla(regla, hechos).filter((resultado) =>
            Object.entries(consulta).every(([key, value]) => resultado[key] === value || resultado[key] === undefined)
        )
    );
    console.log(`Resultados generados por reglas: ${JSON.stringify(resultadosReglas)}`);

    const todosLosResultados = [
        ...resultadosHechos,
        ...resultadosReglas,
    ];

    const resultadosUnicos = Array.from(
        new Set(todosLosResultados.map((resultado) => JSON.stringify(resultado)))
    ).map((resultado) => JSON.parse(resultado));

    console.log(`Resultados combinados y únicos: ${JSON.stringify(resultadosUnicos)}`);
    return resultadosUnicos;
}

const texto = document.querySelector('#texto');


var xdxdxd = consultar(
    { 
        tipo: "moverIzq",
        sujeto: "0",
        objeto: "8"
    }, 
    hechos, 
    reglas
);

var aaaaaaa = consultar(
    { 
        tipo: "moverDer",
        sujeto: "0",
        objeto: "8"
    }, 
    hechos, 
    reglas
);

xdxdxd.forEach(rpta => {
    texto.innerHTML +=  rpta.tipo;
    texto.innerHTML +=  `<br>`;
    texto.innerHTML +=  rpta.sujeto;
    texto.innerHTML +=  `<br>`;
    texto.innerHTML +=  rpta.objeto;
    texto.innerHTML +=  `<br>`;
    texto.innerHTML +=  JSON.stringify(rpta.objeto);
    texto.innerHTML +=  `<br>`;
    texto.innerHTML +=  rpta.objeto.x+","+rpta.objeto.y;
    texto.innerHTML +=  `<br>`;
    texto.innerHTML +=  `<br>`;
});

aaaaaaa.forEach(rpta => {
    texto.innerHTML +=  rpta.tipo;
    texto.innerHTML +=  `<br>`;
    texto.innerHTML +=  rpta.sujeto;
    texto.innerHTML +=  `<br>`;
    texto.innerHTML +=  rpta.objeto;
    texto.innerHTML +=  `<br>`;
    texto.innerHTML +=  JSON.stringify(rpta.objeto);
    texto.innerHTML +=  `<br>`;
    texto.innerHTML +=  rpta.objeto.x+","+rpta.objeto.y;
    texto.innerHTML +=  `<br>`;
    texto.innerHTML +=  `<br>`;
});




// const hechos = [
//     { tipo: "enPosicion", sujeto: "mario", objeto: {x:2 , y:8} },
//     { tipo: "enPosicion", sujeto: "enemy", objeto: {x:2 , y:0} },
//     { tipo: "enPosicion", sujeto: "muro", objeto: {x:1 , y:4} },
//     { tipo: "enPosicion", sujeto: "muro", objeto: {x:1 , y:3} },
//     { tipo: "enPosicion", sujeto: "muro", objeto: {x:7 , y:2} },
//     { tipo: "enPosicion", sujeto: "muro", objeto: {x:3 , y:4} },
//     { tipo: "enPosicion", sujeto: "muro", objeto: {x:1 , y:6} },
//     { tipo: "enPosicion", sujeto: "muro", objeto: {x:2 , y:4} },
// ];

// const reglas = [
//     {
//         tipo: "moverIzq",
//         cuando: [
//             { tipo: "enPosicion", sujeto: "mario", objeto: {x:"Z",y:"X"}  },
//             { tipo: "enPosicion", sujeto: "enemy", objeto: {x:"Z",y:"Y"} }
//         ],
//         entonces: { tipo: "moverIzq", sujeto: "X", objeto: "Y" }
//     },
//     {
//         tipo: "moverDer",
//         cuando: [
//             { tipo: "enPosicion", sujeto: "mario", objeto: {x:"Z",y:"X"}  },
//             { tipo: "enPosicion", sujeto: "enemy", objeto: {x:"Z",y:"Y"} }
//         ],
//         entonces: { tipo: "moverDer", sujeto: "Y", objeto: "X" }
//     },
// ];


// function compararObjetos(obj1, obj2) {
//     return JSON.stringify(obj1) === JSON.stringify(obj2);
// }

// function generarBindings(condiciones, hechos, bindingActual = {}) {
//     if (condiciones.length === 0) {
//         return [bindingActual];
//     }

//     const [condicion, ...restoCondiciones] = condiciones;
//     const posiblesBindings = [];

//     for (const hecho of hechos) {
//         if (condicion.tipo === hecho.tipo) {
//             const nuevoBinding = { ...bindingActual };
//             let esCompatible = true;

//             for (const [variable, valor] of Object.entries(condicion)) {
//                 if (variable !== "tipo") {
//                     if (typeof valor === 'object' && valor !== null) {
//                         const hechoObjeto = hecho[variable];
//                         if (!compararObjetos(valor, hechoObjeto)) {
//                             esCompatible = false;
//                             break;
//                         } else {
//                             nuevoBinding[variable] = valor;
//                         }
//                     } else if (valor === "X" || valor === "Y" || valor === "Z") {
//                         if (
//                             nuevoBinding[valor] &&
//                             nuevoBinding[valor] !== hecho[variable]
//                         ) {
//                             esCompatible = false;
//                             break;
//                         }
//                         nuevoBinding[valor] = hecho[variable];
//                     } else if (valor !== hecho[variable]) {
//                         esCompatible = false;
//                         break;
//                     }
//                 }
//             }

//             if (esCompatible) {
//                 posiblesBindings.push(
//                     ...generarBindings(restoCondiciones, hechos, nuevoBinding)
//                 );
//             }
//         }
//     }

//     return posiblesBindings;
// }

// function aplicarBinding(plantilla, binding) {
//     const hecho = {};
//     for (const [key, value] of Object.entries(plantilla)) {
//         hecho[key] = binding[value] || value;
//     }
//     return hecho;
// }

// function evaluarRegla(regla, hechos) {
//     console.log(`Evaluando regla: ${JSON.stringify(regla)}`);
//     const posiblesBindings = [];

//     const bindings = generarBindings(regla.cuando, hechos);
//     for (const binding of bindings) {
//         if (regla.tipo === "sonHermanos" && binding.X === binding.Y) {
//             continue;
//         }

//         const yaRegistrado = hechos.some(
//             (hecho) =>
//                 hecho.tipo === "sonHermanos" &&
//                 ((hecho.sujeto === binding.X && hecho.objeto === binding.Y) ||
//                     (hecho.sujeto === binding.Y && hecho.objeto === binding.X))
//         );
//         if (!yaRegistrado) {
//             posiblesBindings.push(binding);
//         }
//     }

//     console.log(`Posibles bindings: ${JSON.stringify(posiblesBindings)}`);

//     const soluciones = posiblesBindings.map((binding) =>
//         aplicarBinding(regla.entonces, binding)
//     );

//     console.log(`Soluciones encontradas: ${JSON.stringify(soluciones)}`);
//     return soluciones;
// }

// function consultar(consulta, hechos, reglas) {
//     console.log(`Realizando consulta: ${JSON.stringify(consulta)}`);

//     const resultadosHechos = hechos.filter((hecho) =>
//         Object.entries(consulta).every(([key, value]) => {
//             if (typeof value === 'object' && value !== null) {
//                 return compararObjetos(hecho[key], value);  // Comparación profunda
//             }
//             return hecho[key] === value;
//         })
//     );
//     console.log(`Resultados directos de hechos: ${JSON.stringify(resultadosHechos)}`);

//     const resultadosReglas = reglas.flatMap((regla) =>
//         evaluarRegla(regla, hechos).filter((resultado) =>
//             Object.entries(consulta).every(([key, value]) => resultado[key] === value || resultado[key] === undefined)
//         )
//     );
//     console.log(`Resultados generados por reglas: ${JSON.stringify(resultadosReglas)}`);

//     const todosLosResultados = [
//         ...resultadosHechos,
//         ...resultadosReglas,
//     ];

//     const resultadosUnicos = Array.from(
//         new Set(todosLosResultados.map((resultado) => JSON.stringify(resultado)))
//     ).map((resultado) => JSON.parse(resultado));

//     console.log(`Resultados combinados y únicos: ${JSON.stringify(resultadosUnicos)}`);
//     return resultadosUnicos;
// }





// const texto = document.querySelector('#texto');


// var xdxdxd = 
// // consultar(
// //     { 
// //         tipo: "enPosicion" ,
// //         sujeto: "muro"
// //     }, 
// //     hechos, 
// //     reglas
// // );

// // consultar(
// //     { 
// //         tipo: "enPosicion",
// //         objeto: { x: 2, y: 8}
// //     }, 
// //     hechos, 
// //     reglas
// // );

// consultar(
//     { 
//         tipo: "moverIzq",
//         objeto: { x: 8, y: 0}
//     }, 
//     hechos, 
//     reglas
// );



// xdxdxd.forEach(rpta => {
//     texto.innerHTML +=  rpta.tipo;
//     texto.innerHTML +=  `<br>`;
//     texto.innerHTML +=  rpta.sujeto;
//     texto.innerHTML +=  `<br>`;
//     texto.innerHTML +=  rpta.objeto;
//     texto.innerHTML +=  `<br>`;
//     texto.innerHTML +=  JSON.stringify(rpta.objeto);
//     texto.innerHTML +=  `<br>`;
//     texto.innerHTML +=  rpta.objeto.x+","+rpta.objeto.y;
//     texto.innerHTML +=  `<br>`;
//     texto.innerHTML +=  `<br>`;
// });



