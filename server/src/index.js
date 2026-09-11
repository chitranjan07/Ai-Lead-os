import { app } from './app.js';
import { connectDb } from './db.js';
import { config } from './config.js';

connectDb()
  .then(() => app.listen(config.port, () => console.log(`API running on http://localhost:${config.port}`)))
  .catch((error) => {
    console.error('Startup failed:', error);
    process.exit(1);
  });
