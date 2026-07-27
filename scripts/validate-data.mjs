import process from 'node:process';
import { validateDataset } from './validation-core.mjs';

const result = await validateDataset(process.cwd());

if (result.errors.length) {
  console.error(`Data validation failed with ${result.errors.length} issue(s):`);
  result.errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Data validation passed: ${result.counts.programs} programs, ${result.counts.studies} studies, `
  + `${result.counts.events} events, ${result.counts.deliveryTechnologies} delivery technologies.`,
);
