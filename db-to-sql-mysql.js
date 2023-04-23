const express = require('express');
const bodyParser = require('body-parser');
const { raw, first } = require('objection');
const knex = require('knex');
const app = express();
app.use(bodyParser.json());

const config = {
  client: 'mysql', // Altere para 'mysql' se estiver usando MySQL
  connection: {
    host: 'localhost',
    user: 'root',
    password: 'abc500MIL',
    database: 'agendae'
  }
};

const db = knex(config);


async function getRelatedTables(tableName) {
  const schemaName = 'public'; // Altere para o nome do schema, se necessário

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


async function getSqlInsertStatement(record, tableName) {
  const columns = Object.keys(record);
  const values = columns.map(col => typeof record[col] === 'string' ? `'${record[col]}'` : record[col]).join(', ');
  return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values});`;
}

async function getRelatedTableData(tableName, fieldName, fieldValue) {
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

  // Atualize esta linha para usar foreignKeyInfo[0] no lugar de foreignKeyInfo.rows
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
      order.unshift(table); // Modifiquei esta linha para adicionar as tabelas no início da lista
    }
  }

  for (const table of Object.keys(orderMap)) {
    visit(table);
  }

  return order;
}

async function orderSqlStatements(sqlStatements) {
  const allOrder = await getOrderFromForeignKeys();
  const orderedStatements = {};
  const order = [];

  for (const tableName of allOrder) {
    if (sqlStatements[tableName]) {
      orderedStatements[tableName] = sqlStatements[tableName];
      order.push(tableName); // Adicione a tabela somente se ela estiver presente no objeto sqlStatements
    }
  }

  return {
    orderedStatements,
    order
  };
}

async function getSqlInsertStatements(tableName, fieldName, fieldValue, includeRelated = true) {
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

app.post('/db-to-sql', async (req, res) => {
  try {
    const { tableName, fieldName, fieldValue, includeRelated } = req.body;
    const includeRelatedBool = includeRelated && includeRelated.toLowerCase() === 'true';

    const sqlStatements = await getSqlInsertStatements(tableName, fieldName, fieldValue, includeRelatedBool);
    res.send({ success: true, ...sqlStatements });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error generating SQL statements' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
