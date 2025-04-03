import fs from 'fs';
import path from 'path';
import db from '../utils/db.js';

const runMigrations = async () => {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'db', 'migrations', '001_create_saving_goals_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await db.query(migrationSQL);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
};

runMigrations(); 