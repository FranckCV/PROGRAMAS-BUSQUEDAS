document.addEventListener('DOMContentLoaded', () => {
    const jugador = document.getElementById('jugador');
    const contenedor = document.querySelector('#escenario');
    const moveAmount = 1; // Cantidad de píxeles que se moverá el jugador en cada paso
    const jumpHeight = 50; // Altura del salto
    const jumpDuration = 300; // Duración del salto en milisegundos
    let isJumping = false;

    // Función para mover el jugador
    function moverJugador(x, y) {
        const nuevaPosX = jugador.offsetLeft + x;
        const nuevaPosY = jugador.offsetTop + y;

        // Asegurarse de que el jugador no salga del contenedor
        if (nuevaPosX >= 0 && nuevaPosX + jugador.offsetWidth <= contenedor.offsetWidth) {
            jugador.style.left = nuevaPosX + 'px';
        }
        if (nuevaPosY >= 0 && nuevaPosY + jugador.offsetHeight <= contenedor.offsetHeight) {
            jugador.style.top = nuevaPosY + 'px';
        }
    }

    function saltarJugador() {
        if (isJumping) return; // Si ya está en el aire, no puede saltar de nuevo

        isJumping = true; // Marcar como en el aire
        const posicionInicialY = jugador.offsetTop;

        // Subir el jugador (simulando el ascenso del salto)
        jugador.style.transition = `top ${jumpDuration / 2}ms ease-out`;
        jugador.style.top = (posicionInicialY - jumpHeight) + 'px';

        // Después del ascenso, bajar el jugador (simulando la caída)
        setTimeout(() => {
            jugador.style.transition = `top ${jumpDuration / 2}ms ease-in`;
            jugador.style.top = posicionInicialY + 'px';

            // Marcar que el salto ha terminado
            setTimeout(() => {
                isJumping = false;
            }, jumpDuration / 2); // Restablecer el estado de salto tras el aterrizaje
        }, jumpDuration / 2); // Esperar hasta que termine el ascenso
    }

    // Eventos de teclas (W, A, S, D y flechas)
    document.addEventListener('keydown', (event) => {
        switch (event.key.toLowerCase()) {
            // case 'w': 
            // case 'arrowup':
            //     moverJugador(0, -moveAmount);
            //     break;
            case 'a':
            case 'arrowleft': 
                moverJugador(-moveAmount, 0);
                break;
            // case 's': 
            // case 'arrowdown': 
            //     moverJugador(0, moveAmount);
            //     break;
            case 'd': 
            case 'arrowright':
                moverJugador(moveAmount, 0);
                break;
            case ' ':                
                // setTimeout (moverJugador(0, 5),10);
                saltarJugador();
                break;
        }
    });
});
