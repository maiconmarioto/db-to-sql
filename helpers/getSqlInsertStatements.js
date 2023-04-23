const db = require('../database');
const getRelatedTableData = require('./getRelatedTableData')
const orderSqlStatements = require('./orderSqlStatements');

module.exports = async function getSqlInsertStatement(record, tableName) {
  const columns = Object.keys(record);
  const values = columns.map(col => typeof record[col] === 'string' ? `'${record[col]}'` : record[col]).join(', ');
  return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values});`;
}

module.exports = async function getSqlInsertStatements(tableName, fieldName, fieldValue, includeRelated = true) {
  const mainRecord = await db.select().from(tableName).where({ [fieldName]: fieldValue }).first();
  if (!mainRecord) {
    throw new Error(`No record found in table '${tableName}' with '${fieldName}' equal to '${fieldValue}'.`);
  }

  let records = [{ tableName, data: mainRecord }];

  if (includeRelated) {
    const relatedRecords = await getRelatedTableData(tableName, fieldName, fieldValue);
    records = records.concat(relatedRecords);
  }

  const sqlStatements = {};

  for (const recordInfo of records) {
    const { tableName, data } = recordInfo;
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data)
      .map((value) => {
        if (value === null) {
          return 'NULL';
        } else if (typeof value === 'string') {
          return `'${value}'`;
        } else if (typeof value === 'object') {
          return `'${JSON.stringify(value)}'`; // Adicionado para corrigir o problema
        } else {
          return value;
        }
      })
      .join(', ');

    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
    sqlStatements[tableName] = sql;
  }

  const orderedSqlStatements = await orderSqlStatements(sqlStatements);

  return orderedSqlStatements;
}