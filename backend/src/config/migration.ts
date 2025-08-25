import pool from './db';

async function addStatusColumnIfNotExists(): Promise<void> {
  try {
    // Verifica se la colonna status esiste già
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='cats' AND column_name='status'
    `);
    
    if (result.rows.length === 0) {
      // La colonna non esiste, aggiungila
      await pool.query(`
        ALTER TABLE cats 
        ADD COLUMN status TEXT DEFAULT 'active' 
        CHECK (status IN ('active', 'adopted', 'moved'))
      `);
      
      console.log('✅ Colonna status aggiunta alla tabella cats');
    } else {
      console.log('✅ Colonna status già presente nella tabella cats');
    }
  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
    throw error;
  }
}

export default addStatusColumnIfNotExists;
