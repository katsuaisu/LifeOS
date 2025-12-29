/**
 * VAULT - Clean Version
 */

const STORAGE_KEY_DATA = 'vault_data_v2';
const STORAGE_KEY_LOCK = 'vault_lock_v2';

// State
const app = {
    locked: true,
    items: [],
    filter: 'all',
    search: '',
    editId: null,
    activeType: 'note'
};

// Elements
const el = {
    lock: document.getElementById('lock-screen'),
    main: document.getElementById('app-interface'),
    passInput: document.getElementById('passcode-input'),
    unlockBtn: document.getElementById('unlock-btn'),
    lockMsg: document.getElementById('lock-message'),

    grid: document.getElementById('grid-container'),
    empty: document.getElementById('empty-state'),
    search: document.getElementById('search-input'),

    modal: document.getElementById('editor-modal'),
    addBtn: document.getElementById('add-btn'),
    saveBtn: document.getElementById('save-item-btn'),
    cancelBtn: document.getElementById('cancel-edit-btn'),
    delBtn: document.getElementById('delete-btn'),

    forms: {
        note: document.getElementById('form-note'),
        account: document.getElementById('form-account'),
        list: document.getElementById('form-list')
    },
    inputs: {
        title: document.getElementById('entry-title'),
        content: document.getElementById('entry-content'),
        user: document.getElementById('acc-username'),
        pass: document.getElementById('acc-password'),
        notes: document.getElementById('acc-notes'),
        list: document.getElementById('list-raw')
    }
};

// --- SECURITY ---
async function hash(str) {
    const data = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- INIT ---
function init() {
    const storedHash = localStorage.getItem(STORAGE_KEY_LOCK);
    if (!storedHash) {
        el.unlockBtn.innerText = "Set New Passcode";
        el.unlockBtn.onclick = handleSetup;
    } else {
        el.unlockBtn.onclick = handleUnlock;
    }

    const data = localStorage.getItem(STORAGE_KEY_DATA);
    if (data) app.items = JSON.parse(data);

    // Setup Filters
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            app.filter = btn.dataset.filter;
            render();
        };
    });

    // Setup Type Switcher
    document.querySelectorAll('.segment').forEach(btn => {
        btn.onclick = () => switchType(btn.dataset.type);
    });
}

// --- LOCK LOGIC ---
async function handleSetup() {
    const code = el.passInput.value;
    if (code.length < 4) {
        el.lockMsg.innerText = "Too short (min 4 chars)";
        return;
    }
    localStorage.setItem(STORAGE_KEY_LOCK, await hash(code));
    unlock();
}

async function handleUnlock() {
    const code = el.passInput.value;
    const realHash = localStorage.getItem(STORAGE_KEY_LOCK);
    if (await hash(code) === realHash) unlock();
    else {
        el.lockMsg.innerText = "Incorrect passcode";
        el.passInput.value = '';
    }
}

function unlock() {
    app.locked = false;
    el.lock.classList.add('hidden');
    el.main.classList.remove('hidden');
    render();
}

document.getElementById('lock-app-btn').onclick = () => {
    app.locked = true;
    el.main.classList.add('hidden');
    el.lock.classList.remove('hidden');
    el.passInput.value = '';
    el.lockMsg.innerText = '';
};

// --- DATA LOGIC ---
function save() {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(app.items));
    render();
}

function render() {
    el.grid.innerHTML = '';
    const term = app.search.toLowerCase();

    const visible = app.items.filter(i => {
        const typeMatch = app.filter === 'all' || i.type === app.filter;
        const textMatch = (i.title || '').toLowerCase().includes(term);
        return typeMatch && textMatch;
    });

    if (visible.length === 0) el.empty.classList.remove('hidden');
    else el.empty.classList.add('hidden');

    visible.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = () => openModal(item);

        let sub = '';
        if (item.type === 'note') sub = item.content;
        else if (item.type === 'account') sub = item.username;
        else if (item.type === 'list') {
            const lines = (item.content || '').split('\n');
            sub = lines.slice(0, 3).map(l => `• ${l.replace(/^-/, '').trim()}`).join('\n');
        }

        div.innerHTML = `
            <div class="card-top">
                <span class="card-type" style="color:${getColor(item.type)}">${item.type}</span>
            </div>
            <div class="card-title">${item.title || 'Untitled'}</div>
            <div class="card-preview">${escapeHtml(sub)}</div>
        `;
        el.grid.appendChild(div);
    });
}

function getColor(type) {
    if (type === 'note') return '#FF9500'; // Orange
    if (type === 'account') return '#34C759'; // Green
    if (type === 'list') return '#5856D6'; // Purple
    return '#8E8E93';
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
}

// --- MODAL LOGIC ---
function resetModal() {
    el.inputs.title.value = '';
    el.inputs.content.value = '';
    el.inputs.user.value = '';
    el.inputs.pass.value = '';
    el.inputs.notes.value = '';
    el.inputs.list.value = '';
    el.inputs.pass.type = 'password';
    switchType('note');
}

function switchType(type) {
    app.activeType = type;
    document.querySelectorAll('.segment').forEach(b => {
        if (b.dataset.type === type) b.classList.add('active');
        else b.classList.remove('active');
    });
    Object.keys(el.forms).forEach(k => {
        if (k === type) el.forms[k].classList.remove('hidden');
        else el.forms[k].classList.add('hidden');
    });
}

function openModal(item = null) {
    resetModal();
    if (item) {
        app.editId = item.id;
        el.delBtn.classList.remove('hidden');
        switchType(item.type);
        el.inputs.title.value = item.title;
        if (item.type === 'note') el.inputs.content.value = item.content;
        if (item.type === 'account') {
            el.inputs.user.value = item.username;
            el.inputs.pass.value = item.password;
            el.inputs.notes.value = item.notes;
        }
        if (item.type === 'list') el.inputs.list.value = item.content;
    } else {
        app.editId = null;
        el.delBtn.classList.add('hidden');
    }
    el.modal.classList.remove('hidden');
}

function saveEntry() {
    const title = el.inputs.title.value.trim();
    let data = { title, type: app.activeType };

    if (app.activeType === 'note') data.content = el.inputs.content.value;
    else if (app.activeType === 'account') {
        data.username = el.inputs.user.value;
        data.password = el.inputs.pass.value;
        data.notes = el.inputs.notes.value;
    }
    else if (app.activeType === 'list') data.content = el.inputs.list.value;

    if (app.editId) {
        const idx = app.items.findIndex(i => i.id === app.editId);
        if (idx > -1) app.items[idx] = { ...app.items[idx], ...data };
    } else {
        app.items.unshift({ id: Date.now().toString(), ...data });
    }

    save();
    el.modal.classList.add('hidden');
}

// Listeners
el.addBtn.onclick = () => openModal();
el.cancelBtn.onclick = () => el.modal.classList.add('hidden');
el.saveBtn.onclick = saveEntry;
el.delBtn.onclick = () => {
    if (confirm("Delete this item?")) {
        app.items = app.items.filter(i => i.id !== app.editId);
        save();
        el.modal.classList.add('hidden');
    }
};
el.search.addEventListener('input', e => { app.search = e.target.value; render(); });
document.getElementById('toggle-pass').onclick = () => {
    el.inputs.pass.type = el.inputs.pass.type === 'password' ? 'text' : 'password';
};

init();