// const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

const bodyParser = require('body-parser');

dotenv.config();
const port = process.env.PORT;

const app = express();
const cors = require('cors');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('./routes'));


app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
