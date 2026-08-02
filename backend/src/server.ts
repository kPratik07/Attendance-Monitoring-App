import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { seedData } from './seeders/bootstrap.js';

void (async () => {
  await connectDatabase();
  await seedData();

  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
})();
