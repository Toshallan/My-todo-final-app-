// --- Initialisation des données ---
let currentUser = localStorage.getItem('casaTech_session');
let allUsersData = JSON.parse(localStorage.getItem('casaTech_db')) || {};

// --- Éléments du DOM ---
const loginPage = document.getElementById('loginPage');
const todoPage = document.getElementById('todoPage');
const loginForm = document.getElementById('loginForm');
const todoForm = document.getElementById('todoForm');
const taskList = document.getElementById('taskList');
const userGreeting = document.getElementById('userGreeting');
const darkModeToggle = document.getElementById('darkModeToggle');

// --- Lancement de l'application ---
function start() {
    initTheme(); // Charge le thème sauvegardé
    if (currentUser) {
        showTodoPage();
    } else {
        showLoginPage();
    }
}

// --- Gestion du Thème (Mode Sombre) ---
function initTheme() {
    const isDark = localStorage.getItem('casaTech_theme') === 'dark';
    if (isDark) {
        document.body.setAttribute('data-theme', 'dark');
        darkModeToggle.textContent = '☀️ Mode Clair';
    }
}

darkModeToggle.onclick = () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('casaTech_theme', 'light');
        darkModeToggle.textContent = '🌙 Mode Sombre';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('casaTech_theme', 'dark');
        darkModeToggle.textContent = '☀️ Mode Clair';
    }
};

// --- Gestion de la Session ---
loginForm.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('usernameInput').value.trim();
    if (!name) return;

    currentUser = name;
    localStorage.setItem('casaTech_session', name);

    if (!allUsersData[currentUser]) {
        allUsersData[currentUser] = [];
        saveDB();
    }

    showTodoPage();
};

document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('casaTech_session');
    currentUser = null;
    showLoginPage();
};

function showLoginPage() {
    loginPage.classList.remove('hidden');
    todoPage.classList.add('hidden');
}

function showTodoPage() {
    loginPage.classList.add('hidden');
    todoPage.classList.remove('hidden');
    userGreeting.textContent = `Bonjour, ${currentUser}`;
    renderTasks();
}

// --- Gestion des Tâches ---
todoForm.onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    
    if (text) {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // L'heure est bien là !
        };

        allUsersData[currentUser].push(newTask);
        saveDB();
        input.value = '';
        renderTasks();
    }
};

function toggleTask(id) {
    const task = allUsersData[currentUser].find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveDB();
        renderTasks();
    }
}

function deleteTask(id) {
    allUsersData[currentUser] = allUsersData[currentUser].filter(t => t.id !== id);
    saveDB();
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = '';
    const tasks = allUsersData[currentUser] || [];
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');

        li.innerHTML = `
            <div class="task-info" onclick="toggleTask(${task.id})">
                <span class="task-text">${task.text}</span>
                <span class="task-time">Ajoutée à ${task.time}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">X</button>
        `;
        taskList.appendChild(li);
    });

    updateStats(tasks);
}

// --- Utilitaires ---
function saveDB() {
    localStorage.setItem('casaTech_db', JSON.stringify(allUsersData));
}

function updateStats(tasks) {
    document.getElementById('totalCount').textContent = tasks.length;
    document.getElementById('doneCount').textContent = tasks.filter(t => t.completed).length;
}

// Go !
start();