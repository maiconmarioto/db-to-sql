const config = require('../config');
const getOrderFromForeignKeys =
  config.dbType === 'mysql'
    ? require('../db-specific/mysql/getOrderFromForeignKeys')
    : require('../db-specific/postgres/getOrderFromForeignKeys');

module.exports = async function orderSqlStatements(sqlStatements) {
  console.log({ config })
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