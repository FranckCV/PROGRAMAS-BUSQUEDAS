
const hechos = [
    { tipo: "esHombre", sujeto: "juan" },
    { tipo: "esHombre", sujeto: "luis" },
    { tipo: "esHombre", sujeto: "pedro" },
    { tipo: "esHombre", sujeto: "piero" },
    { tipo: "esHombre", sujeto: "joel" },
    { tipo: "esMujer", sujeto: "ana" },
    { tipo: "esMujer", sujeto: "maria" },
    { tipo: "esMujer", sujeto: "karla" },
    { tipo: "esPadre", sujeto: "juan", objeto: "luis" },
    { tipo: "esPadre", sujeto: "juan", objeto: "joel" },    
    { tipo: "esPadre", sujeto: "joel", objeto: "ari" },
    { tipo: "esPadre", sujeto: "juan", objeto: "pepe" },
    { tipo: "esPadre", sujeto: "juan", objeto: "maria" },
    { tipo: "esPadre", sujeto: "luis", objeto: "piero" },
    { tipo: "esPadre", sujeto: "pedro", objeto: "karla" },
    { tipo: "esPadre", sujeto: "karla", objeto: "martin" },
    { tipo: "esPadre", sujeto: "ana", objeto: "maria" },
    { tipo: "esPadre", sujeto: "maria", objeto: "karla" }
];

const reglas = [
    {
        tipo: "esAbuelo",
        cuando: [
            { tipo: "esPadre", sujeto: "X", objeto: "Z" },
            { tipo: "esPadre", sujeto: "Z", objeto: "Y" }
        ],
        entonces: { tipo: "esAbuelo", sujeto: "X", objeto: "Y" }
    },
    {
        tipo: "sonHermanos",
        cuando: [
            { tipo: "esPadre", sujeto: "Z", objeto: "X" },
            { tipo: "esPadre", sujeto: "Z", objeto: "Y" }
        ],
        entonces: { tipo: "sonHermanos", sujeto: "X", objeto: "Y" }
    },
    {
        tipo: "esTio",
        cuando: [
            { tipo: "sonHermanos", sujeto: "X", objeto: "Z" },
            { tipo: "esPadre", sujeto: "Z", objeto: "Y" }
        ],
        entonces: { tipo: "sonHermanos", sujeto: "X", objeto: "Y" }
    }
];




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
                    if (valor === "X" || valor === "Y" || valor === "Z") {
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

    // Encuentra todas las posibles asignaciones de variables que cumplen con las condiciones de la regla
    const bindings = generarBindings(regla.cuando, hechos);
    for (const binding of bindings) {
        // Filtrar resultados inválidos como "hermanos de sí mismos"
        if (regla.tipo === "sonHermanos" && binding.X === binding.Y) {
            continue;
        }

        // Verificar que la relación de hermanos no esté ya registrada en la dirección inversa
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

    // Generar los hechos basados en los posibles bindings
    const soluciones = posiblesBindings.map((binding) =>
        aplicarBinding(regla.entonces, binding)
    );

    console.log(`Soluciones encontradas: ${JSON.stringify(soluciones)}`);
    return soluciones;
}

function consultar(consulta, hechos, reglas) {
    console.log(`Realizando consulta: ${JSON.stringify(consulta)}`);

    // Filtrar los hechos que coinciden directamente con la consulta
    const resultadosHechos = hechos.filter((hecho) =>
        Object.entries(consulta).every(([key, value]) => hecho[key] === value)
    );
    console.log(`Resultados directos de hechos: ${JSON.stringify(resultadosHechos)}`);

    // Generar resultados a partir de las reglas
    const resultadosReglas = reglas.flatMap((regla) =>
        evaluarRegla(regla, hechos).filter((resultado) =>
            Object.entries(consulta).every(([key, value]) => resultado[key] === value || resultado[key] === undefined)
        )
    );
    console.log(`Resultados generados por reglas: ${JSON.stringify(resultadosReglas)}`);

    // Concatenar todos los resultados y eliminar duplicados
    const todosLosResultados = [
        ...resultadosHechos,
        ...resultadosReglas,
    ];

    // Eliminar duplicados (hechos idénticos)
    const resultadosUnicos = Array.from(
        new Set(todosLosResultados.map((resultado) => JSON.stringify(resultado)))
    ).map((resultado) => JSON.parse(resultado));

    console.log(`Resultados combinados y únicos: ${JSON.stringify(resultadosUnicos)}`);
    return resultadosUnicos;
}





const texto = document.querySelector('#texto');

var xdxdxd = 
// consultar({ tipo: "esAbuelo", sujeto: "juan" }, hechos, reglas)
consultar(
    { 
        tipo: "esTio" ,
        sujeto: "joel"
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
    texto.innerHTML +=  `<br>`;
});
