const express = require('express');
const path = require('path');

const router = express.Router();

const apiRoutes = require('./api.routes');

router.use(/^\/(?!api).*/, (req, res) => {
  const indexPath = path.join(process.cwd(), 'public', 'index.html');
  res.sendFile(indexPath);
});

for (const apiRoute of apiRoutes) {
  const { method, path: apiPath, handler } = apiRoute;
  router[method](path.join('api', apiPath), handler);
}


module.exports = router;
