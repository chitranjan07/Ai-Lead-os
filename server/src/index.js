import { app } from './app.js';
import { connectDb } from './db.js';
import { config } from './config.js';

const PORT = process.env.PORT || config.port; // ✅ use Render's injected port

connectDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Startup failed:', error);
    process.exit(1);
  });
