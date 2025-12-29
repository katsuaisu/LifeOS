
const studyData = {
    "Physics": [
        "KHub Learning Guides",
        "Watch YouTube Video",
        "10 Book Problems",
        "10 AI Problems",
        "10 Conceptual Questions"
    ],
    "Biology": [
        "NotebookLM Mindmap",
        "NotebookLM Flashcards",
        "NotebookLM Quiz",
        "AI Quiz",
        "Physical Flashcards"
    ],
    "Chemistry": [
        "Tutor",
        "Slides",
        "5 Conceptual Questions",
        "25 Drill Questions"
    ],
    "Social Science": [
        "NotebookLM Video",
        "NotebookLM Flashcards",
        "NotebookLM Quiz",
        "Slides"
    ],
    "Statistics": [
        "Slides",
        "20 Conceptual Questions",
        "20 Drill Work Questions",
        "5 Challenging Questions"
    ],
    "Math": [
        "Sir Leo’s Videos",
        "KHub Exercises",
        "10-item Sub-Topic Quiz",
        "10 Conceptual Questions",
        "15 Multiple Choice",
        "10 Short Answer",
        "5 Challenging Questions"
    ],
    "Filipino": [
        "Video Explanation",
        "29-item Quiz",
        "1 Essay Question",
        "Recaps"
    ],
    "English": [
        "Video Explanation",
        "15-item Quiz",
        "Recaps"
    ]
};

let currentState = {
    subject: "Physics",
    tasks: JSON.parse(localStorage.getItem('studyTasks') || '{}'),
    timer: {
        startTime: null,
        elapsedSeconds: 0,
        intervalId: null,
        isRunning: false,
        pauseReasons: []
    }
};


const elements = {
    subjectGrid: document.getElementById('subjectGrid'),
    taskList: document.getElementById('taskList'),
    timerDisplay: document.getElementById('timerDisplay'),
    btnStart: document.getElementById('btnStart'),
    btnPause: document.getElementById('btnPause'),
    btnEnd: document.getElementById('btnEnd'),
    historyList: document.getElementById('historyList'),
    modal: document.getElementById('pauseModal'),
    pauseInput: document.getElementById('pauseInput'),
    btnConfirmPause: document.getElementById('btnConfirmPause'),
    btnClearHistory: document.getElementById('btnClearHistory'),
    currentDate: document.getElementById('currentDate')
};


function triggerHaptic(pattern = 10) {

    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}


function init() {

    const today = new Date();
    elements.currentDate.innerText = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    loadHistory();
    renderSubjects();
    switchSubject("Physics");


    elements.btnStart.addEventListener('click', startTimer);
    elements.btnPause.addEventListener('click', openPauseModal);
    elements.btnEnd.addEventListener('click', endSession);

    elements.pauseInput.addEventListener('input', (e) => {
        elements.btnConfirmPause.disabled = e.target.value.trim() === "";
    });

    elements.btnConfirmPause.addEventListener('click', confirmPause);

    elements.btnClearHistory.addEventListener('click', () => {
        triggerHaptic(20);
        if (confirm("Clear entire study history?")) {
            localStorage.removeItem('studyHistory');
            loadHistory();
            triggerHaptic([30, 50, 30]);
        }
    });
}


function renderSubjects() {
    const subjects = Object.keys(studyData);
    elements.subjectGrid.innerHTML = '';

    subjects.forEach(subject => {
        const btn = document.createElement('button');
        btn.className = 'subject-pill';
        btn.innerText = subject;
        btn.onclick = () => {
            switchSubject(subject);
            triggerHaptic(10);
        };
        elements.subjectGrid.appendChild(btn);
    });
}

