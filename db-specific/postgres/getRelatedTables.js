const db = require('../../database');

async function getRelatedTables(tableName) {
  const schemaName = 'public'; // Altere para o nome do schema, se necessário

  const foreignKeyConstraints = await db.raw(`
    SELECT
      a.attname AS column_name,
      ct.relname AS referenced_table_name,
      cf.relname AS table_name
    FROM
      pg_constraint c
    JOIN pg_class ct ON c.confrelid = ct.oid
    JOIN pg_class cf ON c.conrelid = cf.oid
    JOIN pg_attribute a ON a.attrelid = cf.oid AND a.attnum = ANY(c.conkey)
    JOIN pg_namespace n ON n.oid = cf.relnamespace
    WHERE
      (cf.relname = '${tableName}' OR ct.relname = '${tableName}') AND
      n.nspname = '${schemaName}' AND
      c.contype = 'f';
  `);

  return foreignKeyConstraints.rows;
}

module.exports = getRelatedTables;
