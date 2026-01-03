const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'academic_tracker',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const createMasterAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('hadenroysten', 10);
    
    const query = 'INSERT INTO users (name, email, password, role, assignedClasses, isActive) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING RETURNING *;';
    
    const values = ['Master Admin', 'officialventuree@gmail.com', hashedPassword, 'admin', '{}', true];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length > 0) {
      console.log('Master admin created successfully');
    } else {
      console.log('Master admin already exists');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error creating master admin:', error);
    await pool.end();
  }
};

createMasterAdmin();