function switchSubject(subject) {
    currentState.subject = subject;


    Array.from(elements.subjectGrid.children).forEach(btn => {
        if (btn.innerText === subject) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderTasks();
}


function renderTasks() {
    const tasks = studyData[currentState.subject];
    elements.taskList.innerHTML = '';


    if (!currentState.tasks[currentState.subject]) {
        currentState.tasks[currentState.subject] = new Array(tasks.length).fill(false);
    }

    tasks.forEach((task, index) => {
        const isChecked = currentState.tasks[currentState.subject][index];

        const item = document.createElement('div');
        item.className = `task-item ${isChecked ? 'checked' : ''}`;

        const checkbox = document.createElement('div');
        checkbox.className = 'checkbox';

        const text = document.createElement('div');
        text.className = 'task-text';
        text.innerText = task;

        item.appendChild(checkbox);
        item.appendChild(text);

        item.onclick = () => {
            toggleTask(index, item);
            triggerHaptic(15);
        };

        elements.taskList.appendChild(item);
    });
}

function toggleTask(index, domElement) {
    const currentSubjectState = currentState.tasks[currentState.subject];
    const newState = !currentSubjectState[index];
    currentSubjectState[index] = newState;


    localStorage.setItem('studyTasks', JSON.stringify(currentState.tasks));

    if (newState) {
        domElement.classList.add('checked');
    } else {
        domElement.classList.remove('checked');
    }
}


function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function startTimer() {
    if (currentState.timer.isRunning) return;

    triggerHaptic(20);

    currentState.timer.isRunning = true;
    updateControls();

    currentState.timer.intervalId = setInterval(() => {
        currentState.timer.elapsedSeconds++;
        elements.timerDisplay.innerText = formatTime(currentState.timer.elapsedSeconds);
        document.title = `${formatTime(currentState.timer.elapsedSeconds)} - Study`;
    }, 1000);
}

function openPauseModal() {
    triggerHaptic(20);
    elements.modal.showModal();
    elements.pauseInput.focus();
}

function confirmPause() {
    const reason = elements.pauseInput.value.trim();
    if (!reason) return;

    triggerHaptic([30, 50, 30]);

    clearInterval(currentState.timer.intervalId);
    currentState.timer.isRunning = false;
    currentState.timer.pauseReasons.push(reason);

    elements.pauseInput.value = '';
    elements.btnConfirmPause.disabled = true;
    elements.modal.close();

    document.title = "Paused - Study";
    updateControls();
}

function endSession() {
    triggerHaptic([50, 50, 50]);

    clearInterval(currentState.timer.intervalId);


    const sessionLog = {
        id: Date.now(),
        subject: currentState.subject,
        date: new Date().toISOString(),
        duration: currentState.timer.elapsedSeconds,
        pauses: currentState.timer.pauseReasons
    };

    saveToHistory(sessionLog);


    currentState.timer.elapsedSeconds = 0;
    currentState.timer.isRunning = false;
    currentState.timer.pauseReasons = [];

    elements.timerDisplay.innerText = "00:00:00";
    document.title = "Study Log";
    updateControls();
}

function updateControls() {
    const { isRunning, elapsedSeconds } = currentState.timer;

    if (isRunning) {
        elements.btnStart.disabled = true;
        elements.btnStart.innerText = "Running";
        elements.btnPause.disabled = false;
        elements.btnEnd.disabled = false;
    } else {
        elements.btnStart.disabled = false;
        elements.btnStart.innerText = elapsedSeconds > 0 ? "Resume" : "Start";
        elements.btnPause.disabled = true;
        elements.btnEnd.disabled = elapsedSeconds === 0;
    }
}


function saveToHistory(log) {
    const history = JSON.parse(localStorage.getItem('studyHistory') || '[]');
    history.unshift(log);
    localStorage.setItem('studyHistory', JSON.stringify(history));
    renderHistory();
}

function deleteSession(id) {
    triggerHaptic(25);
    let history = JSON.parse(localStorage.getItem('studyHistory') || '[]');
    history = history.filter(log => log.id !== id);
    localStorage.setItem('studyHistory', JSON.stringify(history));
    renderHistory();
}

function loadHistory() {
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('studyHistory') || '[]');
    elements.historyList.innerHTML = '';

    if (history.length === 0) {
        elements.historyList.innerHTML = '<div class="empty-state">No sessions recorded yet.</div>';
        return;
    }


    const groups = {};
    history.forEach(log => {
        const dateKey = new Date(log.date).toLocaleDateString(undefined, {
            weekday: 'long', month: 'long', day: 'numeric'
        });
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(log);
    });

    for (const [date, logs] of Object.entries(groups)) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'history-group';

        const header = document.createElement('div');
        header.className = 'history-date';
        header.innerText = date;
        groupDiv.appendChild(header);

        const card = document.createElement('div');
        card.className = 'ios-card';

        logs.forEach(log => {
            const entry = document.createElement('div');
            entry.className = 'history-entry';

            const pauseText = log.pauses.length > 0
                ? `Paused: ${log.pauses.join(', ')}`
                : 'No pauses';


            const trashIcon = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>`;

            entry.innerHTML = `
                <div class="h-left">
                    <span class="h-subject">${log.subject}</span>
                    <span class="h-reason">${pauseText}</span>
                </div>
                <div class="h-right">
                    <span class="h-duration">${formatTime(log.duration)}</span>
                    <button class="btn-delete" onclick="deleteSession(${log.id})">
                        ${trashIcon}
                    </button>
                </div>
            `;
            card.appendChild(entry);
        });

        groupDiv.appendChild(card);
        elements.historyList.appendChild(groupDiv);
    }
}


init();