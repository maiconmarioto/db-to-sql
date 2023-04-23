const db = require('../../database');

async function getOrderFromForeignKeys() {
  const foreignKeyInfo = await db.raw(`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name
    FROM
      information_schema.table_constraints AS tc
    JOIN
      information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN
      information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE
      constraint_type = 'FOREIGN KEY';
  `);

  const orderMap = {};

  for (const row of foreignKeyInfo.rows) {
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
      order.unshift(table); // Modifiquei esta linha para adicionar as tabelas no início da lista
    }
  }

  for (const table of Object.keys(orderMap)) {
    visit(table);
  }

  return order;
}

module.exports = getOrderFromForeignKeys;
