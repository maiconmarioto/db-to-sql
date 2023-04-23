const db = require('../../database');

async function getOrderFromForeignKeys() {
  const foreignKeyInfo = await db.raw(`
    SELECT
      TABLE_NAME as table_name,
      COLUMN_NAME as column_name,
      REFERENCED_TABLE_NAME as foreign_table_name
    FROM
      INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      REFERENCED_TABLE_NAME IS NOT NULL
  `);

  const orderMap = {};

  for (const row of foreignKeyInfo[0]) {
    const { table_name, foreign_table_name } = row;

    if (!orderMap[foreign_table_name]) {
      orderMap[foreign_table_name] = [];
    }

    if (!orderMap[table_name]) {
      orderMap[table_name] = [];
    }

    if (!orderMap[foreign_table_name].includes(table_name)) {
      orderMap[foreign_table_name].push(table_name);
    }
  }

  const order = [];
  const visited = {};

  function visit(table) {
    if (!visited[table]) {
      visited[table] = true;
      if (orderMap[table]) {
        for (const relatedTable of orderMap[table]) {
          visit(relatedTable);
        }
      }
      order.unshift(table);
    }
  }

  for (const table of Object.keys(orderMap)) {
    visit(table);
  }

  return order;
}

module.exports = getOrderFromForeignKeys;
