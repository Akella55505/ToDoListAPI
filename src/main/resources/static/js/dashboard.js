// Dashboard page functionality

class DashboardManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.isLoading = false;
        this.currentEditTask = null;
        this.init();
    }

    init() {
        // Ensure user is authenticated
        if (!Auth.requireAuth()) {
            return;
        }

        this.setupUI();
        this.bindEvents();
        this.loadTasks();
    }

    setupUI() {
        // Set up user info
        const currentUser = Auth.getUser();
        if (currentUser) {
            const displayName = currentUser.split('@')[0];
            const username = document.getElementById('username');
            const userAvatar = document.getElementById('userAvatar');
            const welcomeMessage = document.getElementById('welcomeMessage');

            if (username) username.textContent = displayName;
            if (userAvatar) userAvatar.textContent = displayName.charAt(0).toUpperCase();
            if (welcomeMessage) welcomeMessage.textContent = `Welcome back, ${displayName}!`;
        }
    }

    bindEvents() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Task form submission
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        }

        // Filter tabs
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => this.setFilter(tab.dataset.filter));
        });

        // Modal events
        this.bindModalEvents();
    }

    bindModalEvents() {
        // Task modal
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const modalCancelBtn = document.getElementById('modalCancelBtn');
        const modalSaveBtn = document.getElementById('modalSaveBtn');
        const editTaskForm = document.getElementById('editTaskForm');

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => Modal.hide('taskModal'));
        }

        if (modalCancelBtn) {
            modalCancelBtn.addEventListener('click', () => Modal.hide('taskModal'));
        }

        if (modalSaveBtn) {
            modalSaveBtn.addEventListener('click', () => this.saveTaskEdit());
        }

        if (editTaskForm) {
            editTaskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTaskEdit();
            });
        }
    }

    async handleLogout() {
        Loading.show('Logging out...');

        // Add a small delay for better UX
        setTimeout(() => {
            Auth.logout();
            Toast.success('Logged out successfully');
            window.location.href = 'auth.html';
        }, 500);
    }

    async handleTaskSubmit(e) {
        e.preventDefault();

        if (this.isLoading) return;

        const description = document.getElementById('taskDescription').value.trim();
        const deadline = document.getElementById('taskDeadline').value;

        if (!description) {
            Toast.error('Please enter a task description');
            return;
        }

        const task = {
            description: description,
            isCompleted: false
        };

        if (deadline) {
            task.deadlineDateTime = deadline + ':00';
        }

        this.isLoading = true;
        const submitBtn = taskForm.querySelector('.btn-primary');
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Adding...</span>';
        submitBtn.disabled = true;

        try {
            const response = await API.post(API_CONFIG.ENDPOINTS.TASKS, task);

            if (response.ok) {
                Toast.success('Task added successfully!');
                taskForm.reset();
                await this.loadTasks();
            } else {
                Toast.error('Failed to add task');
            }
        } catch (error) {
            console.error('Error adding task:', error);
            if (error.message !== 'Authentication required') {
                Toast.error('Error connecting to server');
            }
        } finally {
            this.isLoading = false;
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
        }
    }

    async loadTasks() {
        this.showLoading(true);

        try {
            const response = await API.get(API_CONFIG.ENDPOINTS.TASKS);
            if (response.ok) {
                this.tasks = await response.json();
                this.renderTasks();
                this.updateStats();
            } else {
                Toast.error('Failed to load tasks');
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            if (error.message !== 'Authentication required') {
                Toast.error('Error connecting to server');
            }
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingTasks');
        const tasksList = document.getElementById('tasksList');

        if (show) {
            if (loadingState) loadingState.classList.add('show');
            if (tasksList) tasksList.style.display = 'none';
        } else {
            if (loadingState) loadingState.classList.remove('show');
            if (tasksList) tasksList.style.display = 'block';
        }
    }

    setFilter(filter) {
        // Update active tab
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            if (tab.dataset.filter === filter) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        this.currentFilter = filter;
        this.renderTasks();
    }

    filterTasks(tasks) {
        switch(this.currentFilter) {
            case 'completed':
                return tasks.filter(t => t.isCompleted);
            case 'pending':
                return tasks.filter(t => !t.isCompleted);
            case 'overdue':
                return tasks.filter(t => !t.isCompleted && Utils.isOverdue(t.deadlineDateTime));
            default:
                return tasks;
        }
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.filterTasks(this.tasks);

        if (filteredTasks.length === 0) {
            if (tasksList) tasksList.innerHTML = '';
            if (emptyState) {
                emptyState.classList.add('show');
                const emptyMessage = document.getElementById('emptyStateMessage');
                if (emptyMessage) {
                    switch(this.currentFilter) {
                        case 'completed':
                            emptyMessage.textContent = 'No completed tasks yet';
                            break;
                        case 'pending':
                            emptyMessage.textContent = 'No pending tasks. Great job!';
                            break;
                        case 'overdue':
                            emptyMessage.textContent = 'No overdue tasks';
                            break;
                        default:
                            emptyMessage.textContent = 'Start by adding a new task above';
                    }
                }
            }
            return;
        }

        if (emptyState) emptyState.classList.remove('show');

        const tasksHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
        if (tasksList) tasksList.innerHTML = tasksHTML;

        // Bind task events
        this.bindTaskEvents();
    }

    createTaskHTML(task) {
        const deadlineClass = this.getDeadlineClass(task);
        const deadlineText = Utils.formatDate(task.deadlineDateTime);

        return `
            <div class="task-item ${task.isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.isCompleted ? 'checked' : ''}" 
                     onclick="dashboard.toggleTask(${task.id})"></div>
                <div class="task-content">
                    <div class="task-description">${Utils.escapeHtml(task.description)}</div>
                    ${task.deadlineDateTime ? `
                        <div class="task-deadline ${deadlineClass}">
                            🕐 ${deadlineText}
                        </div>
                    ` : ''}
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit" onclick="dashboard.editTask(${task.id})" title="Edit task">
                        ✏️
                    </button>
                    <button class="task-action-btn delete" onclick="dashboard.deleteTask(${task.id})" title="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    getDeadlineClass(task) {
        if (task.isCompleted) return '';
        if (Utils.isOverdue(task.deadlineDateTime)) return 'overdue';
        if (Utils.isUpcoming(task.deadlineDateTime)) return 'upcoming';
        return '';
    }

    bindTaskEvents() {
        // Events are bound via onclick in HTML for simplicity
        // In a production app, you might prefer event delegation
    }

    async toggleTask(id) {
        if (this.isLoading) return;

        try {
            const response = await API.patch(`${API_CONFIG.ENDPOINTS.TASKS}/${id}`);

            if (response.ok) {
                Toast.success('Task updated!');
                await this.loadTasks();
            } else {
                Toast.error('Failed to update task');
            }
        } catch (error) {
            console.error('Error toggling task:', error);
            if (error.message !== 'Authentication required') {
                Toast.error('Error connecting to server');
            }
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        this.currentEditTask = task;

        // Populate modal form
        const editDescription = document.getElementById('editDescription');
        const editDeadline = document.getElementById('editDeadline');
        const editCompleted = document.getElementById('editCompleted');

        if (editDescription) editDescription.value = task.description;
        if (editCompleted) editCompleted.checked = task.isCompleted;

        if (editDeadline && task.deadlineDateTime) {
            // Convert to local datetime-local format
            const date = new Date(task.deadlineDateTime);
            const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16);
            editDeadline.value = localDateTime;
        } else if (editDeadline) {
            editDeadline.value = '';
        }

        Modal.show('taskModal');
    }

    async saveTaskEdit() {
        if (!this.currentEditTask || this.isLoading) return;

        const description = document.getElementById('editDescription').value.trim();
        const deadline = document.getElementById('editDeadline').value;
        const isCompleted = document.getElementById('editCompleted').checked;

        if (!description) {
            Toast.error('Please enter a task description');
            return;
        }

        const updatedTask = {
            description: description,
            isCompleted: isCompleted
        };

        if (deadline) {
            updatedTask.deadlineDateTime = deadline + ':00';
        } else {
            updatedTask.deadlineDateTime = null;
        }

        this.isLoading = true;
        const saveBtn = document.getElementById('modalSaveBtn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        try {
            const response = await API.put(`${API_CONFIG.ENDPOINTS.TASKS}/${this.currentEditTask.id}`, updatedTask);

            if (response.ok) {
                Toast.success('Task updated successfully!');
                Modal.hide('taskModal');
                await this.loadTasks();
            } else {
                Toast.error('Failed to update task');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            if (error.message !== 'Authentication required') {
                Toast.error('Error connecting to server');
            }
        } finally {
            this.isLoading = false;
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    }

    deleteTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        Modal.confirm(
            `Are you sure you want to delete "${task.description}"?`,
            () => this.confirmDeleteTask(id)
        );
    }

    async confirmDeleteTask(id) {
        if (this.isLoading) return;

        try {
            const response = await API.delete(`${API_CONFIG.ENDPOINTS.TASKS}/${id}`);

            if (response.ok) {
                Toast.success('Task deleted successfully!');
                await this.loadTasks();
            } else {
                Toast.error('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            if (error.message !== 'Authentication required') {
                Toast.error('Error connecting to server');
            }
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.isCompleted).length;
        const pending = this.tasks.filter(t => !t.isCompleted).length;
        const overdue = this.tasks.filter(t => !t.isCompleted && Utils.isOverdue(t.deadlineDateTime)).length;

        // Update stat displays
        const totalElement = document.getElementById('totalTasks');
        const completedElement = document.getElementById('completedTasks');
        const pendingElement = document.getElementById('pendingTasks');
        const overdueElement = document.getElementById('overdueTasks');

        if (totalElement) totalElement.textContent = total;
        if (completedElement) completedElement.textContent = completed;
        if (pendingElement) pendingElement.textContent = pending;
        if (overdueElement) overdueElement.textContent = overdue;

        // Update filter counts
        const allCount = document.getElementById('allCount');
        const pendingCount = document.getElementById('pendingCount');
        const completedCount = document.getElementById('completedCount');
        const overdueCount = document.getElementById('overdueCount');

        if (allCount) allCount.textContent = total;
        if (pendingCount) pendingCount.textContent = pending;
        if (completedCount) completedCount.textContent = completed;
        if (overdueCount) overdueCount.textContent = overdue;
    }
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new DashboardManager();
});

// Make dashboard available globally for onclick handlers
window.dashboard = dashboard;