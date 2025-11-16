import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting deployment process...\n');

// Step 1: Push code
console.log('📤 Pushing code to Apps Script...');
try {
  execSync('clasp push', { stdio: 'inherit' });
  console.log('✅ Code pushed successfully\n');
} catch (error) {
  console.error('❌ Failed to push code');
  process.exit(1);
}

// Step 2: Deploy
console.log('🔄 Deploying...');
try {
  const output = execSync('clasp deploy', { encoding: 'utf-8' });
  console.log(output);
  
  // Extract deployment ID from output
  // Format: "- AKfycbz6hd2QYJgnkAWCGhC3cHOdWiEKI0Emze44-SbXspxD2xNj5CqkMLwzbN6noaYGme_G @6."
  const match = output.match(/- (AKfycb[a-zA-Z0-9_-]+) @/);
  
  if (!match) {
    console.error('❌ Could not extract deployment ID from output');
    process.exit(1);
  }
  
  const deploymentId = match[1];
  console.log(`✅ Deployed successfully with ID: ${deploymentId}\n`);
  
  // Step 3: Update the config file
  const configPath = path.join(__dirname, '..', 'src', 'config.js');
  let configContent = fs.readFileSync(configPath, 'utf-8');
  
  // Replace the deployment URL
  const urlPattern = /export const SCRIPT_URL = "https:\/\/script\.google\.com\/macros\/s\/AKfycb[a-zA-Z0-9_-]+\/exec";/;
  const newUrl = `export const SCRIPT_URL = "https://script.google.com/macros/s/${deploymentId}/exec";`;
  
  if (!urlPattern.test(configContent)) {
    // If not found, add it
    configContent = `${newUrl}\n`;
  } else {
    configContent = configContent.replace(urlPattern, newUrl);
  }
  
  fs.writeFileSync(configPath, configContent, 'utf-8');
  
  console.log('✅ Updated config.js with new deployment URL');
  console.log(`   New URL: https://script.google.com/macros/s/${deploymentId}/exec\n`);
  
  console.log('🎉 Deployment complete! Your app is ready to use.\n');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
