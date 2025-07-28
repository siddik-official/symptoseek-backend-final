const { spawn } = require('child_process');
const path = require('path');

let flaskProcess = null;

function startFlaskService() {
    console.log('🐍 Starting Flask ML service...');
    
    const flaskPath = path.join(__dirname, 'backend_flask');
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    flaskProcess = spawn(pythonCmd, ['app.py'], {
        cwd: flaskPath,
        stdio: 'inherit',
        env: { ...process.env, PORT: '5001' }
    });
    
    flaskProcess.on('error', (error) => {
        console.error('❌ Flask service error:', error);
    });
    
    flaskProcess.on('exit', (code) => {
        console.log(`🐍 Flask service exited with code ${code}`);
        if (code !== 0) {
            console.log('🔄 Restarting Flask service in 5 seconds...');
            setTimeout(startFlaskService, 5000);
        }
    });
    
    console.log('✅ Flask service started on port 5001');
}

function stopFlaskService() {
    if (flaskProcess) {
        console.log('🛑 Stopping Flask service...');
        flaskProcess.kill();
        flaskProcess = null;
    }
}

module.exports = {
    startFlaskService,
    stopFlaskService
};
