import { Application } from './core/application.js';

try {
  await Application.start();
} catch (error) {
  console.error(error);

  process.exit(1);
}
