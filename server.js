// server.js - Asynchronous Processing Version

const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { spawn } = require('child_process'); // Import the 'spawn' function

const app = express();
const port = 3000;

// --- Setup Temporary Upload Directory ---
const uploadDir = path.join(__dirname, 'temp-uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// --- Configure Multer for Efficient Disk Storage ---
// This configuration preserves the original folder structure of the upload.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create the full directory path inside 'temp-uploads'
        const dir = path.join(uploadDir, path.dirname(file.originalname));
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Use just the base name of the file
        cb(null, path.basename(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from the root directory

// --- Routes ---

// Serve the main index.html page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to handle folder uploads
app.post('/analyze-upload', upload.array('files'), (req, res) => {
    console.log('Files successfully saved to the temp-uploads directory.');
    
    // --- Run Parser in Background ---
    // This is the key to a non-blocking server. We start the analysis
    // but do not wait for it to finish.
    console.log('Spawning parser process in the background...');
    
    // We will run `node main.js /path/to/temp-uploads`
    const parserProcess = spawn('node', ['main.js', uploadDir]);

    // Optional: Log output from the parser process for debugging
    parserProcess.stdout.on('data', (data) => {
        console.log(`[Parser] ${data}`);
    });

    parserProcess.stderr.on('data', (data) => {
        console.error(`[Parser ERROR] ${data}`);
    });

    parserProcess.on('close', (code) => {
        console.log(`Parser process finished with code ${code}.`);
        // In a real application, you would clean up the temp-uploads directory here.
        // For example: fs.rmdirSync(uploadDir, { recursive: true, force: true });
    });

    // --- Respond Immediately to the User ---
    // We send a "202 Accepted" status to indicate that the request has been
    // received and is being processed, but is not yet complete.
    res.status(202).json({
        message: "Analysis started in the background. This may take a few minutes."
    });
});

// Endpoint to handle GitHub link submissions
app.post('/analyze-github', (req, res) => {
    const { url } = req.body;
    console.log(`Received GitHub URL for analysis: ${url}`);
    
    // In a real implementation, you would clone the repo and then
    // spawn the parser process on the cloned directory, similar to the upload handler.
    
    res.status(202).json({ 
        message: "GitHub repository analysis has been queued." 
    });
});

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Open this address in your web browser to start.');
});
