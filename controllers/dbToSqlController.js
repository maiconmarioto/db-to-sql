const express = require('express');
const config = require('../config');
const getSqlInsertStatements = require('../helpers/getSqlInsertStatements');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log({ config })
    const { tableName, fieldName, fieldValue, includeRelated } = req.body;
    const includeRelatedBool = includeRelated && includeRelated.toLowerCase() === 'true';

    const sqlStatements = await getSqlInsertStatements(tableName, fieldName, fieldValue, includeRelatedBool);
    res.send({ success: true, ...sqlStatements });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error generating SQL statements' });
  }
});

module.exports = router;
