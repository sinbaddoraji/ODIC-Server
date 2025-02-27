import express from 'express';
let path = require('path');

let realmsRouter = require('./routes/realms');

const app = express();
const port = 3000;

app.use(express.json());

app.use('/realms', realmsRouter);

app.listen(port, () => {
  return console.log(`Server is listening at http://localhost:${port}`);
});