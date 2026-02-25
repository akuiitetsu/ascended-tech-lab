// ============================================
// TEACHER DASHBOARD - AscendEd Tech Lab
// Educator Portal JavaScript
// ============================================

'use strict';

// ============================================
// GLOBAL STATE
// ============================================
const TeacherDash = {
    user: null,
    userId: null,
    allStudents: [],
    allProgress: [],
    tasks: [],
    charts: {},
    currentReport: null,

    // Room metadata
    rooms: {
        flowchart:   { name: 'FLOWBYTE',  icon: '🔷', color: '#005FFB' },
        networking:  { name: 'NETXUS',    icon: '🌐', color: '#00A949' },
        'ai-training': { name: 'AITRIX',  icon: '🤖', color: '#E08300' },
        database:    { name: 'SCHEMAX',   icon: '🗄️', color: '#FF3600' },
        programming: { name: 'CODEVANCE', icon: '💻', color: '#FF006D' }
    }
};

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    checkTeacherAuth();
    setupNavigation();
    loadDashboardOverview();
});

function checkTeacherAuth() {
    const role      = localStorage.getItem('userRole');
    const username  = localStorage.getItem('currentUser');
    const userId    = localStorage.getItem('userId');

    const isTeacher = role === 'teacher' || username === 'teacher';

    if (!isTeacher || !userId) {
        window.location.replace('/');
        return;
    }

    TeacherDash.userId = parseInt(userId);
    TeacherDash.user   = {
        username,
        role,
        id: TeacherDash.userId
    };

    document.getElementById('teacherName').textContent = username || 'Teacher';
}

function teacherLogout() {
    localStorage.clear();
    window.location.replace('/');
}

// ============================================
// NAVIGATION
// ============================================
function setupNavigation() {
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            showSection(section);
        });
    });
}

function showSection(sectionId) {
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    if (navItem) navItem.classList.add('active');

    // Show section
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');

    // Load section data
    switch (sectionId) {
        case 'dashboard':  loadDashboardOverview();   break;
        case 'students':   loadStudents();            break;
        case 'tasks':      loadTaskDesigner();        break;
        case 'progress':   loadProgressTracking();    break;
        case 'analytics':  loadAnalytics();           break;
        case 'reports':    /* no auto-load */         break;
    }
}

// ============================================
// API HELPERS
// ============================================
async function apiFetch(url, options = {}) {
    try {
        const userId = TeacherDash.userId || localStorage.getItem('userId') || '';
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': String(userId),
                ...options.headers
            },
            ...options
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error(`API Error [${url}]:`, err.message);
        return null;
    }
}

// ============================================
// DASHBOARD OVERVIEW
// ============================================
async function loadDashboardOverview() {
    try {
        const [users, analytics, progressSummary] = await Promise.all([
            apiFetch('/api/users'),
            apiFetch('/api/admin/analytics/overview?timeframe=7'),
            apiFetch('/api/admin/progress/summary')
        ]);

        // Filter only regular students
        const students = (users || []).filter(u =>
            u.role === 'user' && u.name !== 'admin' && u.name !== 'teacher'
        );
        TeacherDash.allStudents = students;
        TeacherDash.allProgress = progressSummary || [];

        // Update stat cards
        document.getElementById('totalStudents').textContent = students.length;
        document.getElementById('studentsBadge').textContent = students.length;

        if (analytics) {
            document.getElementById('activeStudents').textContent = analytics.user_stats?.active_users || 0;
            const avg = analytics.user_stats?.avg_progress || 0;
            document.getElementById('avgClassProgress').textContent = avg.toFixed(1) + '%';
        }

        // Load tasks count
        await loadTeacherTasks(false);
        document.getElementById('totalTasks').textContent = TeacherDash.tasks.length;

        // Render charts
        renderModuleCompletionChart(progressSummary || []);

        // Top students
        renderTopStudents(students, progressSummary || []);

        // Needs Help  
        renderNeedsHelp(students, progressSummary || []);

        // Recent Activity
        renderRecentActivity(progressSummary || []);

    } catch (err) {
        console.error('Dashboard overview error:', err);
    }
}

function refreshDashboard() {
    loadDashboardOverview();
    showToast('Dashboard refreshed', 'success');
}

function renderModuleCompletionChart(progressData) {
    const rooms = Object.keys(TeacherDash.rooms);
    const labels = rooms.map(r => TeacherDash.rooms[r].name);
    const colors = rooms.map(r => TeacherDash.rooms[r].color);

    // Calculate avg progress per room
    const avgPerRoom = rooms.map(roomKey => {
        const recs = progressData.filter(p => p.room_name === roomKey);
        if (!recs.length) return 0;
        return Math.round(recs.reduce((s, p) => s + (p.progress_percentage || 0), 0) / recs.length);
    });

    const ctx = document.getElementById('moduleCompletionChart');
    if (!ctx) return;

    if (TeacherDash.charts.moduleCompletion) TeacherDash.charts.moduleCompletion.destroy();

    TeacherDash.charts.moduleCompletion = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Avg Progress (%)',
                data: avgPerRoom,
                backgroundColor: colors.map(c => c + '55'),
                borderColor: colors,
                borderWidth: 2,
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', callback: v => v + '%' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function renderTopStudents(students, progressData) {
    const list = document.getElementById('topStudentsList');
    if (!list) return;

    // Calculate total score per student
    const scoredStudents = students.map(s => {
        const progs = progressData.filter(p => p.user_id === s.id);
        const totalProgress = progs.reduce((sum, p) => sum + (p.progress_percentage || 0), 0);
        const avgProgress = progs.length ? totalProgress / progs.length : 0;
        return { ...s, avgProgress: Math.round(avgProgress) };
    });

    scoredStudents.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
    const top5 = scoredStudents.slice(0, 5);

    if (!top5.length) {
        list.innerHTML = '<div class="loading-msg">No student data yet.</div>';
        return;
    }

    const rankClasses = ['gold', 'silver', 'bronze', '', ''];
    list.innerHTML = top5.map((s, i) => `
        <div class="top-student-item">
            <span class="rank-badge ${rankClasses[i] || ''}">#${i + 1}</span>
            <span class="ts-name">${escHtml(s.name)}</span>
            <span class="ts-score">${s.total_score || 0} XP &nbsp; ${s.avgProgress}%</span>
        </div>
    `).join('');
}

