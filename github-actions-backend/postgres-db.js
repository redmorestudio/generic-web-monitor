/**
 * PostgreSQL Database Connection Utility
 * 
 * Centralized database connection for all scripts
 * Replaces better-sqlite3 with pg (node-postgres)
 */

const { Pool } = require('pg');

// Check for connection string
const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING;

if (!POSTGRES_CONNECTION_STRING) {
  console.error('❌ ERROR: POSTGRES_CONNECTION_STRING environment variable not set');
  console.error('Make sure to set it in your environment or GitHub Actions secrets');
  process.exit(1);
}

// Create a connection pool
const pool = new Pool({
  connectionString: POSTGRES_CONNECTION_STRING,
  ssl: { 
    rejectUnauthorized: false // Required for Heroku
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
});

// Log successful connection
pool.on('connect', () => {
  console.log('✅ Connected to Postgres database');
});

// Log errors
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Query wrapper that automatically uses the correct schema prefix
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (process.env.DEBUG_DB) {
    console.log('Executed query', { text, duration, rows: res.rowCount });
  }
  
  return res;
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Client>} PostgreSQL client
 */
async function getClient() {
  return await pool.connect();
}

/**
 * Helper to run a transaction
 * @param {Function} callback - Function that receives client and performs operations
 * @returns {Promise} Transaction result
 */
async function transaction(callback) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Close all connections in the pool
 */
async function end() {
  await pool.end();
}

/**
 * Helper functions to match SQLite-style API
 */
const db = {
  // Single query that returns all rows
  all: async (text, params) => {
    const result = await query(text, params);
    return result.rows;
  },
  
  // Single query that returns first row
  get: async (text, params) => {
    const result = await query(text, params);
    return result.rows[0];
  },
  
  // Execute query without returning results (INSERT, UPDATE, DELETE)
  run: async (text, params) => {
    const result = await query(text, params);
    return {
      changes: result.rowCount,
      lastID: result.rows[0]?.id // For INSERT ... RETURNING id
    };
  },
  
  // Prepare-style interface (for compatibility)
  prepare: (text) => {
    return {
      all: async (...params) => db.all(text, params),
      get: async (...params) => db.get(text, params),
      run: async (...params) => db.run(text, params)
    };
  }
};

// Utility functions for common operations
const utils = {
  /**
   * Insert or update a record
   */
  upsert: async (table, data, conflictColumns = ['id']) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const updates = columns
      .filter(col => !conflictColumns.includes(col))
      .map(col => `${col} = EXCLUDED.${col}`)
      .join(', ');
    
    const text = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (${conflictColumns.join(', ')}) 
      DO UPDATE SET ${updates}
      RETURNING *
    `;
    
    return db.get(text, values);
  },
  
  /**
   * Batch insert with ON CONFLICT DO NOTHING
   */
  batchInsert: async (table, records, chunkSize = 1000) => {
    if (!records.length) return;
    
    const columns = Object.keys(records[0]);
    let inserted = 0;
    
    // Process in chunks
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const values = [];
      const placeholders = [];
      
      chunk.forEach((record, recordIndex) => {
        const recordPlaceholders = columns.map((col, colIndex) => {
          const paramIndex = recordIndex * columns.length + colIndex + 1;
          values.push(record[col]);
          return `$${paramIndex}`;
        });
        placeholders.push(`(${recordPlaceholders.join(', ')})`);
      });
      
      const text = `
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES ${placeholders.join(', ')}
        ON CONFLICT DO NOTHING
      `;
      
      const result = await query(text, values);
      inserted += result.rowCount;
    }
    
    return inserted;
  },
  
  /**
   * Convert SQLite datetime format to Postgres timestamp
   */
  toTimestamp: (sqliteDate) => {
    if (!sqliteDate) return null;
    // SQLite uses 'YYYY-MM-DD HH:MM:SS' format
    // Postgres accepts this format directly
    return sqliteDate;
  },
  
  /**
   * Get current timestamp in Postgres format
   */
  now: () => new Date().toISOString()
};

module.exports = {
  query,
  getClient,
  transaction,
  end,
  db,
  utils,
  pool
};
