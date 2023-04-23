const db = require('../database');
const config = require('../config');
const getRelatedTables =
  config.dbType === 'mysql'
    ? require('../db-specific/mysql/getRelatedTables')
    : require('../db-specific/postgres/getRelatedTables');

module.exports = async function getRelatedTableData(tableName, fieldName, fieldValue) {
  const relatedTables = await getRelatedTables(tableName);
  const records = [];

  const mainRecord = await db.select().from(tableName).where({ [fieldName]: fieldValue }).first();
  records.push({ tableName, data: mainRecord });

  for (const relatedTableInfo of relatedTables) {
    const relatedTable = relatedTableInfo.table_name === tableName
      ? relatedTableInfo.referenced_table_name
      : relatedTableInfo.table_name;

    const foreignKey = relatedTableInfo.column_name;
    const relatedRecords = await db.select().from(relatedTable).where({ [foreignKey]: fieldValue });

    if (relatedRecords.length > 0) {
      records.push({ tableName: relatedTable, data: relatedRecords });
    }
  }

  return records;
}