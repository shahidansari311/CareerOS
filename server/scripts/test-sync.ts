import { runOpportunitySync } from '../src/schedulers/opportunity-sync.scheduler';

async function test() {
  console.log('Testing job synchronization...');
  await runOpportunitySync();
  console.log('Finished testing.');
  process.exit(0);
}

test();
