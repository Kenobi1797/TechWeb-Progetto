-- Migrazione per supportare immagini Base64
-- Aggiunge la colonna image_data e rende image_url opzionale

-- 1. Aggiungi la nuova colonna per i dati Base64
ALTER TABLE cats ADD COLUMN image_data TEXT;

-- 2. Rendi image_url opzionale (può essere NULL)
ALTER TABLE cats ALTER COLUMN image_url DROP NOT NULL;

-- 3. Aggiungi un constraint per assicurarsi che almeno una delle due colonne sia presente
-- (opzionale - può essere gestito a livello applicativo)
-- ALTER TABLE cats ADD CONSTRAINT check_image_source 
--   CHECK ((image_url IS NOT NULL) OR (image_data IS NOT NULL));

-- 4. Crea un indice per migliorare le performance se necessario
CREATE INDEX idx_cats_has_image ON cats ((CASE WHEN image_data IS NOT NULL OR image_url IS NOT NULL THEN 1 ELSE 0 END));
