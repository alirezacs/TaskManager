const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`API server running on http://localhost:${config.port}`);
});
