const express = require('express');
const bodyParser = require('body-parser');
const dbToSqlController = require('./controllers/dbToSqlController');

const app = express();
app.use(bodyParser.json());

app.use('/db-to-sql', dbToSqlController);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
