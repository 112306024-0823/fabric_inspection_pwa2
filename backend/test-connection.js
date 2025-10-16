const sql = require('mssql');
require('dotenv').config();

// SQL Server 配置
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 30000,
};

async function testConnection() {
  console.log('🔄 Testing SQL Server connection...');
  console.log('📊 Configuration:', {
    server: sqlConfig.server,
    database: sqlConfig.database,
    port: sqlConfig.port,
    user: sqlConfig.user,
    encrypt: sqlConfig.options.encrypt
  });

  try {
    // 建立連接
    const pool = await sql.connect(sqlConfig);
    console.log('✅ Connected to SQL Server successfully!');

    // 檢查資料表是否存在
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    console.log('📋 Available tables:');
    tablesResult.recordset.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });

    // 檢查主要資料表的記錄數
    const tables = ['rolls', 'inspections', 'defects', 'defect_codes'];
    for (const table of tables) {
      try {
        const countResult = await pool.request().query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📊 ${table}: ${countResult.recordset[0].count} records`);
      } catch (error) {
        console.log(`❌ ${table}: Table not found or error - ${error.message}`);
      }
    }

    // 關閉連接
    await pool.close();
    console.log('✅ Connection closed successfully');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Suggestion: Check if SQL Server is running and accessible');
    } else if (error.code === 'ELOGIN') {
      console.error('💡 Suggestion: Check username and password');
    } else if (error.code === 'ETIMEOUT') {
      console.error('💡 Suggestion: Check network connectivity and firewall settings');
    }
    
    process.exit(1);
  }
}

// 執行測試
testConnection();
