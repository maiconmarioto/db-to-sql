# DB-to-SQL-Insert

DB-to-SQL-Insert is an open-source project that simplifies extracting data from a relational database and converts it into SQL `INSERT` statements that can be easily shared and imported into other databases. The project was designed to support database management systems (DBMS) such as PostgreSQL and MySQL.

The motivation for this project is to provide a simple and efficient tool for migrating data between different databases, including data related to a specific table.

## Prerequisites

- Node.js (v14+)
- PostgreSQL or MySQL installed and configured

## Installation

1. Clone the repository:

```
git clone https://github.com/user/repo.git
cd repo
```

2. Install the project dependencies:

```
npm install
```

3. Copy and rename the `.env.example` file to `.env` and fill it with your database information:

```ini
DB_TYPE= # postgres, mysql, sqlite3
DB_CLIENT= # pg, mysql, sqlite3
DB_HOST= # localhost
DB_PORT= # 5432 (PostgreSQL), 3306 (MySQL), or your database port
DB_USER= # postgres (PostgreSQL), root (MySQL), or your database user
DB_PASSWORD= # postgres (PostgreSQL), abc500MIL (MySQL), or your database password
DB_NAME= # Your database name
```

## Usage

Start the server:

```
npm start
```

The application will be available on port 3000.

### Example cURL request

```
curl -X POST -H "Content-Type: application/json" \
     -d '{"tableName": "user", "fieldName": "id", "fieldValue": 1, "includeRelated": "true"}' \
     http://localhost:3000/db-to-sql
```

## Documentation

DB-to-SQL-Insert uses various rules and functions to convert the database data into SQL `INSERT` statements. Some of these rules include:

- Extracting related data from parent and child tables.
- Ordering SQL `INSERT` statements based on dependencies between tables.
- Support for converting null values and special data types, such as JSON.

Currently, the project supports the following database management systems:

- PostgreSQL
- MySQL
- SQLite3

## Contribution

Contributions are welcome! Feel free to open a pull request or an issue on GitHub to improve the project.

## License

DB-to-SQL-Insert is licensed under the MIT license.