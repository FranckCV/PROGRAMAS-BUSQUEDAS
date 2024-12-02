

const hechos = [
    { tipo: "enPosicion", sujeto: "mario", objeto: { x: 2, y: 8 } }, // Mario en (2, 8)
    { tipo: "enPosicion", sujeto: "enemy", objeto: { x: 2, y: 5 } }  // Enemigo en (2, 5)
];

const reglas = [
    {
        tipo: "moverIzq",
        cuando: [
            { tipo: "enPosicion", sujeto: "enemy", objeto: { x: "X", y: "Y" } }, // Enemigo en X, Y
            { tipo: "enPosicion", sujeto: "mario", objeto: { x: "X", y: "Y-1" } }  // Mario a la izquierda de enemy
        ],
        entonces: { tipo: "moverIzq", sujeto: "enemy", objeto: "Y-1" } // El enemigo se mueve a la izquierda
    },
    {
        tipo: "moverDer",
        cuando: [
            { tipo: "enPosicion", sujeto: "enemy", objeto: { x: "X", y: "Y" } }, // Enemigo en X, Y
            { tipo: "enPosicion", sujeto: "mario", objeto: { x: "X", y: "Y+1" } }  // Mario a la derecha de enemy
        ],
        entonces: { tipo: "moverDer", sujeto: "enemy", objeto: "Y+1" } // El enemigo se mueve a la derecha
    },
    {
        tipo: "moverArr",
        cuando: [
            { tipo: "enPosicion", sujeto: "enemy", objeto: { x: "X", y: "Y" } }, // Enemigo en X, Y
            { tipo: "enPosicion", sujeto: "mario", objeto: { x: "X-1", y: "Y" } }  // Mario arriba de enemy
        ],
        entonces: { tipo: "moverArr", sujeto: "enemy", objeto: "X-1" } // El enemigo se mueve hacia arriba
    },
    {
        tipo: "moverAba",
        cuando: [
            { tipo: "enPosicion", sujeto: "enemy", objeto: { x: "X", y: "Y" } }, // Enemigo en X, Y
            { tipo: "enPosicion", sujeto: "mario", objeto: { x: "X+1", y: "Y" } }  // Mario abajo de enemy
        ],
        entonces: { tipo: "moverAba", sujeto: "enemy", objeto: "X+1" } // El enemigo se mueve hacia abajo
    }
];

