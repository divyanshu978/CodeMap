// frontend.js
document.addEventListener('DOMContentLoaded', () => {
    const directoryInput = document.getElementById('directory-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const githubLinkInput = document.getElementById('github-link');
    const analyzeLinkBtn = document.getElementById('analyze-link-btn');
    const statusEl = document.getElementById('status');

    // --- Handler for Folder Upload with Progress ---
    uploadBtn.addEventListener('click', () => {
        const files = directoryInput.files;
        if (files.length === 0) {
            statusEl.textContent = 'Please select a directory first.';
            return;
        }

        statusEl.textContent = `Preparing ${files.length} files...`;

        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file, file.webkitRelativePath);
        }

        // Use XMLHttpRequest to get upload progress events
        const xhr = new XMLHttpRequest();

        // Update status text as the upload progresses
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                statusEl.textContent = `Uploading... ${Math.round(percentComplete)}%`;
            }
        });

        // Handle completion of the upload
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const result = JSON.parse(xhr.responseText);
                statusEl.textContent = 'Upload complete! Analysis starting on the server.';
                console.log('Server Response:', result);
            } else {
                statusEl.textContent = `Upload failed. Server responded with status: ${xhr.status}`;
            }
        };

        // Handle network errors
        xhr.onerror = () => {
            statusEl.textContent = 'An error occurred during the upload. Check the console and server logs.';
        };

        xhr.open('POST', '/analyze-upload', true);
        xhr.send(formData);
    });

    // --- Handler for GitHub Link (uses fetch, as progress is not applicable) ---
    analyzeLinkBtn.addEventListener('click', async () => {
        const repoUrl = githubLinkInput.value;
        if (!repoUrl) {
            statusEl.textContent = 'Please enter a GitHub repository URL.';
            return;
        }

        statusEl.textContent = `Sending repository link for analysis...`;

        try {
            const response = await fetch('/analyze-github', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: repoUrl }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const result = await response.json();
            statusEl.textContent = 'Link received! Analysis starting on the server.';
            console.log('Server Response:', result);
        } catch (error) {
            statusEl.textContent = 'Error analyzing link.';
            console.error('Link Analysis Error:', error);
        }
    });
});
