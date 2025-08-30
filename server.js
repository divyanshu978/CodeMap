// server.js - CORRECTED GITHUB CLONING

const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { spawn } = require('child_process');
const simpleGit = require('simple-git'); // Import the simple-git library

const app = express();
const port = 3000;

// --- Setup Temporary Directories ---
const uploadDir = path.join(__dirname, 'temp-uploads');
const cloneDir = path.join(__dirname, 'temp-clones');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(cloneDir)) fs.mkdirSync(cloneDir);


// --- Configure Multer for Disk Storage ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(uploadDir, path.dirname(file.originalname));
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, path.basename(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- Routes ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/analyze-upload', upload.array('files'), (req, res) => {
    console.log('Files successfully saved. Spawning parser process in the background...');
    const parserProcess = spawn('node', ['main.js', uploadDir]);

    parserProcess.stdout.on('data', (data) => console.log(`[Parser] ${data}`));
    parserProcess.stderr.on('data', (data) => console.error(`[Parser ERROR] ${data}`));
    parserProcess.on('close', (code) => console.log(`Parser process finished with code ${code}.`));
    
    res.status(2022).json({ message: "Analysis started in the background." });
});

// --- CORRECTED Endpoint to handle GitHub link submissions ---
app.post('/analyze-github', async (req, res) => {
    const { url } = req.body;
    console.log(`Received GitHub URL: ${url}`);

    try {
        // Create a unique name for the target directory to avoid conflicts
        const repoName = url.split('/').pop();
        const targetPath = path.join(cloneDir, repoName);

        // Clean up the directory if it exists from a previous run
        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
        }

        // Asynchronously clone the repository using simple-git
        // '--depth=1' makes the clone much faster by fetching only the latest commit
        console.log(`Cloning ${url} into ${targetPath}...`);
        await simpleGit().clone(url, targetPath, ['--depth=1']);
        console.log('Clone complete.');

        // Spawn the parser process on the newly cloned directory
        console.log('Spawning parser process for the cloned repository...');
        const parserProcess = spawn('node', ['main.js', targetPath]);
        
        parserProcess.stdout.on('data', (data) => console.log(`[Parser - ${repoName}] ${data}`));
        parserProcess.stderr.on('data', (data) => console.error(`[Parser ERROR - ${repoName}] ${data}`));

        // When the parser is finished, clean up the cloned repository
        parserProcess.on('close', (code) => {
            console.log(`Parser for ${repoName} finished with code ${code}.`);
            fs.rmSync(targetPath, { recursive: true, force: true });
            console.log(`Cleaned up ${targetPath}.`);
        });

        // Respond immediately to the user that the process has started
        res.status(202).json({ message: `Successfully cloned ${repoName}. Analysis has started.` });

    } catch (err) {
        console.error('Failed to clone repository:', err);
        res.status(500).json({ error: 'Failed to clone repository. Check the URL and server logs.' });
    }
});


// --- Start the Server ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Open this address in your web browser to start.');
});
