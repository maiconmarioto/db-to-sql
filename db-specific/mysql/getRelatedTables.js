const db = require('../../database');

async function getRelatedTables(tableName) {
  const schemaName = 'public';

  const foreignKeyConstraints = await db.raw(`
    SELECT
      COLUMN_NAME as column_name,
      REFERENCED_TABLE_NAME as referenced_table_name,
      TABLE_NAME as table_name
    FROM
      INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      REFERENCED_TABLE_NAME = '${tableName}'
      OR TABLE_NAME = '${tableName}'
      AND TABLE_SCHEMA = '${schemaName}'
  `);

  return foreignKeyConstraints[0];
}

module.exports = getRelatedTables;
