const express = require('express');

const app = express();
const port = process.env.PORT || 5000;
const routes = require('./routes/index');

app.use(express.json());
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
