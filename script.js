document.addEventListener('DOMContentLoaded', () => {
    const surveyContainer = document.getElementById('survey-container');
    const jsonOutput = document.getElementById('json-output');
    const toolbarButtons = document.querySelectorAll('#toolbar button');
    const modeToggle = document.getElementById('mode-toggle');
    const app = document.getElementById('app');

    // Initialize dark mode
    const darkMode = localStorage.getItem('darkMode') === 'enabled';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        app.classList.add('dark-mode');
        modeToggle.checked = true;
    }

    // Toggle dark mode
    modeToggle.addEventListener('change', () => {
        if (modeToggle.checked) {
            document.body.classList.add('dark-mode');
            app.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            app.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }

        updateDarkMode();
    });

    toolbarButtons.forEach(button => {
        button.addEventListener('dragstart', handleDragStart);
    });

    surveyContainer.addEventListener('dragover', handleDragOver);
    surveyContainer.addEventListener('drop', handleDrop);

    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
        e.dataTransfer.effectAllowed = 'copy';
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    function handleDrop(e) {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        if (type) {
            addElement(type, e.clientY);
        }
    }

    function addElement(type, clientY) {
        const newItem = document.createElement('div');
        newItem.classList.add('survey-item');
        if (document.body.classList.contains('dark-mode')) {
            newItem.classList.add('dark-mode');
        }
        newItem.dataset.type = type;

        if (type === 'checkbox') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.disabled = true;
            const label = document.createElement('input');
            label.type = 'text';
            label.placeholder = 'Checkbox label';
            newItem.appendChild(checkbox);
            newItem.appendChild(label);
        } else if (type === 'comment') {
            const comment = document.createElement('input');
            comment.type = 'text';
            comment.placeholder = 'Comment';
            newItem.appendChild(comment);
        }

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '&#x1F5D1;';
        deleteButton.addEventListener('click', () => {
            newItem.remove();
            updateJson();
        });
        newItem.appendChild(deleteButton);

        newItem.draggable = true;
        newItem.addEventListener('dragstart', handleDragStartItem);
        newItem.addEventListener('dragend', handleDragEndItem);

        const afterElement = getDragAfterElement(surveyContainer, clientY);
        if (afterElement == null) {
            surveyContainer.appendChild(newItem);
        } else {
            surveyContainer.insertBefore(newItem, afterElement);
        }

        updateJson();
    }

    function handleDragStartItem(e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
        e.currentTarget.classList.add('dragging');
    }

    function handleDragEndItem(e) {
        e.currentTarget.classList.remove('dragging');
        updateJson();
    }

    surveyContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(surveyContainer, e.clientY);
        if (draggingElement) {
            if (afterElement == null) {
                surveyContainer.appendChild(draggingElement);
            } else {
                surveyContainer.insertBefore(draggingElement, afterElement);
            }
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.survey-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function updateJson() {
        const surveyItems = document.querySelectorAll('.survey-item');
        const json = [];

        surveyItems.forEach(item => {
            if (item.dataset.type === 'checkbox') {
                json.push({
                    type: 'checkbox',
                    label: item.querySelector('input[type="text"]').value
                });
            } else if (item.dataset.type === 'comment') {
                json.push({
                    type: 'comment',
                    placeholder: item.querySelector('input[type="text"]').value
                });
            }
        });

        jsonOutput.value = JSON.stringify(json, null, 2);
    }

    function updateDarkMode() {
        document.querySelectorAll('.survey-item').forEach(item => {
            if (document.body.classList.contains('dark-mode')) {
                item.classList.add('dark-mode');
            } else {
                item.classList.remove('dark-mode');
            }
        });

        document.querySelectorAll('button').forEach(button => {
            if (document.body.classList.contains('dark-mode')) {
                button.classList.add('dark-mode');
            } else {
                button.classList.remove('dark-mode');
            }
        });
    }
});