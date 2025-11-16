import { execSync } from 'child_process';

try {
  // Get the list of deployments
  const output = execSync('clasp deployments', { encoding: 'utf8' });
  console.log('Deployments output:\n', output);

  // Parse deployment IDs from the output
  // Assuming format like: - AKfycbz... @1.0: description
  const lines = output.split('\n');
  const deploymentIds = [];

  lines.forEach(line => {
    const match = line.match(/- ([A-Za-z0-9_-]+) @/);
    if (match) {
      deploymentIds.push(match[1]);
    }
  });

  if (deploymentIds.length === 0) {
    console.log('No deployments found to undeploy.');
    process.exit(0);
  }

  console.log('Found deployments:', deploymentIds);

  // Undeploy each one
  deploymentIds.forEach(id => {
    try {
      console.log(`Undeploying ${id}...`);
      execSync(`clasp undeploy ${id}`, { stdio: 'inherit' });
      console.log(`Successfully undeployed ${id}`);
    } catch (error) {
      console.error(`Failed to undeploy ${id}:`, error.message);
    }
  });

} catch (error) {
  console.error('Error running clasp deployments:', error.message);
}