function renderNeedsHelp(students, progressData) {
    const list = document.getElementById('needsHelpList');
    if (!list) return;

    const atRisk = students.filter(s => {
        const progs = progressData.filter(p => p.user_id === s.id);
        const avg = progs.length
            ? progs.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progs.length
            : 0;
        return avg < 30;
    }).slice(0, 6);

    if (!atRisk.length) {
        list.innerHTML = '<div class="loading-msg">All students are on track! ✅</div>';
        return;
    }

    list.innerHTML = atRisk.map(s => {
        const progs = progressData.filter(p => p.user_id === s.id);
        const avg = progs.length
            ? Math.round(progs.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progs.length)
            : 0;
        return `
            <div class="alert-item danger">
                <div class="student-avatar"><i class="bi bi-person-fill"></i></div>
                <div class="item-info">
                    <span class="item-name">${escHtml(s.name)}</span>
                    <span class="item-sub">Overall: ${avg}% progress</span>
                </div>
                <span class="progress-pill pill-low">${avg}%</span>
            </div>
        `;
    }).join('');
}

function renderRecentActivity(progressData) {
    const list = document.getElementById('recentActivityList');
    if (!list) return;

    const sorted = [...progressData]
        .filter(p => p.last_accessed)
        .sort((a, b) => new Date(b.last_accessed) - new Date(a.last_accessed))
        .slice(0, 6);

    if (!sorted.length) {
        list.innerHTML = '<div class="loading-msg">No recent activity recorded.</div>';
        return;
    }

    list.innerHTML = sorted.map(p => {
        const room = TeacherDash.rooms[p.room_name] || { name: p.room_name, icon: '📚' };
        return `
            <div class="activity-item">
                <div class="activity-icon">${room.icon}</div>
                <div class="item-info">
                    <span class="item-name">${escHtml(p.user_name || 'Unknown')}</span>
                    <span class="item-sub">${room.name} — ${p.progress_percentage || 0}%</span>
                </div>
                <span class="item-sub">${timeAgo(p.last_accessed)}</span>
            </div>
        `;
    }).join('');
}

// ============================================
// STUDENTS
// ============================================
async function loadStudents() {
    if (!TeacherDash.allStudents.length) {
        const [users, progressSummary] = await Promise.all([
            apiFetch('/api/users'),
            apiFetch('/api/admin/progress/summary')
        ]);
        TeacherDash.allStudents = (users || []).filter(u =>
            u.role === 'user' && u.name !== 'admin' && u.name !== 'teacher'
        );
        TeacherDash.allProgress = progressSummary || [];
    }
    renderStudentsTable(TeacherDash.allStudents);
    updateStudentSummaryBar(TeacherDash.allStudents);
}