// Función para generar posibles bindings entre hechos y condiciones
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
                    if (valor === "X" || valor === "Y") {
                        if (nuevoBinding[valor] && nuevoBinding[valor] !== hecho[variable]) {
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

// Función para aplicar los bindings a las plantillas de la regla
function aplicarBinding(plantilla, binding) {
    const hecho = {};
    for (const [key, value] of Object.entries(plantilla)) {
        hecho[key] = binding[value] || value;
    }
    return hecho;
}

// Evaluar la regla y obtener los resultados
function evaluarRegla(regla, hechos) {
    const posiblesBindings = [];

    const bindings = generarBindings(regla.cuando, hechos);
    for (const binding of bindings) {
        posiblesBindings.push(binding);
    }

    // Generar los hechos basados en los posibles bindings
    const soluciones = posiblesBindings.map((binding) =>
        aplicarBinding(regla.entonces, binding)
    );

    return soluciones;
}

// Función de consulta para buscar hechos y aplicar reglas
function consultar(consulta, hechos, reglas) {
    // Filtrar los hechos que coinciden directamente con la consulta
    const resultadosHechos = hechos.filter((hecho) =>
        Object.entries(consulta).every(([key, value]) => hecho[key] === value)
    );

    // Generar resultados a partir de las reglas
    const resultadosReglas = reglas.flatMap((regla) =>
        evaluarRegla(regla, hechos).filter((resultado) =>
            Object.entries(consulta).every(([key, value]) => resultado[key] === value || resultado[key] === undefined)
        )
    );

    // Concatenar todos los resultados y eliminar duplicados
    const todosLosResultados = [
        ...resultadosHechos,
        ...resultadosReglas,
    ];

    // Eliminar duplicados (hechos idénticos)
    const resultadosUnicos = Array.from(
        new Set(todosLosResultados.map((resultado) => JSON.stringify(resultado)))
    ).map((resultado) => JSON.parse(resultado));

    return resultadosUnicos;
}

// Prueba con la regla y los hechos
let resultado = evaluarRegla(reglas[0], hechos);
console.log(resultado); // Esperado: "moverIzq" para el enemigo





























// // const hechos = [
// //     { tipo: "esHombre", sujeto: "juan" },
// //     { tipo: "esHombre", sujeto: "luis" },
// //     { tipo: "esHombre", sujeto: "pedro" },
// //     { tipo: "esHombre", sujeto: "piero" },
// //     { tipo: "esHombre", sujeto: "joel" },
// //     { tipo: "esMujer", sujeto: "ana" },
// //     { tipo: "esMujer", sujeto: "maria" },
// //     { tipo: "esMujer", sujeto: "karla" },
// //     { tipo: "esPadre", sujeto: "juan", objeto: "luis" },
// //     { tipo: "esPadre", sujeto: "juan", objeto: "joel" },
// //     { tipo: "esPadre", sujeto: "luis", objeto: "piero" },
// //     { tipo: "esPadre", sujeto: "pedro", objeto: "karla" },
// //     { tipo: "esPadre", sujeto: "juan", objeto: "maria" },
// //     { tipo: "esMadre", sujeto: "ana", objeto: "maria" },
// //     { tipo: "esMadre", sujeto: "maria", objeto: "karla" }
// // ];







// // const hechos = [
// //     { tipo: "enPosicion", sujeto: "mario", objeto: { x: 9, y: 0 } },
// //     { tipo: "enPosicion", sujeto: "enemy", objeto: { x: 9, y: 9 } },
// //     { tipo: "enPosicion", sujeto: "goal", objeto: { x: 0, y: 0 } },
// //     { tipo: "enPosicion", sujeto: "muro", objeto: { x: 5, y: 5 } }
// // ];


// // const reglas = [
// //     {
// //         tipo: "esAbuelo",
// //         cuando: [
// //             { tipo: "esPadre", sujeto: "X", objeto: "Z" },
// //             { tipo: "esPadre", sujeto: "Z", objeto: "Y" }
// //         ],
// //         entonces: { tipo: "esAbuelo", sujeto: "X", objeto: "Y" }
// //     },
// //     {
// //         tipo: "sonHermanos",
// //         cuando: [
// //             { tipo: "esPadre", sujeto: "Z", objeto: "X" },
// //             { tipo: "esPadre", sujeto: "Z", objeto: "Y" }
// //         ],
// //         entonces: { tipo: "sonHermanos", sujeto: "X", objeto: "Y" }
// //     }
// // ];




// // function generarBindings(condiciones, hechos, bindingActual = {}) {
// //     if (condiciones.length === 0) {
// //         return [bindingActual];
// //     }

// //     const [condicion, ...restoCondiciones] = condiciones;
// //     const posiblesBindings = [];

// //     for (const hecho of hechos) {
// //         if (condicion.tipo === hecho.tipo) {
// //             const nuevoBinding = { ...bindingActual };
// //             let esCompatible = true;

// //             for (const [variable, valor] of Object.entries(condicion)) {
// //                 if (variable !== "tipo") {
// //                     if (valor === "X" || valor === "Y" || valor === "Z") {
// //                         if (
// //                             nuevoBinding[valor] &&
// //                             nuevoBinding[valor] !== hecho[variable]
// //                         ) {
// //                             esCompatible = false;
// //                             break;
// //                         }
// //                         nuevoBinding[valor] = hecho[variable];
// //                     } else if (valor !== hecho[variable]) {
// //                         esCompatible = false;
// //                         break;
// //                     }
// //                 }
// //             }

// //             if (esCompatible) {
// //                 posiblesBindings.push(
// //                     ...generarBindings(restoCondiciones, hechos, nuevoBinding)
// //                 );
// //             }
// //         }
// //     }

// //     return posiblesBindings;
// // }

// // function aplicarBinding(plantilla, binding) {
// //     const hecho = {};
// //     for (const [key, value] of Object.entries(plantilla)) {
// //         hecho[key] = binding[value] || value;
// //     }
// //     return hecho;
// // }

// // function evaluarRegla(regla, hechos) {
// //     console.log(`Evaluando regla: ${JSON.stringify(regla)}`);
// //     const posiblesBindings = [];

// //     // Encuentra todas las posibles asignaciones de variables que cumplen con las condiciones de la regla
// //     const bindings = generarBindings(regla.cuando, hechos);
// //     for (const binding of bindings) {
// //         // Filtrar resultados inválidos como "hermanos de sí mismos"
// //         if (regla.tipo === "sonHermanos" && binding.X === binding.Y) {
// //             continue;
// //         }

// //         // Verificar que la relación de hermanos no esté ya registrada en la dirección inversa
// //         const yaRegistrado = hechos.some(
// //             (hecho) =>
// //                 hecho.tipo === "sonHermanos" &&
// //                 ((hecho.sujeto === binding.X && hecho.objeto === binding.Y) ||
// //                     (hecho.sujeto === binding.Y && hecho.objeto === binding.X))
// //         );
// //         if (!yaRegistrado) {
// //             posiblesBindings.push(binding);
// //         }
// //     }

// //     console.log(`Posibles bindings: ${JSON.stringify(posiblesBindings)}`);

// //     // Generar los hechos basados en los posibles bindings
// //     const soluciones = posiblesBindings.map((binding) =>
// //         aplicarBinding(regla.entonces, binding)
// //     );

// //     console.log(`Soluciones encontradas: ${JSON.stringify(soluciones)}`);
// //     return soluciones;
// // }

// // function consultar(consulta, hechos, reglas) {
// //     console.log(`Realizando consulta: ${JSON.stringify(consulta)}`);

// //     // Filtrar los hechos que coinciden directamente con la consulta
// //     const resultadosHechos = hechos.filter((hecho) =>
// //         Object.entries(consulta).every(([key, value]) => hecho[key] === value)
// //     );
// //     console.log(`Resultados directos de hechos: ${JSON.stringify(resultadosHechos)}`);

// //     // Generar resultados a partir de las reglas
// //     const resultadosReglas = reglas.flatMap((regla) =>
// //         evaluarRegla(regla, hechos).filter((resultado) =>
// //             Object.entries(consulta).every(([key, value]) => resultado[key] === value || resultado[key] === undefined)
// //         )
// //     );
// //     console.log(`Resultados generados por reglas: ${JSON.stringify(resultadosReglas)}`);

// //     // Concatenar todos los resultados y eliminar duplicados
// //     const todosLosResultados = [
// //         ...resultadosHechos,
// //         ...resultadosReglas,
// //     ];

// //     // Eliminar duplicados (hechos idénticos)
// //     const resultadosUnicos = Array.from(
// //         new Set(todosLosResultados.map((resultado) => JSON.stringify(resultado)))
// //     ).map((resultado) => JSON.parse(resultado));

// //     console.log(`Resultados combinados y únicos: ${JSON.stringify(resultadosUnicos)}`);
// //     return resultadosUnicos;
// // }


// // const texto = document.querySelector('#texto');

// // // console.log("¿Quién es abuelo de Piero?");
// // // console.log(consultar({ tipo: "esAbuelo", objeto: "piero" }, hechos, reglas));

// // // console.log("¿Quiénes son hermanos?");
// // // console.log(consultar({ tipo: "sonHermanos" }, hechos, reglas));

// // console.log("¿Es Juan abuelo de alguien?");
// // console.log(consultar({ tipo: "esAbuelo", sujeto: "juan" }, hechos, reglas));

// // var xdxdxd = 
// // consultar(
// //     { 
// //         tipo: "esAbuelo" ,
// //         sujeto : "juan"
// //     }, 
// //     hechos, 
// //     reglas
// // );

// // xdxdxd.forEach(rpta => {
// //     texto.innerHTML +=  rpta.tipo;
// //     texto.innerHTML +=  `<br>`;
// //     texto.innerHTML +=  rpta.sujeto;
// //     texto.innerHTML +=  `<br>`;
// //     texto.innerHTML +=  rpta.objeto;
// //     texto.innerHTML +=  `<br>`;
// //     texto.innerHTML +=  `<br>`;
// // });


















// // const hechos = [
// //     { tipo: "enPosicion", sujeto: "mario", objeto: { x: 9, y: 0 } },
// //     { tipo: "enPosicion", sujeto: "enemy", objeto: { x: 9, y: 9 } },
// //     { tipo: "enPosicion", sujeto: "goal", objeto: { x: 0, y: 0 } },
// //     { tipo: "enPosicion", sujeto: "muro", objeto: { x: 5, y: 5 } }
// // ];

// // const reglas = [
// //     {
// //         tipo: "moverIzq",
// //         cuando: [
// //             { tipo: "enPosicion", sujeto: "A", objeto: { x: "C", y: "E" } }
// //         ],
// //         entonces: { tipo: "enPosicion", sujeto: "A", objeto: { x: "C-1", y: "E" } }
// //     },
// //     {
// //         tipo: "moverArriba",
// //         cuando: [
// //             { tipo: "enPosicion", sujeto: "A", objeto: { x: "C", y: "E" } }
// //         ],
// //         entonces: { tipo: "enPosicion", sujeto: "A", objeto: { x: "C", y: "E-1" } }
// //     }
// // ];

// // // Resolver variables dentro de una regla
// // function resolverVariable(valor, binding) {
// //     if (typeof valor === "string" && binding[valor] !== undefined) {
// //         return binding[valor];
// //     }
// //     if (typeof valor === "string" && valor.includes("-")) {
// //         const partes = valor.split("-");
// //         return parseInt(resolverVariable(partes[0], binding)) - parseInt(partes[1]);
// //     }
// //     return valor;
// // }

// // // Evaluar una condición con un hecho
// // function evaluarCondicion(condicion, hecho, binding = {}) {
// //     if (condicion.tipo !== hecho.tipo) return false;
// //     const nuevoBinding = { ...binding };

// //     for (const [clave, valor] of Object.entries(condicion)) {
// //         if (clave === "tipo") continue;
// //         const hechoValor = clave === "objeto" ? hecho.objeto : hecho[clave];

// //         if (typeof valor === "object") {
// //             for (const [subClave, subValor] of Object.entries(valor)) {
// //                 const hechoSubValor = hechoValor[subClave];
// //                 const valorResuelto = resolverVariable(subValor, nuevoBinding);
// //                 if (nuevoBinding[subValor] && nuevoBinding[subValor] !== hechoSubValor) return false;
// //                 nuevoBinding[subValor] = hechoSubValor;
// //             }
// //         } else {
// //             const valorResuelto = resolverVariable(valor, nuevoBinding);
// //             if (nuevoBinding[valor] && nuevoBinding[valor] !== hechoValor) return false;
// //             nuevoBinding[valor] = hechoValor;
// //         }
// //     }
// //     return nuevoBinding;
// // }

// // // Evaluar todas las reglas
// // function evaluarReglas() {
// //     let cambios = false;

// //     for (const regla of reglas) {
// //         hechos.forEach((hecho, index) => {
// //             const binding = evaluarCondicion(regla.cuando[0], hecho);
// //             if (binding) {
// //                 const nuevoHecho = { ...regla.entonces, sujeto: hecho.sujeto };
// //                 nuevoHecho.objeto = {
// //                     x: resolverVariable(nuevoHecho.objeto.x, binding),
// //                     y: resolverVariable(nuevoHecho.objeto.y, binding)
// //                 };

// //                 hechos[index] = nuevoHecho; // Actualizamos el hecho existente
// //                 cambios = true;
// //                 console.log(`Regla aplicada: ${JSON.stringify(nuevoHecho)}`);
// //             }
// //         });
// //     }
// //     return cambios;
// // }


// // // Resolver variables dentro de una regla
// // function resolverVariable(valor, binding) {
// //     if (typeof valor === "string" && binding[valor] !== undefined) {
// //         return binding[valor];
// //     }
// //     if (typeof valor === "string" && valor.includes("-")) {
// //         const partes = valor.split("-");
// //         return parseInt(resolverVariable(partes[0], binding)) - parseInt(partes[1]);
// //     }
// //     return valor;
// // }

// // // Evaluar una condición con un hecho
// // function evaluarCondicion(condicion, hecho, binding = {}) {
// //     if (condicion.tipo !== hecho.tipo) return false;
// //     const nuevoBinding = { ...binding };

// //     for (const [clave, valor] of Object.entries(condicion)) {
// //         if (clave === "tipo") continue;
// //         const hechoValor = clave === "objeto" ? hecho.objeto : hecho[clave];

// //         if (typeof valor === "object") {
// //             for (const [subClave, subValor] of Object.entries(valor)) {
// //                 const hechoSubValor = hechoValor[subClave];
// //                 const valorResuelto = resolverVariable(subValor, nuevoBinding);
// //                 if (nuevoBinding[subValor] && nuevoBinding[subValor] !== hechoSubValor) return false;
// //                 nuevoBinding[subValor] = hechoSubValor;
// //             }
// //         } else {
// //             const valorResuelto = resolverVariable(valor, nuevoBinding);
// //             if (nuevoBinding[valor] && nuevoBinding[valor] !== hechoValor) return false;
// //             nuevoBinding[valor] = hechoValor;
// //         }
// //     }
// //     return nuevoBinding;
// // }

// // // Generar bindings para una consulta
// // function generarBindingsConsulta(consulta, hechos, bindingActual = {}) {
// //     const posiblesBindings = [];

// //     for (const hecho of hechos) {
// //         const nuevoBinding = evaluarCondicion(consulta, hecho, bindingActual);
// //         if (nuevoBinding) {
// //             posiblesBindings.push(nuevoBinding);
// //         }
// //     }

// //     return posiblesBindings;
// // }

// // // Consultar hechos o reglas
// // function consultar(consulta, hechos, reglas) {
// //     console.log(`Realizando consulta: ${JSON.stringify(consulta)}`);

// //     // Filtrar los hechos que coinciden directamente con la consulta
// //     const resultadosHechos = hechos.filter((hecho) =>
// //         Object.entries(consulta).every(([key, value]) => {
// //             if (typeof value === "object") {
// //                 return Object.entries(value).every(([subKey, subValue]) => hecho[key][subKey] === subValue);
// //             }
// //             return hecho[key] === value;
// //         })
// //     );

// //     // Generar resultados a partir de las reglas
// //     const resultadosReglas = reglas.flatMap((regla) => {
// //         const bindings = generarBindingsConsulta(regla.cuando[0], hechos);
// //         return bindings.map((binding) => {
// //             const nuevoHecho = { ...regla.entonces, sujeto: binding[consulta.sujeto] || consulta.sujeto };
// //             nuevoHecho.objeto = {
// //                 x: resolverVariable(nuevoHecho.objeto.x, binding),
// //                 y: resolverVariable(nuevoHecho.objeto.y, binding)
// //             };
// //             return nuevoHecho;
// //         });
// //     });

// //     // Concatenar todos los resultados y eliminar duplicados
// //     const todosLosResultados = [...resultadosHechos, ...resultadosReglas];

// //     // Eliminar duplicados (hechos idénticos)
// //     const resultadosUnicos = Array.from(new Set(todosLosResultados.map((resultado) => JSON.stringify(resultado))))
// //         .map((resultado) => JSON.parse(resultado));

// //     console.log(`Resultados únicos: ${JSON.stringify(resultadosUnicos)}`);
// //     return resultadosUnicos;
// // }

// // // Ejemplo de uso
// // console.log("Consultando posición de Mario:");
// // const resultado = consultar(
// //     { tipo: "enPosicion", sujeto: "mario" },
// //     hechos,
// //     reglas
// // );

// // console.log("Resultado:", resultado);



// // const hechos = [
// //     { tipo: "enPosicion", sujeto: "mario", x: 9, y: 0 },
// //     { tipo: "enPosicion", sujeto: "enemy", x: 9, y: 9 },
// //     { tipo: "enPosicion", sujeto: "goal", x: 0, y: 0 },
// //     { tipo: "enPosicion", sujeto: "muro", x: 5, y: 5 },
// //     { tipo: "enPosicion", sujeto: "muro", x: 6, y: 5 }
// // ];

// // const reglas = [
// //     {
// //         tipo: "moverDerecha",
// //         cuando: [
// //             { tipo: "enPosicion", sujeto: "mario", x: "X", y: "Y" },
// //             { tipo: "enPosicion", sujeto: "muro", x: "X+1", y: "Y" }
// //         ],
// //         entonces: { tipo: "moverDerecha", sujeto: "mario" }
// //     },
// //     {
// //         tipo: "moverIzquierda",
// //         cuando: [
// //             { tipo: "enPosicion", sujeto: "mario", x: "X", y: "Y" },
// //             { tipo: "enPosicion", sujeto: "muro", x: "X-1", y: "Y" }
// //         ],
// //         entonces: { tipo: "moverIzquierda", sujeto: "mario" }
// //     },
// //     {
// //         tipo: "moverArriba",
// //         cuando: [
// //             { tipo: "enPosicion", sujeto: "mario", x: "X", y: "Y" },
// //             { tipo: "enPosicion", sujeto: "muro", x: "X", y: "Y-1" }
// //         ],
// //         entonces: { tipo: "moverArriba", sujeto: "mario" }
// //     },
// //     {
// //         tipo: "moverAbajo",
// //         cuando: [
// //             { tipo: "enPosicion", sujeto: "mario", x: "X", y: "Y" },
// //             { tipo: "enPosicion", sujeto: "muro", x: "X", y: "Y+1" }
// //         ],
// //         entonces: { tipo: "moverAbajo", sujeto: "mario" }
// //     }
// // ];


// // function generarBindings(condiciones, hechos, bindingActual = {}) {
// //     if (condiciones.length === 0) {
// //         console.log("Binding encontrado:", bindingActual);
// //         return [bindingActual];
// //     }

// //     const [condicion, ...restoCondiciones] = condiciones;
// //     const posiblesBindings = [];

// //     for (const hecho of hechos) {
// //         if (condicion.tipo === hecho.tipo) {
// //             const nuevoBinding = { ...bindingActual };
// //             let esCompatible = true;

// //             console.log(`Evaluando condición: ${JSON.stringify(condicion)} contra hecho: ${JSON.stringify(hecho)}`);

// //             for (const [variable, valor] of Object.entries(condicion)) {
// //                 if (variable !== "tipo") {
// //                     if (valor === "X" || valor === "Y" || valor === "Z") {
// //                         if (
// //                             nuevoBinding[valor] &&
// //                             nuevoBinding[valor] !== hecho[variable]
// //                         ) {
// //                             esCompatible = false;
// //                             break;
// //                         }
// //                         nuevoBinding[valor] = hecho[variable];
// //                     } else if (valor !== hecho[variable]) {
// //                         esCompatible = false;
// //                         break;
// //                     }
// //                 }
// //             }

// //             if (esCompatible) {
// //                 posiblesBindings.push(
// //                     ...generarBindings(restoCondiciones, hechos, nuevoBinding)
// //                 );
// //             }
// //         }
// //     }

// //     return posiblesBindings;
// // }

// // function aplicarBinding(plantilla, binding) {
// //     const hecho = {};
// //     for (const [key, value] of Object.entries(plantilla)) {
// //         hecho[key] = binding[value] || value;
// //     }
// //     console.log(`Aplicando binding: ${JSON.stringify(binding)} para plantilla: ${JSON.stringify(plantilla)} => Hecho: ${JSON.stringify(hecho)}`);
// //     return hecho;
// // }

// // function evaluarRegla(regla, hechos) {
// //     const posiblesBindings = [];
// //     const bindings = generarBindings(regla.cuando, hechos);
// //     for (const binding of bindings) {
// //         posiblesBindings.push(binding);
// //     }

// //     const soluciones = posiblesBindings.map((binding) =>
// //         aplicarBinding(regla.entonces, binding)
// //     );

// //     return soluciones;
// // }

// // function consultar(consulta, hechos, reglas) {
// //     const resultadosReglas = reglas.flatMap((regla) =>
// //         evaluarRegla(regla, hechos).filter((resultado) =>
// //             Object.entries(consulta).every(([key, value]) => resultado[key] === value || resultado[key] === undefined)
// //         )
// //     );

// //     return resultadosReglas;
// // }


// // console.log("¿Hacia dónde debe moverse Mario?");
// // const resultado = consultar(
// //     { tipo: "moverIzquierda", sujeto: "mario" },
// //     hechos,
// //     reglas
// // );
// // console.log(resultado);


// // // Hechos iniciales
// // const hechos = [
// //     { tipo: "enemigo", posicion: [1, 2], objetivo: "mario" }, 
// //     { tipo: "mario", posicion: [5, 5] },
// //     // Agrega más hechos según sea necesario
// // ];

// // // Reglas
// // const reglas = [
// //     {
// //         condiciones: [
// //             { tipo: "enemigo", posicion: "X", objetivo: "mario" }, 
// //             { tipo: "mario", posicion: "Y" }
// //         ],
// //         conclusion: { tipo: "enemigo", movimiento: "Hacia X" }
// //     },
// //     // Agrega más reglas según sea necesario
// // ];

// // // Función para generar bindings
// // function generarBindings(condiciones, hechos, bindingActual = {}) {
// //     if (condiciones.length === 0) {
// //         console.log("Binding encontrado:", bindingActual);
// //         return [bindingActual];
// //     }

// //     const [condicion, ...restoCondiciones] = condiciones;
// //     const posiblesBindings = [];

// //     for (const hecho of hechos) {
// //         if (condicion.tipo === hecho.tipo) {
// //             const nuevoBinding = { ...bindingActual };
// //             let esCompatible = true;

// //             console.log(`Evaluando condición: ${JSON.stringify(condicion)} contra hecho: ${JSON.stringify(hecho)}`);

// //             // Compara las variables de la condición con los hechos
// //             for (const [variable, valor] of Object.entries(condicion)) {
// //                 if (variable !== "tipo") {
// //                     if (valor === "X" || valor === "Y" || valor === "Z") {
// //                         if (
// //                             nuevoBinding[valor] &&
// //                             nuevoBinding[valor] !== hecho[variable]
// //                         ) {
// //                             esCompatible = false;
// //                             break;
// //                         }
// //                         nuevoBinding[valor] = hecho[variable];
// //                     } else if (valor !== hecho[variable]) {
// //                         esCompatible = false;
// //                         break;
// //                     }
// //                 }
// //             }

// //             // Si la condición es compatible, busca más bindings
// //             if (esCompatible) {
// //                 posiblesBindings.push(
// //                     ...generarBindings(restoCondiciones, hechos, nuevoBinding)
// //                 );
// //             }
// //         }
// //     }

// //     return posiblesBindings;
// // }

// // // Función para aplicar los bindings a las conclusiones
// // function aplicarBinding(plantilla, binding) {
// //     const hecho = {};
// //     for (const [key, value] of Object.entries(plantilla)) {
// //         hecho[key] = binding[value] || value;
// //     }
// //     console.log(`Aplicando binding: ${JSON.stringify(binding)} para plantilla: ${JSON.stringify(plantilla)} => Hecho: ${JSON.stringify(hecho)}`);
// //     return hecho;
// // }

// // // Función principal para ejecutar las reglas
// // function ejecutarReglas(reglas, hechos) {
// //     let hechosGenerados = [...hechos];
// //     let reglasAplicadas = [];

// //     // Mientras haya reglas que aplicar
// //     let reglasPendientes = [...reglas];
// //     while (reglasPendientes.length > 0) {
// //         const regla = reglasPendientes.shift();

// //         // Generar bindings para las condiciones de la regla
// //         const bindings = generarBindings(regla.condiciones, hechosGenerados);

// //         // Si se generan bindings, aplicar la conclusión
// //         for (const binding of bindings) {
// //             const hechoGenerado = aplicarBinding(regla.conclusion, binding);
// //             hechosGenerados.push(hechoGenerado);
// //             reglasAplicadas.push(hechoGenerado);
// //         }
// //     }

// //     return { hechosGenerados, reglasAplicadas };
// // }

// // // Ejecutar las reglas sobre los hechos
// // const resultado = ejecutarReglas(reglas, hechos);
// // console.log("Hechos generados:", JSON.stringify(resultado.hechosGenerados));
// // console.log("Reglas aplicadas:", JSON.stringify(resultado.reglasAplicadas));












// // let hechos = [
// //     { tipo: "enemigo", posicion: [3, 3] },
// //     { tipo: "mario", posicion: [1, 1] }, 
// // ];

// // const reglas = [
// //     {
// //         condiciones: [
// //             { tipo: "enemigo", posicion: "X" },
// //             { tipo: "mario", posicion: "Y" },
// //         ],
// //         conclusion: { movimiento: "derecha" },
// //         evaluar: (hechos) => {
// //             const enemigo = hechos.find(hecho => hecho.tipo === "enemigo");
// //             const mario = hechos.find(hecho => hecho.tipo === "mario");
// //             if (enemigo.posicion[0] < mario.posicion[0]) {
// //                 return true;
// //             }
// //             return false;
// //         }
// //     },
// //     {
// //         condiciones: [
// //             { tipo: "enemigo", posicion: "X" },
// //             { tipo: "mario", posicion: "Y" },
// //         ],
// //         conclusion: { movimiento: "izquierda" },
// //         evaluar: (hechos) => {
// //             const enemigo = hechos.find(hecho => hecho.tipo === "enemigo");
// //             const mario = hechos.find(hecho => hecho.tipo === "mario");
// //             if (enemigo.posicion[0] > mario.posicion[0]) {
// //                 return true;
// //             }
// //             return false;
// //         }
// //     },
// //     {
// //         condiciones: [
// //             { tipo: "enemigo", posicion: "X" },
// //             { tipo: "mario", posicion: "Y" },
// //         ],
// //         conclusion: { movimiento: "abajo" },
// //         evaluar: (hechos) => {
// //             const enemigo = hechos.find(hecho => hecho.tipo === "enemigo");
// //             const mario = hechos.find(hecho => hecho.tipo === "mario");
// //             if (enemigo.posicion[1] < mario.posicion[1]) {
// //                 return true;
// //             }
// //             return false;
// //         }
// //     },
// //     {
// //         condiciones: [
// //             { tipo: "enemigo", posicion: "X" },
// //             { tipo: "mario", posicion: "Y" },
// //         ],
// //         conclusion: { movimiento: "arriba" },
// //         evaluar: (hechos) => {
// //             const enemigo = hechos.find(hecho => hecho.tipo === "enemigo");
// //             const mario = hechos.find(hecho => hecho.tipo === "mario");
// //             if (enemigo.posicion[1] > mario.posicion[1]) {
// //                 return true;
// //             }
// //             return false;
// //         }
// //     },
// // ];

// // function evaluarReglas(hechos) {
// //     for (const regla of reglas) {
// //         if (regla.evaluar(hechos)) {
// //             return regla.conclusion.movimiento;
// //         }
// //     }
// //     return null;
// // }

// // function moverEnemigo(hechos) {
// //     const movimiento = evaluarReglas(hechos);

// //     if (movimiento) {
// //         const enemigo = hechos.find(hecho => hecho.tipo === "enemigo");
// //         switch (movimiento) {
// //             case "izquierda":
// //                 enemigo.posicion[0] -= 1;
// //                 break;
// //             case "derecha":
// //                 enemigo.posicion[0] += 1;
// //                 break;
// //             case "arriba":
// //                 enemigo.posicion[1] -= 1;
// //                 break;
// //             case "abajo":
// //                 enemigo.posicion[1] += 1;
// //                 break;
// //         }
// //     }
// // }

// // function simularMovimiento() {
// //     hechos[1].posicion = [1, 2]; 

// //     console.log("Posición de Mario después de su movimiento:", hechos[1].posicion);

// //     moverEnemigo(hechos);

// //     console.log("Posición del enemigo después de su movimiento:", hechos[0].posicion);
// // }

// // simularMovimiento();








// // const hechos = [
// //     { tipo: "esHombre", sujeto: "juan" },
// //     { tipo: "esHombre", sujeto: "luis" },
// //     { tipo: "esHombre", sujeto: "pedro" },
// //     { tipo: "esHombre", sujeto: "piero" },
// //     { tipo: "esHombre", sujeto: "joel" },
// //     { tipo: "esMujer", sujeto: "ana" },
// //     { tipo: "esMujer", sujeto: "maria" },
// //     { tipo: "esMujer", sujeto: "karla" },
// //     { tipo: "esPadre", sujeto: "juan", objeto: "luis" },
// //     { tipo: "esPadre", sujeto: "juan", objeto: "joel" },
// //     { tipo: "esPadre", sujeto: "luis", objeto: "piero" },
// //     { tipo: "esPadre", sujeto: "pedro", objeto: "karla" },
// //     { tipo: "esMadre", sujeto: "karla", objeto: "martin" },
// //     { tipo: "esPadre", sujeto: "juan", objeto: "maria" },
// //     { tipo: "esMadre", sujeto: "ana", objeto: "maria" },
// //     { tipo: "esMadre", sujeto: "maria", objeto: "karla" }
// // ];

// // const reglas = [
// //     {
// //         tipo: "esAbuelo",
// //         cuando: [
// //             { tipo: "esPadre", sujeto: "X", objeto: "Z" },
// //             { tipo: "esPadre", sujeto: "Z", objeto: "Y" }
// //         ],
// //         entonces: { tipo: "esAbuelo", sujeto: "X", objeto: "Y" }
// //     },
// //     {
// //         tipo: "esAbuelo",
// //         cuando: [
// //             { tipo: "esPadre", sujeto: "X", objeto: "Z" },
// //             { tipo: "esMadre", sujeto: "Z", objeto: "Y" }
// //         ],
// //         entonces: { tipo: "esAbuelo", sujeto: "X", objeto: "Y" }
// //     },
// //     {
// //         tipo: "esAbuela",
// //         cuando: [
// //             { tipo: "esMadre", sujeto: "X", objeto: "Z" },
// //             { tipo: "esMadre", sujeto: "Z", objeto: "Y" }
// //         ],
// //         entonces: { tipo: "esAbuela", sujeto: "X", objeto: "Y" }
// //     },
// //     {
// //         tipo: "esAbuela",
// //         cuando: [
// //             { tipo: "esMadre", sujeto: "X", objeto: "Z" },
// //             { tipo: "esPadre", sujeto: "Z", objeto: "Y" }
// //         ],
// //         entonces: { tipo: "esAbuela", sujeto: "X", objeto: "Y" }
// //     },
// //     {
// //         tipo: "sonHermanos",
// //         cuando: [
// //             { tipo: "esPadre", sujeto: "Z", objeto: "X" },
// //             { tipo: "esPadre", sujeto: "Z", objeto: "Y" }
// //         ],
// //         entonces: { tipo: "sonHermanos", sujeto: "X", objeto: "Y" }
// //     }
// // ];



// // const hechos = [
// //     { tipo: "esHombre", sujeto: "juan" },
// //     { tipo: "esHombre", sujeto: "luis" },
// //     { tipo: "esHombre", sujeto: "pedro" },
// //     { tipo: "esHombre", sujeto: "piero" },
// //     { tipo: "esHombre", sujeto: "joel" },
// //     { tipo: "esMujer", sujeto: "ana" },
// //     { tipo: "esMujer", sujeto: "maria" },
// //     { tipo: "esMujer", sujeto: "karla" },
// //     { tipo: "esPadre", sujeto: "juan", objeto: "luis" },
// //     { tipo: "esPadre", sujeto: "juan", objeto: "joel" },
// //     { tipo: "esPadre", sujeto: "luis", objeto: "piero" },
// //     { tipo: "esPadre", sujeto: "pedro", objeto: "karla" },
// //     { tipo: "esMadre", sujeto: "karla", objeto: "martin" },
// //     { tipo: "esPadre", sujeto: "juan", objeto: "maria" },
// //     { tipo: "esMadre", sujeto: "ana", objeto: "maria" },
// //     { tipo: "esMadre", sujeto: "maria", objeto: "karla" },
// //     { tipo: "enPosicion", sujeto: "mario", objeto: {x:2 , y:8} },
// //     { tipo: "enPosicion", sujeto: "enemy", objeto: {x:2 , y:0} },
// // ];



// const hechos = [
//     { tipo: "enPosicion", sujeto: "mario", objeto: {x:2 , y:8} },
//     { tipo: "enPosicion", sujeto: "enemy", objeto: {x:2 , y:0} },
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
//         tipo: "esAbuelo",
//         cuando: [
//             { tipo: "esPadre", sujeto: "X", objeto: "Z" },
//             { tipo: "esPadre", sujeto: "Z", objeto: "Y" }
//         ],
//         entonces: { tipo: "esAbuelo", sujeto: "X", objeto: "Y" }
//     },
//     {
//         tipo: "esAbuelo",
//         cuando: [
//             { tipo: "esPadre", sujeto: "X", objeto: "Z" },
//             { tipo: "esMadre", sujeto: "Z", objeto: "Y" }
//         ],
//         entonces: { tipo: "esAbuelo", sujeto: "X", objeto: "Y" }
//     },
//     {
//         tipo: "esAbuela",
//         cuando: [
//             { tipo: "esMadre", sujeto: "X", objeto: "Z" },
//             { tipo: "esMadre", sujeto: "Z", objeto: "Y" }
//         ],
//         entonces: { tipo: "esAbuela", sujeto: "X", objeto: "Y" }
//     },
//     {
//         tipo: "esAbuela",
//         cuando: [
//             { tipo: "esMadre", sujeto: "X", objeto: "Z" },
//             { tipo: "esPadre", sujeto: "Z", objeto: "Y" }
//         ],
//         entonces: { tipo: "esAbuela", sujeto: "X", objeto: "Y" }
//     },
//     {
//         tipo: "sonHermanos",
//         cuando: [
//             { tipo: "esPadre", sujeto: "Z", objeto: "X" },
//             { tipo: "esPadre", sujeto: "Z", objeto: "Y" }
//         ],
//         entonces: { tipo: "sonHermanos", sujeto: "X", objeto: "Y" }
//     }
// ];


// // Función para comparar dos objetos de manera profunda
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
//                     // Si el valor es un objeto, hacemos una comparación profunda
//                     if (typeof valor === 'object' && valor !== null) {
//                         const hechoObjeto = hecho[variable];
//                         if (!compararObjetos(valor, hechoObjeto)) {
//                             esCompatible = false;
//                             break;
//                         } else {
//                             // Si la comparación profunda es exitosa, actualizamos el binding
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

//     // Encuentra todas las posibles asignaciones de variables que cumplen con las condiciones de la regla
//     const bindings = generarBindings(regla.cuando, hechos);
//     for (const binding of bindings) {
//         // Filtrar resultados inválidos como "hermanos de sí mismos"
//         if (regla.tipo === "sonHermanos" && binding.X === binding.Y) {
//             continue;
//         }

//         // Verificar que la relación de hermanos no esté ya registrada en la dirección inversa
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

//     // Generar los hechos basados en los posibles bindings
//     const soluciones = posiblesBindings.map((binding) =>
//         aplicarBinding(regla.entonces, binding)
//     );

//     console.log(`Soluciones encontradas: ${JSON.stringify(soluciones)}`);
//     return soluciones;
// }

// function consultar(consulta, hechos, reglas) {
//     console.log(`Realizando consulta: ${JSON.stringify(consulta)}`);

//     // Filtrar los hechos que coinciden directamente con la consulta
//     const resultadosHechos = hechos.filter((hecho) =>
//         Object.entries(consulta).every(([key, value]) => {
//             if (typeof value === 'object' && value !== null) {
//                 return compararObjetos(hecho[key], value);  // Comparación profunda
//             }
//             return hecho[key] === value;
//         })
//     );
//     console.log(`Resultados directos de hechos: ${JSON.stringify(resultadosHechos)}`);

//     // Generar resultados a partir de las reglas
//     const resultadosReglas = reglas.flatMap((regla) =>
//         evaluarRegla(regla, hechos).filter((resultado) =>
//             Object.entries(consulta).every(([key, value]) => resultado[key] === value || resultado[key] === undefined)
//         )
//     );
//     console.log(`Resultados generados por reglas: ${JSON.stringify(resultadosReglas)}`);

//     // Concatenar todos los resultados y eliminar duplicados
//     const todosLosResultados = [
//         ...resultadosHechos,
//         ...resultadosReglas,
//     ];

//     // Eliminar duplicados (hechos idénticos)
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
// //         sujeto: "enemy"
// //     }, 
// //     hechos, 
// //     reglas
// // );

// consultar(
//     { 
//         tipo: "enPosicion",
//         objeto: { x: 2, y: 0}
//     }, 
//     hechos, 
//     reglas
// );


// // consultar(
// // { 
// //     tipo: "esAbuelo", 
// //     sujeto: "juan" 
// // }, 
// // hechos, 
// // reglas
// // );

// // consultar(
// //     { 
// //         tipo: "esAbuelo" ,
// //         objeto : "martin"
// //     }, 
// //     hechos, 
// //     reglas
// // );

// // consultar(
// //     { 
// //         tipo: "esAbuela" ,
// //         sujeto : "ana"
// //     }, 
// //     hechos, 
// //     reglas
// // );


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













// // const hechos = [
// //     { tipo: "enPosicion", sujeto: "mario", objeto: { x: 9, y: 0 } },
// //     { tipo: "enPosicion", sujeto: "enemy", objeto: { x: 9, y: 9 } },
// // ];


// // const reglas = [
// //     {
// //         tipo: "moverIzq",
// //         cuando: [
// //             { tipo: "enPosicion", sujeto: "Z", objeto: "X" },
// //             { tipo: "enPosicion", sujeto: "Z", objeto: "Y" }
// //         ],
// //         entonces: { tipo: "moverIzq", sujeto: "X", objeto: "Y" }
// //     },
// //     {
// //         tipo: "moverDer",
// //         cuando: [
// //             { tipo: "enPosicion", sujeto: "Z", objeto: "X" },
// //             { tipo: "enPosicion", sujeto: "Z", objeto: "Y" }
// //         ],
// //         entonces: { tipo: "moverDer", sujeto: "Y", objeto: "X" }
// //     }
// // ];




// // function generarBindings(condiciones, hechos, bindingActual = {}) {
// //     if (condiciones.length === 0) {
// //         return [bindingActual];
// //     }

// //     const [condicion, ...restoCondiciones] = condiciones;
// //     const posiblesBindings = [];

// //     for (const hecho of hechos) {
// //         if (condicion.tipo === hecho.tipo) {
// //             const nuevoBinding = { ...bindingActual };
// //             let esCompatible = true;

// //             for (const [variable, valor] of Object.entries(condicion)) {
// //                 if (variable !== "tipo") {
// //                     if (valor === "X" || valor === "Y" || valor === "Z") {
// //                         if (
// //                             nuevoBinding[valor] &&
// //                             nuevoBinding[valor] !== hecho[variable]
// //                         ) {
// //                             esCompatible = false;
// //                             break;
// //                         }
// //                         nuevoBinding[valor] = hecho[variable];
// //                     } else if (valor !== hecho[variable]) {
// //                         esCompatible = false;
// //                         break;
// //                     }
// //                 }
// //             }

// //             if (esCompatible) {
// //                 posiblesBindings.push(
// //                     ...generarBindings(restoCondiciones, hechos, nuevoBinding)
// //                 );
// //             }
// //         }
// //     }

// //     return posiblesBindings;
// // }

// // function aplicarBinding(plantilla, binding) {
// //     const hecho = {};
// //     for (const [key, value] of Object.entries(plantilla)) {
// //         hecho[key] = binding[value] || value;
// //     }
// //     return hecho;
// // }

// // function evaluarRegla(regla, hechos) {
// //     console.log(`Evaluando regla: ${JSON.stringify(regla)}`);
// //     const posiblesBindings = [];

// //     // Encuentra todas las posibles asignaciones de variables que cumplen con las condiciones de la regla
// //     const bindings = generarBindings(regla.cuando, hechos);
// //     for (const binding of bindings) {
// //         // Filtrar resultados inválidos como "hermanos de sí mismos"
// //         if (regla.tipo === "sonHermanos" && binding.X === binding.Y) {
// //             continue;
// //         }

// //         // Verificar que la relación de hermanos no esté ya registrada en la dirección inversa
// //         const yaRegistrado = hechos.some(
// //             (hecho) =>
// //                 hecho.tipo === "sonHermanos" &&
// //                 ((hecho.sujeto === binding.X && hecho.objeto === binding.Y) ||
// //                     (hecho.sujeto === binding.Y && hecho.objeto === binding.X))
// //         );
// //         if (!yaRegistrado) {
// //             posiblesBindings.push(binding);
// //         }
// //     }

// //     console.log(`Posibles bindings: ${JSON.stringify(posiblesBindings)}`);

// //     // Generar los hechos basados en los posibles bindings
// //     const soluciones = posiblesBindings.map((binding) =>
// //         aplicarBinding(regla.entonces, binding)
// //     );

// //     console.log(`Soluciones encontradas: ${JSON.stringify(soluciones)}`);
// //     return soluciones;
// // }

// // function consultar(consulta, hechos, reglas) {
// //     console.log(`Realizando consulta: ${JSON.stringify(consulta)}`);

// //     // Filtrar los hechos que coinciden directamente con la consulta
// //     const resultadosHechos = hechos.filter((hecho) =>
// //         Object.entries(consulta).every(([key, value]) => hecho[key] === value)
// //     );
// //     console.log(`Resultados directos de hechos: ${JSON.stringify(resultadosHechos)}`);

// //     // Generar resultados a partir de las reglas
// //     const resultadosReglas = reglas.flatMap((regla) =>
// //         evaluarRegla(regla, hechos).filter((resultado) =>
// //             Object.entries(consulta).every(([key, value]) => resultado[key] === value || resultado[key] === undefined)
// //         )
// //     );
// //     console.log(`Resultados generados por reglas: ${JSON.stringify(resultadosReglas)}`);

// //     // Concatenar todos los resultados y eliminar duplicados
// //     const todosLosResultados = [
// //         ...resultadosHechos,
// //         ...resultadosReglas,
// //     ];

// //     // Eliminar duplicados (hechos idénticos)
// //     const resultadosUnicos = Array.from(
// //         new Set(todosLosResultados.map((resultado) => JSON.stringify(resultado)))
// //     ).map((resultado) => JSON.parse(resultado));

// //     console.log(`Resultados combinados y únicos: ${JSON.stringify(resultadosUnicos)}`);
// //     return resultadosUnicos;
// // }


// // const texto = document.querySelector('#texto');

// // // console.log("¿Quién es abuelo de Piero?");
// // // console.log(consultar({ tipo: "esAbuelo", objeto: "piero" }, hechos, reglas));

// // // console.log("¿Quiénes son hermanos?");
// // // console.log(consultar({ tipo: "sonHermanos" }, hechos, reglas));

// // // console.log("¿Es Juan abuelo de alguien?");
// // // console.log(consultar({ tipo: "esAbuelo", sujeto: "juan" }, hechos, reglas));

// // var xdxdxd = 
// // consultar(
// //     { 
// //         tipo : "moverIzq" ,
// //         sujeto : "mario"
// //     }, 
// //     hechos, 
// //     reglas
// // );

// // xdxdxd.forEach(rpta => {
// //     texto.innerHTML +=  rpta.tipo;
// //     texto.innerHTML +=  `<br>`;
// //     texto.innerHTML +=  rpta.sujeto;
// //     texto.innerHTML +=  `<br>`;
// //     texto.innerHTML +=  rpta.objeto;
// //     texto.innerHTML +=  `<br>`;
// //     texto.innerHTML +=  JSON.stringify(rpta.objeto);
// //     texto.innerHTML +=  `<br>`;
// //     texto.innerHTML +=  rpta.objeto.x+","+rpta.objeto.y;
// //     texto.innerHTML +=  `<br>`;
// //     texto.innerHTML +=  `<br>`;
// // });
