document.addEventListener('DOMContentLoaded', () => {
    const CONFIG = {
        startHour: 7,
        endHour: 24,
        hourHeight: 60,
        colors: {
            red: '#fde7e9',
            orange: '#fff1e0',
            yellow: '#fef9e3',
            green: '#eaf6ed',
            blue: '#e8f4fe',
            purple: '#f3f0fd',
            gray: '#f2f2f7'
        }
    };

    let state = {
        currentDate: new Date(),
        view: 'week',
        events: [],
        tasks: [],
        editingEventId: null,
        showSchool: true
    };

    const STRONTIUM_SCHEDULE = [
        { day: 1, t: "Flag Ceremony", loc: "", s: "07:10", e: "07:20", c: CONFIG.colors.red },
        { day: 1, t: "English 3", loc: "SHB 311", s: "07:30", e: "08:15", c: CONFIG.colors.blue },
        { day: 1, t: "Social Science 3", loc: "SHB 311", s: "08:15", e: "09:00", c: CONFIG.colors.yellow },
        { day: 1, t: "Physics 1", loc: "SHB 101", s: "09:10", e: "10:40", c: CONFIG.colors.green },
        { day: 1, t: "Study Period", loc: "SHB 311", s: "10:40", e: "11:25", c: CONFIG.colors.purple },
        { day: 1, t: "Mathematics 3", loc: "SHB 311", s: "11:25", e: "12:10", c: CONFIG.colors.orange },
        { day: 1, t: "Lunch", loc: "SHB 311", s: "12:10", e: "13:05", c: CONFIG.colors.gray },
        { day: 1, t: "Chemistry 1", loc: "SHB 105", s: "13:05", e: "14:35", c: CONFIG.colors.green },
        { day: 1, t: "Comp Sci 3", loc: "ASTB Edge", s: "14:45", e: "16:15", c: CONFIG.colors.blue },
        { day: 2, t: "Statistics", loc: "SHB 404", s: "07:30", e: "09:00", c: CONFIG.colors.orange },
        { day: 2, t: "Biology 1", loc: "SHB 111", s: "09:10", e: "09:55", c: CONFIG.colors.green },
        { day: 2, t: "Study Period", loc: "SHB 311", s: "09:55", e: "10:40", c: CONFIG.colors.purple },
        { day: 2, t: "Filipino 3", loc: "SHB 311", s: "10:40", e: "12:10", c: CONFIG.colors.yellow },
        { day: 2, t: "Lunch", loc: "SHB 311", s: "12:10", e: "13:05", c: CONFIG.colors.gray },
        { day: 2, t: "Values Ed 3", loc: "SHB 311", s: "13:05", e: "13:50", c: CONFIG.colors.red },
        { day: 2, t: "Health 3", loc: "SHB 311", s: "13:50", e: "14:35", c: CONFIG.colors.red },
        { day: 2, t: "Study Period", loc: "SHB 311", s: "14:45", e: "15:30", c: CONFIG.colors.purple },
        { day: 2, t: "Music 3", loc: "Gymnasium", s: "15:30", e: "16:15", c: CONFIG.colors.red },
        { day: 3, t: "Club A", loc: "", s: "07:30", e: "09:00", c: CONFIG.colors.blue },
        { day: 3, t: "Club B", loc: "", s: "09:10", e: "10:40", c: CONFIG.colors.blue },
        { day: 3, t: "Homeroom", loc: "SHB 311", s: "10:40", e: "12:10", c: CONFIG.colors.yellow },
        { day: 4, t: "English 3", loc: "SHB 311", s: "07:30", e: "09:00", c: CONFIG.colors.blue },
        { day: 4, t: "Study Period", loc: "SHB 311", s: "09:10", e: "09:55", c: CONFIG.colors.purple },
        { day: 4, t: "Physics 1", loc: "SHB 101", s: "09:55", e: "10:40", c: CONFIG.colors.green },
        { day: 4, t: "Social Science 3", loc: "SHB 311", s: "10:40", e: "12:10", c: CONFIG.colors.yellow },
        { day: 4, t: "Lunch", loc: "SHB 311", s: "12:10", e: "13:05", c: CONFIG.colors.gray },
        { day: 4, t: "Mathematics 3", loc: "SHB 311", s: "13:05", e: "14:35", c: CONFIG.colors.orange },
        { day: 4, t: "Chemistry 1", loc: "SHB 311", s: "14:45", e: "15:30", c: CONFIG.colors.green },
        { day: 4, t: "Comp Sci 3", loc: "ASTB Edge", s: "15:30", e: "16:15", c: CONFIG.colors.blue },
        { day: 5, t: "Statistics", loc: "SHB 404", s: "07:30", e: "08:15", c: CONFIG.colors.orange },
        { day: 5, t: "Study Period", loc: "SHB 311", s: "08:15", e: "09:00", c: CONFIG.colors.purple },
        { day: 5, t: "Biology 1", loc: "SHB 111", s: "09:10", e: "10:40", c: CONFIG.colors.green },
        { day: 5, t: "Study Period", loc: "SHB 311", s: "10:40", e: "11:25", c: CONFIG.colors.purple },
        { day: 5, t: "Filipino 3", loc: "SHB 311", s: "11:25", e: "12:10", c: CONFIG.colors.yellow },
        { day: 5, t: "Lunch", loc: "SHB 311", s: "12:10", e: "13:05", c: CONFIG.colors.gray },
        { day: 5, t: "Values Ed 3", loc: "SHB 311", s: "13:05", e: "13:50", c: CONFIG.colors.red },
        { day: 5, t: "Study Period", loc: "SHB 311", s: "13:50", e: "14:35", c: CONFIG.colors.purple },
        { day: 5, t: "PE 3", loc: "Gymnasium", s: "14:45", e: "16:15", c: CONFIG.colors.green }
    ];

    function init() {
        renderTimeGutter();
        loadData();
        setupInteractions();
        updateDateHeader();
    }

    function loadData() {
        const stored = localStorage.getItem('9strontium_events');
        if (stored) {
            state.events = JSON.parse(stored);
            state.events.forEach(ev => {
                if (ev.isSchool === undefined) {
                    const isDefault = STRONTIUM_SCHEDULE.some(def => def.t === ev.title);
                    if (isDefault) ev.isSchool = true;
                }
            });
        } else {
            resetToDefaults();
        }

        const tasks = localStorage.getItem('9strontium_tasks');
        state.tasks = tasks ? JSON.parse(tasks) : [];

        const showSchoolPref = localStorage.getItem('9strontium_show_school');
        if (showSchoolPref !== null) {
            state.showSchool = showSchoolPref === 'true';
            updateToggleButton();
        }

        renderCalendar();
        renderTasks();
    }

    function resetToDefaults() {
        state.events = [];
        const today = new Date();
        const monday = getMonday(today);

        STRONTIUM_SCHEDULE.forEach(item => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + (item.day - 1));

            state.events.push({
                id: Date.now() + Math.random(),
                title: item.t,
                location: item.loc,
                start: item.s,
                end: item.e,
                color: item.c,
                date: date.toISOString().split('T')[0],
                repeat: true,
                isSchool: true
            });
        });
        saveEvents();
        renderCalendar();
    }

    function saveEvents() {
        localStorage.setItem('9strontium_events', JSON.stringify(state.events));
    }

    function saveTasks() {
        localStorage.setItem('9strontium_tasks', JSON.stringify(state.tasks));
    }

    function renderTimeGutter() {
        const gutter = document.querySelector('.time-gutter');
        let html = '';
        for (let i = CONFIG.startHour; i < CONFIG.endHour; i++) {
            const label = i > 12 ? (i - 12) + ' PM' : i === 12 ? '12 PM' : i + ' AM';
            html += `<div class="time-label">${label}</div>`;
        }
        gutter.innerHTML = html;
    }

    function renderCalendar() {
        const grid = document.getElementById('grid-canvas');
        grid.innerHTML = '';

        if (state.view === 'day') grid.classList.add('day-view');
        else grid.classList.remove('day-view');

        const monday = getMonday(state.currentDate);

        for (let i = 0; i < 7; i++) {
            const curr = new Date(monday);
            curr.setDate(monday.getDate() + i);
            const dateKey = curr.toISOString().split('T')[0];
            const isToday = new Date().toDateString() === curr.toDateString();
            const dayOfWeek = curr.getDay();

            const col = document.createElement('div');
            col.className = 'day-column';
            if (dateKey === state.currentDate.toISOString().split('T')[0]) {
                col.classList.add('active-day');
            }

            col.setAttribute('data-date', dateKey);

            const header = document.createElement('div');
            header.className = `day-header ${isToday ? 'today' : ''}`;

            if (state.view === 'week') {
                header.style.left = `${i * (100 / 7)}%`;
                header.style.width = `${100 / 7}%`;
            } else {
                if (col.classList.contains('active-day')) {
                    header.style.left = '50%';
                    header.style.transform = 'translateX(-50%)';
                    header.style.width = '100%';
                    header.style.maxWidth = '600px';
                } else {
                    header.style.display = 'none';
                }
            }

            header.innerHTML = `
                <span>${curr.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <div class="day-number">${curr.getDate()}</div>
            `;
            grid.appendChild(header);

            const dayEvents = state.events.filter(e => {
                if (e.isSchool && !state.showSchool) return false;
                const eventDate = new Date(e.date);
                if (e.date === dateKey) return true;
                if (e.repeat && eventDate.getDay() === dayOfWeek) return true;
                return false;
            });

            dayEvents.forEach(ev => {
                const startMin = timeToMin(ev.start);
                const endMin = timeToMin(ev.end);
                const top = ((startMin - (CONFIG.startHour * 60)) / 60) * CONFIG.hourHeight;
                const height = ((endMin - startMin) / 60) * CONFIG.hourHeight;

                const chip = document.createElement('div');
                chip.className = 'event-chip';
                chip.style.top = `${top}px`;
                chip.style.height = `${height}px`;
                chip.style.backgroundColor = ev.color;

                const repeatIcon = ev.repeat ? ' ↻' : '';
                chip.innerHTML = `<strong>${ev.title}${repeatIcon}</strong><span>${ev.location} ${ev.start}-${ev.end}</span>`;
                chip.onclick = (e) => { e.stopPropagation(); openEditSheet(ev); };

                col.appendChild(chip);
            });

            grid.appendChild(col);
        }
    }

    function renderTasks() {
        const list = document.getElementById('task-list');
        list.innerHTML = '';
        state.tasks.forEach(t => {
            const div = document.createElement('div');
            div.className = 'task-item';
            div.innerHTML = `
                <div class="task-check" onclick="finishTask('${t.id}')"></div>
                <div>${t.text}</div>
                <button class="schedule-task-btn" onclick="scheduleTaskPrompt('${t.id}')">+</button>
            `;
            list.appendChild(div);
        });
    }

    function setupInteractions() {
        document.getElementById('next-period').onclick = () => changeDate(7);
        document.getElementById('prev-period').onclick = () => changeDate(-7);
        document.getElementById('today-btn').onclick = () => { state.currentDate = new Date(); renderCalendar(); updateDateHeader(); };

        document.getElementById('reset-defaults').onclick = () => {
            if (confirm('Reset schedule to default 9 Strontium classes?')) resetToDefaults();
        };

        const toggleBtn = document.getElementById('toggle-school');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                state.showSchool = !state.showSchool;
                localStorage.setItem('9strontium_show_school', state.showSchool);
                updateToggleButton();
                renderCalendar();
            };
        }

        document.querySelectorAll('.segment-opt').forEach(btn => {
            btn.onclick = (e) => {
                document.querySelectorAll('.segment-opt').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                state.view = e.target.dataset.view;
                const pill = document.querySelector('.segment-pill');
                pill.style.width = e.target.offsetWidth + 'px';
                pill.style.transform = `translateX(${e.target.offsetLeft}px)`;
                renderCalendar();
            };
        });

        setTimeout(() => document.querySelector('.segment-opt.active').click(), 50);
        document.getElementById('toggle-tasks').onclick = () => document.getElementById('task-sidebar').classList.toggle('collapsed');
        document.getElementById('close-tasks').onclick = () => document.getElementById('task-sidebar').classList.add('collapsed');

        document.getElementById('add-task-btn').onclick = () => {
            const input = document.getElementById('new-task-input');
            if (input.value) {
                state.tasks.push({ id: Date.now().toString(), text: input.value });
                input.value = '';
                saveTasks();
                renderTasks();
            }
        };

        document.getElementById('close-sheet').onclick = () => document.getElementById('event-sheet-backdrop').classList.add('hidden');
        document.getElementById('save-event').onclick = saveEditedEvent;
        document.getElementById('delete-event').onclick = deleteEvent;
    }

    window.scheduleTaskPrompt = (id) => {
        const task = state.tasks.find(t => t.id === id);
        if (!task) return;

        const newEv = {
            id: Date.now(),
            title: task.text,
            location: '',
            start: "16:30",
            end: "17:30",
            color: CONFIG.colors.blue,
            date: state.currentDate.toISOString().split('T')[0],
            repeat: false,
            isSchool: false
        };

        state.events.push(newEv);
        state.tasks = state.tasks.filter(t => t.id !== id);
        saveEvents();
        saveTasks();
        renderCalendar();
        renderTasks();
        openEditSheet(newEv);
    };

    function updateToggleButton() {
        const btn = document.getElementById('toggle-school');
        if (state.showSchool) btn.classList.remove('dimmed');
        else btn.classList.add('dimmed');
    }

    function changeDate(days) {
        state.currentDate.setDate(state.currentDate.getDate() + days);
        renderCalendar();
        updateDateHeader();
    }

    function updateDateHeader() {
        document.getElementById('month-display').innerText = state.currentDate.toLocaleString('default', { month: 'long' });
        document.getElementById('year-display').innerText = state.currentDate.getFullYear();
    }

    function openEditSheet(ev) {
        state.editingEventId = ev.id;
        const sheet = document.getElementById('event-sheet-backdrop');
        document.getElementById('event-title').value = ev.title;
        document.getElementById('event-location').value = ev.location || '';
        document.getElementById('event-start').value = ev.start;
        document.getElementById('event-end').value = ev.end;
        document.getElementById('event-repeat').checked = ev.repeat || false;

        const dateInput = document.getElementById('event-date');
        if (dateInput) dateInput.value = ev.date;

        const picker = document.getElementById('color-picker');
        picker.innerHTML = '';
        Object.values(CONFIG.colors).forEach(c => {
            const dot = document.createElement('div');
            dot.className = `color-dot ${c === ev.color ? 'selected' : ''}`;
            dot.style.backgroundColor = c;
            dot.onclick = () => {
                document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
                dot.classList.add('selected');
            };
            picker.appendChild(dot);
        });

        sheet.classList.remove('hidden');
    }

    function saveEditedEvent() {
        const title = document.getElementById('event-title').value;
        const loc = document.getElementById('event-location').value;
        const s = document.getElementById('event-start').value;
        const e = document.getElementById('event-end').value;
        const repeat = document.getElementById('event-repeat').checked;
        const date = document.getElementById('event-date').value;
        const selectedDot = document.querySelector('.color-dot.selected');
        const color = selectedDot ? selectedDot.style.backgroundColor : CONFIG.colors.blue;

        const idx = state.events.findIndex(x => x.id === state.editingEventId);
        if (idx !== -1) {
            const isSchool = state.events[idx].isSchool || false;
            state.events[idx] = { ...state.events[idx], title, location: loc, start: s, end: e, color, repeat, isSchool, date };
            saveEvents();
            renderCalendar();
            document.getElementById('event-sheet-backdrop').classList.add('hidden');
        }
    }

    function deleteEvent() {
        state.events = state.events.filter(x => x.id !== state.editingEventId);
        saveEvents();
        renderCalendar();
        document.getElementById('event-sheet-backdrop').classList.add('hidden');
    }

    window.finishTask = (id) => {
        state.tasks = state.tasks.filter(t => t.id != id);
        saveTasks();
        renderTasks();
    };

    function getMonday(d) {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day == 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }
    function timeToMin(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }

    init();
});