#!/usr/bin/env node
// SSL Certificate fix
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');

async function checkCompanies() {
  const client = new Client({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const companies = await client.query(`
      SELECT id, name FROM intelligence.companies ORDER BY name
    `);
    
    console.log(`Companies in PostgreSQL: ${companies.rows.length}`);
    companies.rows.forEach(c => {
      console.log(`${c.id}: ${c.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkCompanies();