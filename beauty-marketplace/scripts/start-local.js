const { spawn } = require('child_process');
const ngrok = require('ngrok');

console.log('🚀 Starting local development server with ngrok...\n');

// Start Vite dev server
const vite = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait for server to start, then connect ngrok
setTimeout(async () => {
  try {
    console.log('\n🔗 Connecting ngrok...');
    const url = await ngrok.connect({
      addr: 5173,
      proto: 'http',
      name: 'beauty-marketplace'
    });
    
    console.log('\n✅ Server is running!');
    console.log(`   Local:   http://localhost:5173`);
    console.log(`   Ngrok:   ${url}`);
    console.log(`\n📱 Use this URL in Telegram BotFather:`);
    console.log(`   ${url}`);
    console.log('\nPress Ctrl+C to stop all servers\n');
  } catch (err) {
    console.error('❌ Ngrok error:', err.message);
    console.log('\nMake sure you have ngrok installed and configured.');
    console.log('Run: npx ngrok config add-authtoken <your-token>');
  }
}, 3000);

vite.on('close', () => {
  ngrok.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  ngrok.kill();
  vite.kill();
  process.exit(0);
});