function renderStudentsTable(students) {
    const tbody = document.getElementById('studentsTableBody');
    document.getElementById('studentsBadge').textContent = students.length;

    if (!students.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading-row">No students found.</td></tr>';
        return;
    }

    tbody.innerHTML = students.map(s => {
        const progs = TeacherDash.allProgress.filter(p => p.user_id === s.id);
        const avgProg = progs.length
            ? Math.round(progs.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progs.length)
            : 0;
        const completedRooms = progs.filter(p => p.completed).length;
        const progressClass = avgProg >= 60 ? 'high' : avgProg >= 30 ? 'medium' : 'low';
        const lastActivity = s.last_activity ? timeAgo(s.last_activity) : 'Never';

        return `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        <div style="width:32px;height:32px;border-radius:50%;background:rgba(22,199,154,0.15);display:flex;align-items:center;justify-content:center;font-size:0.85rem;color:#16c79a;flex-shrink:0;">
                            ${escHtml(s.name.charAt(0).toUpperCase())}
                        </div>
                        <span>${escHtml(s.name)}</span>
                    </div>
                </td>
                <td style="color:#94a3b8;">${escHtml(s.email || '—')}</td>
                <td class="progress-bar-cell">
                    <div class="progress-bar-track">
                        <div class="progress-bar-fill ${progressClass}" style="width:${avgProg}%"></div>
                    </div>
                    <div class="progress-bar-label">${avgProg}% overall</div>
                </td>
                <td>${s.total_score || 0} XP</td>
                <td>${completedRooms}/5</td>
                <td style="color:#94a3b8;">${lastActivity}</td>
                <td>
                    <button class="action-btn" onclick="viewStudentDetail(${s.id}, '${escHtml(s.name)}')">
                        <i class="bi bi-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateStudentSummaryBar(students) {
    const progs = TeacherDash.allProgress;
    let high = 0, low = 0;
    students.forEach(s => {
        const sp = progs.filter(p => p.user_id === s.id);
        const avg = sp.length
            ? sp.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / sp.length
            : 0;
        if (avg >= 60) high++;
        if (avg < 30)  low++;
    });
    document.getElementById('filteredCount').textContent     = students.length;
    document.getElementById('highProgressCount').textContent = high;
    document.getElementById('lowProgressCount').textContent  = low;
}

function filterStudents() {
    const q       = (document.getElementById('studentSearch')?.value || '').toLowerCase();
    const filter  = document.getElementById('progressFilter')?.value || 'all';
    const progs   = TeacherDash.allProgress;

    const filtered = TeacherDash.allStudents.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(q) ||
                              (s.email || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;

        if (filter === 'all') return true;

        const sp = progs.filter(p => p.user_id === s.id);
        const avg = sp.length
            ? sp.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / sp.length
            : 0;

        if (filter === 'high')   return avg >= 60;
        if (filter === 'medium') return avg >= 30 && avg < 60;
        if (filter === 'low')    return avg < 30;
        return true;
    });

    renderStudentsTable(filtered);
    updateStudentSummaryBar(filtered);
}

function exportStudentData() {
    const progs = TeacherDash.allProgress;
    const data  = TeacherDash.allStudents.map(s => {
        const sp  = progs.filter(p => p.user_id === s.id);
        const avg = sp.length
            ? Math.round(sp.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / sp.length)
            : 0;
        return {
            name: s.name,
            email: s.email,
            total_score: s.total_score || 0,
            avg_progress: avg,
            rooms_completed: sp.filter(p => p.completed).length,
            last_activity: s.last_activity || 'Never'
        };
    });

    downloadJSON(data, 'students_export.json');
    showToast('Student data exported', 'success');
}

async function viewStudentDetail(userId, username) {
    const modal = document.getElementById('studentDetailModal');
    const title = document.getElementById('studentDetailTitle');
    const body  = document.getElementById('studentDetailBody');

    title.innerHTML = `<i class="bi bi-person-circle"></i> ${escHtml(username)}`;
    body.innerHTML  = '<div class="loading-msg">Loading student details...</div>';
    modal.style.display = 'flex';

    const summary = await apiFetch(`/api/users/${userId}/progress/summary`);
    if (!summary) {
        body.innerHTML = '<div class="loading-msg">Failed to load student data.</div>';
        return;
    }

    const stats    = summary.overall_stats || {};
    const roomProg = summary.room_progress || [];

    const roomsHtml = roomProg.map(r => {
        const pct  = r.progress_percentage || 0;
        const meta = TeacherDash.rooms[r.room_name] || { name: r.room_name, icon: '📚' };
        return `
            <div class="room-prog-item">
                <div class="room-prog-name">${meta.icon} ${meta.name}</div>
                <div class="room-prog-pct">${pct}%</div>
                <div class="room-prog-score">Score: ${r.score || 0}</div>
                ${r.completed ? '<div style="font-size:0.65rem;color:#16c79a;margin-top:3px;">✅ Completed</div>' : ''}
            </div>
        `;
    }).join('');

    body.innerHTML = `
        <div class="student-detail-grid">
            <div class="sdetail-card">
                <div class="sdetail-value">${stats.total_score || 0}</div>
                <div class="sdetail-label">Total XP</div>
            </div>
            <div class="sdetail-card">
                <div class="sdetail-value">${stats.total_progress || 0}%</div>
                <div class="sdetail-label">Overall Progress</div>
            </div>
            <div class="sdetail-card">
                <div class="sdetail-value">${stats.completed_rooms || 0}/5</div>
                <div class="sdetail-label">Rooms Completed</div>
            </div>
            <div class="sdetail-card">
                <div class="sdetail-value">${stats.current_streak || 0}</div>
                <div class="sdetail-label">Day Streak</div>
            </div>
            <div class="sdetail-card">
                <div class="sdetail-value">${stats.longest_streak || 0}</div>
                <div class="sdetail-label">Best Streak</div>
            </div>
            <div class="sdetail-card">
                <div class="sdetail-value">${summary.username || username}</div>
                <div class="sdetail-label">Username</div>
            </div>
        </div>
        <h4 style="font-size:0.85rem;color:#94a3b8;text-transform:uppercase;margin-bottom:0.75rem;">
            Module Progress Breakdown
        </h4>
        <div class="room-progress-grid">${roomsHtml}</div>
    `;
}

function closeStudentDetailModal() {
    document.getElementById('studentDetailModal').style.display = 'none';
}

// ============================================
// TASK DESIGNER
// ============================================
async function loadTeacherTasks(render = true) {
    const tasks = await apiFetch(`/api/teacher/tasks?teacher_id=${TeacherDash.userId}`);
    TeacherDash.tasks = tasks || [];
    if (render) {
        renderTaskCards(TeacherDash.tasks);
        updateTaskStats();
    }
}

async function loadTaskDesigner() {
    await loadTeacherTasks(true);
}

function renderTaskCards(tasks) {
    const grid = document.getElementById('taskCardsGrid');
    if (!grid) return;

    if (!tasks.length) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <i class="bi bi-journal-plus"></i>
                <p>No tasks created yet. Click "Create New Task" to get started.</p>
            </div>`;
        return;
    }

    grid.innerHTML = tasks.map(task => {
        const meta = parseTaskMeta(task);
        const diffClass = `tag-${meta.difficulty}`;
        const roomName  = TeacherDash.rooms[meta.room]?.name || meta.room;

        return `
            <div class="task-card" id="taskcard-${task.id}">
                <div class="task-card-header">
                    <span class="task-card-title">${escHtml(task.title)}</span>
                    <div class="task-card-actions">
                        <button class="icon-action-btn edit" onclick="editTask(${task.id})" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="icon-action-btn delete" onclick="deleteTask(${task.id})" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="task-card-tags">
                    <span class="tag tag-room">${escHtml(roomName)}</span>
                    <span class="tag ${diffClass}">${capitalize(meta.difficulty)}</span>
                    ${meta.cooperative ? '<span class="tag tag-coop"><i class="bi bi-people-fill"></i> Coop</span>' : ''}
                    ${!meta.is_active ? '<span class="tag tag-inactive">Inactive</span>' : ''}
                </div>
                <div class="task-card-objectives">${escHtml(meta.objectives || 'No objectives set.')}</div>
            </div>
        `;
    }).join('');
}

function updateTaskStats() {
    const tasks = TeacherDash.tasks;
    document.getElementById('totalTasksCount').textContent  = tasks.length;
    document.getElementById('totalTasks').textContent       = tasks.length;
    document.getElementById('activeTasksCount').textContent  = tasks.filter(t => parseTaskMeta(t).is_active).length;
    document.getElementById('coopTasksCount').textContent   = tasks.filter(t => parseTaskMeta(t).cooperative).length;
}

function filterTasks() {
    const q        = (document.getElementById('taskSearch')?.value || '').toLowerCase();
    const roomF    = document.getElementById('taskRoomFilter')?.value || 'all';
    const diffF    = document.getElementById('taskDifficultyFilter')?.value || 'all';

    const filtered = TeacherDash.tasks.filter(t => {
        const meta = parseTaskMeta(t);
        const matchTitle = t.title.toLowerCase().includes(q) ||
                           (meta.objectives || '').toLowerCase().includes(q);
        const matchRoom  = roomF === 'all' || meta.room === roomF;
        const matchDiff  = diffF === 'all' || meta.difficulty === diffF;
        return matchTitle && matchRoom && matchDiff;
    });

    renderTaskCards(filtered);
}

function parseTaskMeta(task) {
    try {
        return JSON.parse(task.description || '{}');
    } catch {
        return {};
    }
}

// TASK MODAL
function openTaskModal(taskId = null) {
    const modal  = document.getElementById('taskModal');
    const title  = document.getElementById('taskModalTitle');
    document.getElementById('editTaskId').value = '';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskRoom').value = 'flowchart';
    document.getElementById('taskDifficulty').value = 'medium';
    document.getElementById('taskObjectives').value = '';
    document.getElementById('taskInstructions').value = '';
    document.getElementById('taskCooperative').checked = false;
    document.getElementById('taskCriticalThinking').checked = true;
    document.getElementById('taskSelfDirected').checked = true;
    document.getElementById('taskIsActive').checked = true;

    title.innerHTML = '<i class="bi bi-journal-plus"></i> Create New Task';
    modal.style.display = 'flex';
}

function editTask(taskId) {
    const task = TeacherDash.tasks.find(t => t.id === taskId);
    if (!task) return;

    const meta = parseTaskMeta(task);

    document.getElementById('editTaskId').value = taskId;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskRoom').value = meta.room || 'flowchart';
    document.getElementById('taskDifficulty').value = meta.difficulty || 'medium';
    document.getElementById('taskObjectives').value = meta.objectives || '';
    document.getElementById('taskInstructions').value = meta.instructions || '';
    document.getElementById('taskCooperative').checked = !!meta.cooperative;
    document.getElementById('taskCriticalThinking').checked = meta.critical_thinking !== false;
    document.getElementById('taskSelfDirected').checked = meta.self_directed !== false;
    document.getElementById('taskIsActive').checked = meta.is_active !== false;

    document.getElementById('taskModalTitle').innerHTML = '<i class="bi bi-pencil-square"></i> Edit Task';
    document.getElementById('taskModal').style.display = 'flex';
}

function closeTaskModal() {
    document.getElementById('taskModal').style.display = 'none';
}

async function saveTask() {
    const taskId        = document.getElementById('editTaskId').value;
    const title         = document.getElementById('taskTitle').value.trim();
    const room          = document.getElementById('taskRoom').value;
    const difficulty    = document.getElementById('taskDifficulty').value;
    const objectives    = document.getElementById('taskObjectives').value.trim();
    const instructions  = document.getElementById('taskInstructions').value.trim();
    const cooperative       = document.getElementById('taskCooperative').checked;
    const criticalThinking  = document.getElementById('taskCriticalThinking').checked;
    const selfDirected      = document.getElementById('taskSelfDirected').checked;
    const isActive          = document.getElementById('taskIsActive').checked;

    if (!title) { showToast('Task title is required.', 'error'); return; }
    if (!objectives) { showToast('Learning objectives are required.', 'error'); return; }

    const roomDisplay = TeacherDash.rooms[room]?.name || room;
    const description = JSON.stringify({
        type: 'teacher_task',
        room,
        room_display: roomDisplay,
        difficulty,
        objectives,
        instructions,
        cooperative,
        critical_thinking: criticalThinking,
        self_directed: selfDirected,
        is_active: isActive,
        teacher_task: true
    });

    const payload = { title, description, user_id: TeacherDash.userId };

    let result;
    if (taskId) {
        result = await apiFetch(`/api/teacher/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    } else {
        result = await apiFetch('/api/teacher/tasks', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    if (result) {
        closeTaskModal();
        await loadTeacherTasks(true);
        showToast(taskId ? 'Task updated successfully.' : 'Task created successfully.', 'success');
    } else {
        showToast('Failed to save task. Please try again.', 'error');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const result = await apiFetch(`/api/teacher/tasks/${taskId}`, { method: 'DELETE' });
    if (result !== null) {
        await loadTeacherTasks(true);
        showToast('Task deleted.', 'info');
    } else {
        showToast('Failed to delete task.', 'error');
    }
}

// ============================================
// PROGRESS TRACKING
// ============================================
async function loadProgressTracking() {
    const [progressSummary, users] = await Promise.all([
        apiFetch('/api/admin/progress/summary'),
        apiFetch('/api/users')
    ]);

    const students = (users || []).filter(u =>
        u.role === 'user' && u.name !== 'admin' && u.name !== 'teacher'
    );

    TeacherDash.allStudents = students;
    TeacherDash.allProgress = progressSummary || [];

    // Update stats
    document.getElementById('ptotalStudents').textContent = students.length;

    const completions = (progressSummary || []).filter(p => p.completed).length;
    document.getElementById('ptotalCompletions').textContent = completions;

    const allProg = progressSummary || [];
    const avgProg = allProg.length
        ? Math.round(allProg.reduce((s, p) => s + (p.progress_percentage || 0), 0) / allProg.length)
        : 0;
    document.getElementById('pavgProgress').textContent = avgProg + '%';

    const totalTime = allProg.reduce((s, p) => s + (p.time_spent || 0), 0);
    document.getElementById('ptotalTimeSpent').textContent = Math.round(totalTime / 60) + 'h';

    // Module breakdown
    renderModuleBreakdown(progressSummary || []);

    // Charts
    renderRoomPerformanceProgressChart(progressSummary || []);
    renderCompletionTrendsProgressChart(students, progressSummary || []);

    // Table
    renderProgressTable(students, progressSummary || []);
}

function renderModuleBreakdown(progressData) {
    const grid = document.getElementById('moduleBreakdownGrid');
    if (!grid) return;

    const rooms = Object.keys(TeacherDash.rooms);

    grid.innerHTML = rooms.map(roomKey => {
        const recs    = progressData.filter(p => p.room_name === roomKey);
        const meta    = TeacherDash.rooms[roomKey];
        const avg     = recs.length
            ? Math.round(recs.reduce((s, p) => s + (p.progress_percentage || 0), 0) / recs.length)
            : 0;
        const completed = recs.filter(p => p.completed).length;

        return `
            <div class="module-stat-box">
                <div class="module-icon">${meta.icon}</div>
                <div class="module-name">${meta.name}</div>
                <div class="module-avg-pct">${avg}%</div>
                <div class="module-completion-count">${completed} completed</div>
            </div>
        `;
    }).join('');
}

function renderRoomPerformanceProgressChart(progressData) {
    const ctx = document.getElementById('roomPerformanceProgressChart');
    if (!ctx) return;

    const rooms  = Object.keys(TeacherDash.rooms);
    const labels = rooms.map(r => TeacherDash.rooms[r].name);
    const colors = rooms.map(r => TeacherDash.rooms[r].color);

    const avgPerRoom = rooms.map(roomKey => {
        const recs = progressData.filter(p => p.room_name === roomKey);
        return recs.length
            ? Math.round(recs.reduce((s, p) => s + (p.progress_percentage || 0), 0) / recs.length)
            : 0;
    });

    if (TeacherDash.charts.roomPerfProgress) TeacherDash.charts.roomPerfProgress.destroy();

    TeacherDash.charts.roomPerfProgress = new Chart(ctx, {
        type: 'radar',
        data: {
            labels,
            datasets: [{
                label: 'Avg Progress',
                data: avgPerRoom,
                backgroundColor: 'rgba(22,199,154,0.15)',
                borderColor: '#16c79a',
                borderWidth: 2,
                pointBackgroundColor: '#16c79a',
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    grid:     { color: 'rgba(255,255,255,0.05)' },
                    ticks:    { color: '#94a3b8', backdropColor: 'transparent', stepSize: 20 },
                    pointLabels: { color: '#e2e8f0', font: { size: 11 } }
                }
            },
            plugins: { legend: { labels: { color: '#94a3b8' } } }
        }
    });
}

function renderCompletionTrendsProgressChart(students, progressData) {
    const ctx = document.getElementById('completionTrendsProgressChart');
    if (!ctx) return;

    // Build bar chart: number of students per progress bracket
    const brackets = [
        { label: '0-20%',   count: 0 },
        { label: '21-40%',  count: 0 },
        { label: '41-60%',  count: 0 },
        { label: '61-80%',  count: 0 },
        { label: '81-100%', count: 0 },
    ];

    students.forEach(s => {
        const progs = progressData.filter(p => p.user_id === s.id);
        const avg   = progs.length
            ? Math.round(progs.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progs.length)
            : 0;
        if (avg <= 20)       brackets[0].count++;
        else if (avg <= 40)  brackets[1].count++;
        else if (avg <= 60)  brackets[2].count++;
        else if (avg <= 80)  brackets[3].count++;
        else                 brackets[4].count++;
    });

    if (TeacherDash.charts.completionTrendsP) TeacherDash.charts.completionTrendsP.destroy();

    TeacherDash.charts.completionTrendsP = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: brackets.map(b => b.label),
            datasets: [{
                label: 'Students',
                data: brackets.map(b => b.count),
                backgroundColor: ['#e74c3c88','#f39c1288','#f1c40f88','#1abc9c88','#16c79a88'],
                borderColor:     ['#e74c3c',  '#f39c12',  '#f1c40f',  '#1abc9c',  '#16c79a'],
                borderWidth: 2,
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid:  { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', stepSize: 1 }
                },
                x: {
                    grid:  { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function renderProgressTable(students, progressData) {
    const tbody = document.getElementById('progressTableBody');
    if (!tbody) return;

    const rooms = ['flowchart','networking','ai-training','database','programming'];

    if (!students.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-row">No student data.</td></tr>';
        return;
    }

    tbody.innerHTML = students.map(s => {
        const studentProgs = progressData.filter(p => p.user_id === s.id);

        const roomCells = rooms.map(r => {
            const rec = studentProgs.find(p => p.room_name === r);
            const pct = rec ? (rec.progress_percentage || 0) : null;
            if (pct === null) return `<td><span class="cell-pct none">—</span></td>`;
            const cls = pct >= 60 ? 'high' : pct >= 30 ? 'medium' : 'low';
            return `<td><span class="cell-pct ${cls}">${pct}%</span></td>`;
        });

        const avg = studentProgs.length
            ? Math.round(studentProgs.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / studentProgs.length)
            : 0;
        const avgCls = avg >= 60 ? 'high' : avg >= 30 ? 'medium' : 'low';

        return `
            <tr>
                <td><strong>${escHtml(s.name)}</strong></td>
                ${roomCells.join('')}
                <td><span class="cell-pct ${avgCls}">${avg}%</span></td>
                <td style="color:#16c79a;font-weight:bold;">${s.total_score || 0} XP</td>
            </tr>
        `;
    }).join('');
}

function filterProgressTable() {
    const q = (document.getElementById('progressStudentSearch')?.value || '').toLowerCase();
    const filtered = TeacherDash.allStudents.filter(s => s.name.toLowerCase().includes(q));
    renderProgressTable(filtered, TeacherDash.allProgress);
}

function exportProgressReport() {
    const rooms = ['flowchart','networking','ai-training','database','programming'];
    const data  = TeacherDash.allStudents.map(s => {
        const progs = TeacherDash.allProgress.filter(p => p.user_id === s.id);
        const row   = { student: s.name, email: s.email, total_score: s.total_score || 0 };
        rooms.forEach(r => {
            const rec = progs.find(p => p.room_name === r);
            row[TeacherDash.rooms[r].name] = rec ? `${rec.progress_percentage || 0}%` : '0%';
        });
        const avg = progs.length
            ? Math.round(progs.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progs.length)
            : 0;
        row.overall_progress = avg + '%';
        return row;
    });

    downloadJSON(data, 'progress_report.json');
    showToast('Progress report exported', 'success');
}

// ============================================
// ANALYTICS
// ============================================
async function loadAnalytics() {
    const timeframe = document.getElementById('analyticsTimeframe')?.value || '30';
    const [analytics, progressSummary, badges] = await Promise.all([
        apiFetch(`/api/admin/analytics/overview?timeframe=${timeframe}`),
        apiFetch('/api/admin/progress/summary'),
        apiFetch('/api/admin/badges/summary')
    ]);

    if (analytics) {
        const avg = analytics.user_stats?.avg_progress || 0;
        document.getElementById('mAvgProgress').textContent = avg.toFixed(1) + '%';
        document.getElementById('mAvgProgressBar').style.width = avg + '%';
        document.getElementById('mActiveUsers').textContent = analytics.user_stats?.active_users || 0;
        const compRates = analytics.completion_rates || [];
        const avgComp   = compRates.length
            ? Math.round(compRates.reduce((s, r) => s + r.completion_rate, 0) / compRates.length)
            : 0;
        document.getElementById('mCompletionRate').textContent  = avgComp + '%';
    }

    document.getElementById('mTotalBadges').textContent = (badges || []).length;

    renderModulePopularityChart(analytics);
    renderDifficultyDistChart(progressSummary || []);
    renderScoreDistChart(TeacherDash.allStudents.length ? TeacherDash.allStudents : []);
    renderCompletionRatesChart(analytics);
    renderSkillBars(progressSummary || []);
}

function renderModulePopularityChart(analytics) {
    const ctx = document.getElementById('modulePopularityChart');
    if (!ctx) return;

    const popular = (analytics?.popular_rooms || []).slice(0, 5);
    const labels  = popular.map(r => TeacherDash.rooms[r.room_name]?.name || r.room_name);
    const data    = popular.map(r => r.access_count);
    const colors  = popular.map(r => TeacherDash.rooms[r.room_name]?.color || '#16c79a');

    if (TeacherDash.charts.modulePopularity) TeacherDash.charts.modulePopularity.destroy();

    TeacherDash.charts.modulePopularity = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Accesses',
                data,
                backgroundColor: colors.map(c => c + '55'),
                borderColor: colors,
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color:'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function renderDifficultyDistChart(progressData) {
    const ctx = document.getElementById('difficultyDistChart');
    if (!ctx) return;

    // Count completed rooms per bracket
    const completed  = progressData.filter(p => p.completed).length;
    const inProgress = progressData.filter(p => !p.completed && p.progress_percentage > 0).length;
    const notStarted = progressData.filter(p => !p.progress_percentage).length;

    if (TeacherDash.charts.diffDist) TeacherDash.charts.diffDist.destroy();

    TeacherDash.charts.diffDist = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Not Started'],
            datasets: [{
                data: [completed, inProgress, notStarted],
                backgroundColor: ['#16c79a55','#f39c1255','#e74c3c55'],
                borderColor:     ['#16c79a',  '#f39c12',  '#e74c3c'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#94a3b8', font: { size: 11 } } }
            }
        }
    });
}

function renderScoreDistChart(students) {
    const ctx = document.getElementById('scoreDistChart');
    if (!ctx) return;

    const brackets = [
        { label: '0-100',    count: 0 },
        { label: '101-200',  count: 0 },
        { label: '201-300',  count: 0 },
        { label: '301-500',  count: 0 },
        { label: '500+',     count: 0 },
    ];

    students.forEach(s => {
        const score = s.total_score || 0;
        if (score <= 100)        brackets[0].count++;
        else if (score <= 200)   brackets[1].count++;
        else if (score <= 300)   brackets[2].count++;
        else if (score <= 500)   brackets[3].count++;
        else                     brackets[4].count++;
    });

    if (TeacherDash.charts.scoreDist) TeacherDash.charts.scoreDist.destroy();

    TeacherDash.charts.scoreDist = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: brackets.map(b => b.label),
            datasets: [{
                label: 'Students',
                data: brackets.map(b => b.count),
                backgroundColor: '#16c79a33',
                borderColor: '#16c79a',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color:'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function renderCompletionRatesChart(analytics) {
    const ctx = document.getElementById('completionRatesChart');
    if (!ctx) return;

    const rates  = analytics?.completion_rates || [];
    const labels = rates.map(r => TeacherDash.rooms[r.room_name]?.name || r.room_name);
    const data   = rates.map(r => parseFloat(r.completion_rate) || 0);
    const colors = rates.map(r => TeacherDash.rooms[r.room_name]?.color || '#16c79a');

    if (TeacherDash.charts.compRates) TeacherDash.charts.compRates.destroy();

    TeacherDash.charts.compRates = new Chart(ctx, {
        type: 'horizontalBar' in Chart.overrides ? 'bar' : 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Completion Rate (%)',
                data,
                backgroundColor: colors.map(c => c + '44'),
                borderColor: colors,
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, max: 100, grid: { color:'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: v => v + '%' } },
                y: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function renderSkillBars(progressData) {
    const container = document.getElementById('skillBarsContainer');
    if (!container) return;

    const rooms = Object.keys(TeacherDash.rooms);
    container.innerHTML = rooms.map(roomKey => {
        const recs = progressData.filter(p => p.room_name === roomKey);
        const avg  = recs.length
            ? Math.round(recs.reduce((s, p) => s + (p.progress_percentage || 0), 0) / recs.length)
            : 0;
        const meta = TeacherDash.rooms[roomKey];

        return `
            <div class="skill-bar-item">
                <span class="skill-bar-label">${meta.icon} ${meta.name}</span>
                <div class="skill-bar-track">
                    <div class="skill-bar-fill" style="width:${avg}%;background:linear-gradient(90deg,${meta.color}99,${meta.color})"></div>
                </div>
                <span class="skill-bar-value">${avg}%</span>
            </div>
        `;
    }).join('');
}

// ============================================
// REPORTS
// ============================================
function generateReport() {
    const type  = document.getElementById('reportType').value;
    const range = document.getElementById('reportDateRange').value;
    const fmt   = document.getElementById('reportFormat').value;

    let data;
    switch (type) {
        case 'class_summary':        data = buildClassSummary();         break;
        case 'student_performance':  data = buildStudentPerformance();   break;
        case 'module_analysis':      data = buildModuleAnalysis();       break;
        case 'progress_report':      data = buildProgressData();         break;
        case 'achievement_report':   data = buildAchievementReport();    break;
        default: data = buildClassSummary();
    }

    TeacherDash.currentReport = { data, format: fmt };
    displayReport(data, fmt);
    document.getElementById('downloadReportBtn').style.display = 'block';
}

function quickReport(type) {
    let data;
    switch (type) {
        case 'class_overview':  data = buildClassSummary();       break;
        case 'top_performers':  data = buildTopPerformers();      break;
        case 'at_risk':         data = buildAtRiskStudents();     break;
        case 'module_stats':    data = buildModuleAnalysis();     break;
        case 'badge_report':    data = buildAchievementReport();  break;
        default: data = buildClassSummary();
    }

    TeacherDash.currentReport = { data, format: 'json' };
    displayReport(data, 'json');
    document.getElementById('downloadReportBtn').style.display = 'block';
    showSection('reports');
}

function buildClassSummary() {
    const students = TeacherDash.allStudents;
    const progs    = TeacherDash.allProgress;
    const avg      = progs.length
        ? Math.round(progs.reduce((s, p) => s + (p.progress_percentage || 0), 0) / progs.length)
        : 0;
    return {
        report_type: 'Class Summary',
        generated_at: new Date().toISOString(),
        total_students: students.length,
        average_progress: avg + '%',
        completed_rooms: progs.filter(p => p.completed).length,
        students: students.map(s => ({
            name: s.name,
            total_score: s.total_score || 0,
            last_active: s.last_activity || 'Never'
        }))
    };
}

function buildStudentPerformance() {
    const rooms = ['flowchart','networking','ai-training','database','programming'];
    return {
        report_type: 'Student Performance',
        generated_at: new Date().toISOString(),
        students: TeacherDash.allStudents.map(s => {
            const progs = TeacherDash.allProgress.filter(p => p.user_id === s.id);
            const result = { name: s.name, total_score: s.total_score || 0 };
            rooms.forEach(r => {
                const rec = progs.find(p => p.room_name === r);
                result[TeacherDash.rooms[r].name] = rec
                    ? { progress: rec.progress_percentage + '%', score: rec.score || 0, completed: rec.completed }
                    : { progress: '0%', score: 0, completed: false };
            });
            return result;
        })
    };
}

function buildModuleAnalysis() {
    const rooms = Object.keys(TeacherDash.rooms);
    return {
        report_type: 'Module Analysis',
        generated_at: new Date().toISOString(),
        modules: rooms.map(roomKey => {
            const recs = TeacherDash.allProgress.filter(p => p.room_name === roomKey);
            const avg  = recs.length
                ? Math.round(recs.reduce((s, p) => s + (p.progress_percentage || 0), 0) / recs.length)
                : 0;
            return {
                module: TeacherDash.rooms[roomKey].name,
                students_enrolled: recs.length,
                avg_progress: avg + '%',
                completions: recs.filter(p => p.completed).length,
                avg_score: recs.length
                    ? Math.round(recs.reduce((s, p) => s + (p.score || 0), 0) / recs.length)
                    : 0
            };
        })
    };
}

function buildProgressData() {
    return buildStudentPerformance();
}

function buildAchievementReport() {
    return {
        report_type: 'Achievement Report',
        generated_at: new Date().toISOString(),
        note: 'Fetch /api/admin/badges/summary for live badge data.',
        students: TeacherDash.allStudents.map(s => ({
            name: s.name,
            total_score: s.total_score || 0,
            streak: s.current_streak || 0
        }))
    };
}

function buildTopPerformers() {
    const sorted = [...TeacherDash.allStudents].sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
    return {
        report_type: 'Top Performers',
        generated_at: new Date().toISOString(),
        top_students: sorted.slice(0, 10).map((s, i) => ({
            rank: i + 1,
            name: s.name,
            total_score: s.total_score || 0,
            streak: s.current_streak || 0
        }))
    };
}

function buildAtRiskStudents() {
    const atRisk = TeacherDash.allStudents.filter(s => {
        const progs = TeacherDash.allProgress.filter(p => p.user_id === s.id);
        const avg   = progs.length
            ? progs.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progs.length
            : 0;
        return avg < 30;
    });

    return {
        report_type: 'At-Risk Students',
        generated_at: new Date().toISOString(),
        total_at_risk: atRisk.length,
        students: atRisk.map(s => {
            const progs = TeacherDash.allProgress.filter(p => p.user_id === s.id);
            const avg   = progs.length
                ? Math.round(progs.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progs.length)
                : 0;
            return {
                name: s.name,
                avg_progress: avg + '%',
                last_active: s.last_activity || 'Never',
                recommendation: avg === 0
                    ? 'Has not started any modules'
                    : 'Requires additional guidance and support'
            };
        })
    };
}

function displayReport(data, fmt) {
    const output = document.getElementById('reportOutput');
    if (fmt === 'csv') {
        output.innerHTML = `<pre>${jsonToCSV(data)}</pre>`;
    } else {
        output.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }
}

function downloadReport() {
    if (!TeacherDash.currentReport) return;
    const { data, format } = TeacherDash.currentReport;
    const ts = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
        downloadText(jsonToCSV(data), `teacher_report_${ts}.csv`, 'text/csv');
    } else {
        downloadJSON(data, `teacher_report_${ts}.json`);
    }
    showToast('Report downloaded', 'success');
}

function jsonToCSV(obj) {
    const rows = Array.isArray(obj) ? obj : (obj.students || obj.top_students || Object.values(obj));
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    const lines = [
        headers.join(','),
        ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
    ];
    return lines.join('\n');
}

// ============================================
// UTILITIES
// ============================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function timeAgo(dateStr) {
    if (!dateStr) return 'Never';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days > 30) return new Date(dateStr).toLocaleDateString();
    if (days > 0)  return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0)  return `${mins}m ago`;
    return 'Just now';
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
}

function downloadText(text, filename, type = 'text/plain') {
    const blob = new Blob([text], { type });
    downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
