let selectedItem = null;

function createParentFolder() {
    const folderName = document.getElementById('parentFolderName').value;
    if (folderName.trim() !== '') {
        const folderItem = createItem('📁', folderName);
        folderItem.classList.add('folder');
        folderItem.addEventListener('click', () => handleItemClick(folderItem));
        const fileList = document.getElementById('fileList');
        fileList.appendChild(folderItem);
        document.getElementById('parentFolderName').value = '';

    }
}


function createChildFile() {
    const fileName = document.getElementById('childFileName').value;
    if (fileName.trim() !== '') {
        const fileItem = createItem('📄', fileName);
        fileItem.classList.add('child');

        fileItem.addEventListener("click", () => {
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            saveButton.addEventListener('click', () => saveContent(fileItem));

            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy';
            copyButton.addEventListener('click', () => copyContent());

            const debugButton = document.createElement('button');
            debugButton.textContent = 'Debug';
            debugButton.addEventListener('click', () => debugContent(fileItem));

            const editorDiv = document.getElementById('action-buttons');
            editorDiv.innerHTML = '';

            editorDiv.appendChild(saveButton);
            editorDiv.appendChild(copyButton);
            editorDiv.appendChild(debugButton);

            fileItem.addEventListener("click", async () => {
                // Load the content of the selected file into the editor
                await loadContent(fileItem);
            });
        });

        selectedItem.appendChild(fileItem);
        document.getElementById('childFileName').value = '';
    }
}


async function loadContent(fileItem) {
    const editor = document.getElementById('editor');
    editor.innerHTML = '';

    if (fileItem.dataset.saved) {

        const content = fileItem.dataset.saved;
        editor.innerText = content;
    } else {

        console.log('No content saved for this file.');
    }
}
async function saveContent(fileItem) {
    const editorContent = document.querySelector('#editor').innerText;

    if (selectedItem && selectedItem.classList.contains('folder')) {
        const fileName = fileItem.querySelector('.name').textContent;

        try {
            const folderName = selectedItem.querySelector('.name').textContent;
            const options = {
                startIn: 'documents',
                suggestedName: fileName
            };

            const handle = await window.showSaveFilePicker(options);

            // Create a writable stream to the file
            const writable = await handle.createWritable();

            // Write the content to the file
            await writable.write(editorContent);
            await writable.close();

            console.log('Content Saved to File:', editorContent);
            console.log('File Saved in:', folderName);
        } catch (error) {
            console.error('Error saving file:', error);
        }
        fileItem.dataset.saved = editorContent;

        console.log('Content Saved to File:', editorContent);

    } else {
        console.error('No parent folder selected');
    }
}


function copyContent() {
    const editorContent = document.querySelector('#editor').innerHTML;

    navigator.clipboard.writeText(editorContent).then(() => {
        console.log('Content Copied to Clipboard:', editorContent);
    });
}

function createItem(icon, name) {
    const item = document.createElement('li');
    item.innerHTML = `<div class="folder">${icon} <span class="name">${name}</span></div>`;
    return item;
}



function handleItemClick(item) {
    if (selectedItem !== null) {
        selectedItem.classList.remove('highlight');
    }

    selectedItem = item;
    item.classList.add('highlight');

    // Check if the clicked item is a folder
    if (item.classList.contains('folder')) {
        // If folder is clicked, highlight all its child items
        const childItems = item.querySelectorAll('.child');
        childItems.forEach(child => {
            child.classList.add('highlight');
        });
    } else {
        // If it's a child item, highlight only itself
        const parentFolder = findParentFolder(item);
        if (parentFolder) {
            parentFolder.classList.add('highlight');
        }
    }
}

function findParentFolder(item) {
    // Traverse up the DOM to find the parent folder of a file
    let currentElement = item.parentElement;
    while (currentElement !== null) {
        if (currentElement.classList.contains('folder')) {
            return currentElement;
        }
        currentElement = currentElement.parentElement;
    }
    return null;
}



// Handle file upload
const uploadInput = document.getElementById('upload-input');
uploadInput.addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            displayPreview(file, content);
        };
        reader.readAsDataURL(file);
    }
}
function displayPreview(file, content) {
    const previewPdf = document.getElementById('preview-pdf');

    if (file.type === 'application/pdf') {
        previewPdf.style.display = 'block';
        previewPdf.src = content;
    } else {
        // Handle text content (assumed to be plain text)
        previewPdf.style.display = 'none'; // Hide PDF preview
        const filePreview = document.getElementById('file-preview');
        filePreview.style.display = 'block';
        filePreview.textContent = content; // Display text content
    }
}



document.getElementById('chat-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('upload-input');

    const formData = new FormData();
    formData.append('message', messageInput.value);
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }

    sendMessage(formData);
});
function debugContent(fileItem) {
    const editorContent = fileItem.dataset.saved || '';

    fetch('/api/debug-content', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editorContent }),
    })
        .then(response => response.json())
        .then(data => {
            const chatMessages = document.getElementById('chat-messages');
            const debugMessage = document.createElement('div');
            debugMessage.textContent = `Debug response: ${data.output}`;
            chatMessages.appendChild(debugMessage);
        })
        .catch(error => {
            console.error('Error during debug:', error);
        });
}
function sendMessage(formData) {
    fetch('/api/send-message', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);

            fetch('/api/get-response')
                .then(response => response.json())
                .then(llmResponse => {
                    displayLLMResponse(llmResponse.output);
                })
                .catch(error => {
                    console.error('Error getting LLM response:', error);
                });
        })
        .catch(error => {
            console.error('Error sending message:', error);
        });
}

function displayLLMResponse(response) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = response;
    chatMessages.appendChild(messageElement);
}




