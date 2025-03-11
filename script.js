// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const tasksCounter = document.getElementById('tasks-counter');
const clearCompletedBtn = document.getElementById('clear-completed');

let tasks = [];
let editingTaskId = null;

function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function addTask(text) {
    if (text.trim() === '') return;
    
    const newTask = {
        id: generateId(),
        text: text,
        completed: false,
        createdAt: new Date()
    };
    
    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = '';
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function toggleTaskCompletion(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;
    
    editingTaskId = id;
    renderTasks();
}

function saveEditedTask(id, newText) {
    if (newText.trim() === '') return;
    
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, text: newText };
        }
        return task;
    });
    
    editingTaskId = null;
    saveTasks();
    renderTasks();
}

function cancelEditing() {
    editingTaskId = null;
    renderTasks();
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

function updateTasksCounter() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    tasksCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;
    
    if (editingTaskId === task.id) {
        const editForm = document.createElement('form');
        editForm.className = 'edit-form';
        
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = task.text;
        editInput.autocomplete = 'off';
        
        const saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.className = 'save-btn';
        saveBtn.innerHTML = '<i class="fas fa-check"></i>';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'cancel-btn';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
        
        editForm.appendChild(editInput);
        editForm.appendChild(saveBtn);
        editForm.appendChild(cancelBtn);
        
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveEditedTask(task.id, editInput.value);
        });
        
        cancelBtn.addEventListener('click', cancelEditing);
        
        li.appendChild(editForm);
        
        // Focus the input after rendering
        setTimeout(() => editInput.focus(), 0);
        
        return li;
    }
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;
    
    const editButton = document.createElement('button');
    editButton.className = 'edit-btn';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editButton);
    li.appendChild(deleteButton);
    
    return li;
}

function renderTasks() {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No tasks to display';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '20px';
        emptyMessage.style.color = '#2563eb';
        taskList.appendChild(emptyMessage);
    } else {
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }
    
    updateTasksCounter();
}

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(taskInput.value);
});

taskList.addEventListener('click', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    
    const taskId = taskItem.dataset.id;
    
    if (e.target.classList.contains('task-checkbox') || e.target.classList.contains('task-text')) {
        toggleTaskCompletion(taskId);
    } else if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
        editTask(taskId);
    } else if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
        deleteTask(taskId);
    }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});