
let fs = JSON.parse(localStorage.getItem('lifeos_fs')) || {
    userFiles: [],
    currentView: 'lifeos',
    currentFolderId: null
};

fs.currentView = 'lifeos';
fs.currentFolderId = null;

const appFolders = [
    // format: 'FolderName/filename.html'
    { id: 'money', name: 'MoneyTrack', link: 'MoneyTrack/moneytrack.html' },
    { id: 'study', name: 'StudyTrack', link: 'StudyTrack/studytrack.html' },
    { id: 'time', name: 'TimeBlock', link: 'TimeBlock/timeblock.html' },
    { id: 'stuff', name: 'FindMyStuff', link: 'FindMyStuff/findmystuff.html' },
    { id: 'reset', name: 'RESET', link: 'ReiReset/reset.html' }
];


const grid = document.getElementById('file-grid');
const breadcrumbs = document.getElementById('breadcrumbs');
const photoViewer = document.getElementById('photo-viewer');
const viewerImg = document.getElementById('viewer-img');
const overlay = document.getElementById('overlay');
const actionSheet = document.getElementById('action-sheet');
const iosAlert = document.getElementById('ios-alert');
const alertInput = document.getElementById('alert-input');

let contextTarget = null;


function save() {
    localStorage.setItem('lifeos_fs', JSON.stringify(fs));
    render();
}

function render() {
    grid.innerHTML = '';
    renderBreadcrumbs();


    if (fs.currentView === 'lifeos' && fs.currentFolderId === null) {
        appFolders.forEach(folder => {
            grid.appendChild(createItemEl(folder.name, 'folder', true, folder.link));
        });
    }


    const currentContent = fs.userFiles.filter(item =>
        item.category === fs.currentView && item.parentId === fs.currentFolderId
    );

    currentContent.forEach(item => {
        grid.appendChild(createItemEl(item.name, item.type, false, null, item.id, item.data));
    });
}

function createItemEl(name, type, isApp, link, id, data) {
    const div = document.createElement('div');
    div.className = 'item';

    div.style.cursor = 'pointer';

    const icon = document.createElement('div');
    icon.className = `icon ${type === 'folder' ? 'folder-icon' : 'file-icon'}`;


    if (type.startsWith('image/') && data) {
        icon.style.backgroundImage = `url(${data})`;
        icon.style.backgroundSize = 'cover';
        icon.style.backgroundPosition = 'center';
        icon.style.borderRadius = '14px';
        icon.classList.remove('file-icon');
    }

    const label = document.createElement('div');
    label.className = 'file-label';
    label.innerText = name;

    div.append(icon, label);


    div.onclick = (e) => {

        e.stopPropagation();

        if (isApp) {
            window.location.href = link;
        } else if (type === 'folder') {
            fs.currentFolderId = id;
            render();
        } else if (type.startsWith('image/')) {

            openImageViewer(data);
        }
    };


    div.oncontextmenu = (e) => {
        e.preventDefault();
        if (!isApp) {
            showContext(id, name);
        }
    };

    return div;
}



function renderBreadcrumbs() {
    breadcrumbs.innerHTML = '';


    const rootCrumb = document.createElement('span');
    rootCrumb.className = `crumb ${fs.currentFolderId === null ? 'active' : ''}`;
    rootCrumb.innerText = fs.currentView === 'lifeos' ? 'LifeOS' :
        fs.currentView.charAt(0).toUpperCase() + fs.currentView.slice(1);

    rootCrumb.onclick = () => {
        fs.currentFolderId = null;
        render();
    };
    breadcrumbs.appendChild(rootCrumb);


    if (fs.currentFolderId) {
        const currentFolder = fs.userFiles.find(f => f.id === fs.currentFolderId);
        if (currentFolder) {
            const folderCrumb = document.createElement('span');
            folderCrumb.className = 'crumb active';
            folderCrumb.innerText = currentFolder.name;
            breadcrumbs.appendChild(folderCrumb);
        }
    }
}



function showContext(id, name) {
    contextTarget = { id, name };
    overlay.style.display = 'flex';
    actionSheet.style.display = 'flex';
    iosAlert.style.display = 'none';
}

function showAlert(title, msg, onConfirm) {
    overlay.style.display = 'flex';
    actionSheet.style.display = 'none';
    iosAlert.style.display = 'flex';

    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-msg').innerText = msg;

    const confirmBtn = document.getElementById('alert-confirm');
    confirmBtn.onclick = () => {
        onConfirm(alertInput.value);
        closeOverlay();
    };
    alertInput.focus();
}

function closeOverlay() {
    overlay.style.display = 'none';
    actionSheet.style.display = 'none';
    iosAlert.style.display = 'none';
    alertInput.value = '';
    contextTarget = null;
}



function openImageViewer(src) {
    viewerImg.src = src;
    photoViewer.style.display = 'flex';
}

document.querySelector('.viewer-close').onclick = () => {
    photoViewer.style.display = 'none';
};


document.getElementById('btn-new-folder').onclick = () => {
    showAlert('New Folder', 'Enter a name for this folder.', (name) => {
        if (!name) return;
        fs.userFiles.push({
            id: Date.now(),
            name: name,
            type: 'folder',
            category: fs.currentView,
            parentId: fs.currentFolderId
        });
        save();
    });
};


document.getElementById('file-upload').onchange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            fs.userFiles.push({
                id: Date.now() + Math.random(),
                name: file.name,
                type: file.type,
                data: ev.target.result,
                category: fs.currentView,
                parentId: fs.currentFolderId
            });
            save();
        };
        reader.readAsDataURL(file);
    });
};


document.getElementById('action-delete').onclick = () => {
    if (contextTarget) {

        fs.userFiles = fs.userFiles.filter(f => f.id !== contextTarget.id && f.parentId !== contextTarget.id);
        save();
        closeOverlay();
    }
};


document.getElementById('action-rename').onclick = () => {
    const target = contextTarget;
    closeOverlay();
    setTimeout(() => {
        showAlert('Rename', `Enter new name for "${target.name}"`, (newName) => {
            if (!newName) return;
            const item = fs.userFiles.find(f => f.id === target.id);
            if (item) item.name = newName;
            save();
        });
    }, 300);
};



document.getElementById('sidebar-nav').onclick = (e) => {
    const li = e.target.closest('li');
    if (li) {
        document.querySelectorAll('.sidebar li').forEach(el => el.classList.remove('active'));
        li.classList.add('active');

        fs.currentView = li.dataset.view;
        fs.currentFolderId = null;
        render();
    }
};


document.getElementById('action-cancel').onclick = closeOverlay;
document.getElementById('alert-cancel').onclick = closeOverlay;
overlay.onclick = (e) => { if (e.target === overlay) closeOverlay(); };


render();