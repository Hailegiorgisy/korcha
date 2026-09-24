import * as ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Read credentials from your .env or insert them here directly
const FTP_CONFIG = {
  host: process.env.FTP_HOST || 'lin4.ethiotelecom.et',
  user: process.env.FTP_USER || 'korchaco',
  password: process.env.FTP_PASSWORD || 'George@12211221',
  port: 21,
  secure: false
};

const REMOTE_DIR = '/httpdocs';

async function main() {
  const action = process.argv[2]; // 'pull' or 'push'
  const client = new ftp.Client();
  client.ftp.verbose = false;

  if (!action || (action !== 'pull' && action !== 'push')) {
    console.log('Usage: node scripts/sync.js [pull|push]');
    process.exit(1);
  }

  try {
    console.log(`Connecting to Plesk FTP at ${FTP_CONFIG.host}...`);
    await client.access(FTP_CONFIG);
    console.log('Connected successfully!\n');

    if (action === 'pull') {
      console.log(`Pulling (downloading) all files from ${REMOTE_DIR} to your PC...`);
      // Downloads from server /httpdocs into your local project root
      await client.downloadToDir(projectRoot, REMOTE_DIR);
      console.log('\nPull complete! All files from Plesk are now on your computer.');
    } else if (action === 'push') {
      console.log(`Pushing (uploading) files from your PC to ${REMOTE_DIR}...`);
      // Uploads your local project root to server /httpdocs
      await client.uploadFromDir(projectRoot, REMOTE_DIR, {
        ignore: (file) => {
          // Never upload heavy or sensitive local folders
          return (
            file.includes('node_modules') ||
            file.includes('.git') ||
            file.includes('.vscode') ||
            file.endsWith('.env') ||
            file.endsWith('.log')
          );
        }
      });
      console.log('\nPush complete! Your live Plesk server is updated.');
    }
  } catch (err) {
    console.error('FTP Error:', err.message);
  } finally {
    client.close();
  }
}

main();