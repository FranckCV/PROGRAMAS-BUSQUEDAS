import numpy as np
import random
import time

# ENTORNO
env = np.array([
    [ 0,  0,  0,  0],
    [ 0,  0,  0, -1],
    [ 0, -1,  0, -1],
    [-1,  0,  0,  1]
])

n_rows, n_cols = env.shape

# PARAMETROs
alpha = 0.1  # Tasa de aprendizaje
gamma = 0.9  # Factor de descuento
epsilon = 0.8  # Probabilidad de exploración

actions = [0, 1, 2, 3]  # 0: Arriba, 1: Abajo, 2: Izquierda, 3: Derecha

# Inicializar Q-Table con ceros
Q = np.zeros((n_rows * n_cols, len(actions)))

# ESTADOS
def state_to_index(row, col):
    return row * n_cols + col

# TOMA DE ACCIONES
def choose_action(state):
    if np.random.uniform(0, 1) < epsilon:
        return np.random.choice(actions)
    else:
        return np.argmax(Q[state])

# MOVIMIENTO
def move_agent(state, action):
    row = state // n_cols
    col = state % n_cols

    if action == 0 and row > 0:  # Arriba
        row -= 1
    elif action == 1 and row < n_rows - 1:  # Abajo
        row += 1
    elif action == 2 and col > 0:  # Izquierda
        col -= 1
    elif action == 3 and col < n_cols - 1:  # Derecha
        col += 1

    return state_to_index(row, col)

# RECOMPENSA
def get_reward(state):
    row = state // n_cols
    col = state % n_cols
    return env[row, col]

# ENTRENAMIENTO
def train_agent(episodes):
    for episode in range(episodes):
        print(f"Episodio {episode + 1}: El agente comienza a explorar el entorno.")

        state = random.choice([i for i in range(n_rows * n_cols) if env[i // n_cols, i % n_cols] != 1])
        steps = 0
        
        while True:
            steps += 1
            action = choose_action(state)
            new_state = move_agent(state, action)
            reward = get_reward(new_state)
            
            Q[state, action] = Q[state, action] + alpha * (reward + gamma * np.max(Q[new_state]) - Q[state, action])
          
            print_env(state, new_state, action, steps)
            
            state = new_state
            
            if env[state // n_cols, state % n_cols] == 1 or env[state // n_cols, state % n_cols] == -1:
                print(f"Episodio {episode + 1} completado: El agente llegó a la meta o encontró un obstáculo.")
                time.sleep(1)
                break

# VER ENTORNO
def print_env(state, new_state, action, steps):
    row_agent = state // n_cols
    col_agent = state % n_cols
    row_new = new_state // n_cols
    col_new = new_state % n_cols

    env_visual = np.copy(env)
    env_visual[row_agent, col_agent] = 8  # Posición actual del agente
    env_visual[row_new, col_new] = 9  # Nueva posición del agente

    print(f"Paso {steps}: El agente se mueve hacia la {'↑' if action == 0 else '↓' if action == 1 else '←' if action == 2 else '→'}")
    print(env_visual)
    time.sleep(0.5)

# POLITCA APRENDIDA 
def show_policy():
    policy = []
    for i in range(n_rows):
        row = []
        for j in range(n_cols):
            if env[i, j] == -1:
                row.append(' X ')  # Obstáculo
            elif env[i, j] == 1:
                row.append(' G ')  # Meta
            else:
                state = state_to_index(i, j)
                best_action = np.argmax(Q[state])
                if best_action == 0:
                    row.append(' ↑ ')
                elif best_action == 1:
                    row.append(' ↓ ')
                elif best_action == 2:
                    row.append(' ← ')
                elif best_action == 3:
                    row.append(' → ')
        policy.append(row)
    return policy

# 10 EPISODIOS DE ENTRENAMIENTO
train_agent(10)

# MOSTRAR POLITICA
print("\nPolítica final aprendida por el agente:")
for row in show_policy():
    print(row)
