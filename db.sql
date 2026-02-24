-- ============================================================================
-- DATABASE SCHEMA - StreetCats Project
-- Piattaforma di segnalazione gatti randagi con mappa interattiva
-- ============================================================================
-- Author: Gino Pandozzi-Trani
-- Version: 1.0.0
-- ============================================================================

-- 1. TABELLA UTENTI
-- Memorizza le credenziali e informazioni degli utenti registrati
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indice per velocizzare le ricerche per email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================================================
-- 2. TABELLA GATTI
-- Memorizza i segnalamenti di gatti randagi con coordinate geografiche
CREATE TABLE IF NOT EXISTS cats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'adopted', 'moved')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per ottimizzare le query
CREATE INDEX IF NOT EXISTS idx_cats_user_id ON cats(user_id);
CREATE INDEX IF NOT EXISTS idx_cats_status ON cats(status);
CREATE INDEX IF NOT EXISTS idx_cats_coordinates ON cats(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_cats_created_at ON cats(created_at DESC);

-- ============================================================================
-- 3. TABELLA COMMENTI
-- Memorizza i commenti degli utenti sui segnalamenti di gatti
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per ottimizzare le query
CREATE INDEX IF NOT EXISTS idx_comments_cat_id ON comments(cat_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- ============================================================================
-- 4. TABELLA REFRESH TOKENS
-- Memorizza i refresh token per la gestione sessioni sicure
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per ottimizzare le query
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ============================================================================
-- COMMENTI SULLA STRUTTURA
-- ============================================================================
-- 
-- USERS TABLE:
--   - Memorizza username e email univoci
--   - Password hashata con bcrypt (mai in chiaro)
--   - Timestamps per audit trail
--
-- CATS TABLE:
--   - Collega ogni segnalamento a un utente
--   - Status per tracciare lo stato del gatto (attivo, adottato, trasferito)
--   - Coordinate geografiche per la mappa interattiva
--   - URL immagine per foto del gatto
--
-- COMMENTS TABLE:
--   - Permette agli utenti di commentare altri segnalamenti
--   - Audit trail con created_at/updated_at
--
-- REFRESH_TOKENS TABLE:
--   - Implementa JWT refresh token rotation per sicurezza
--   - Token scadono dopo 30 giorni
--   - Revoca token al logout per tracciare le sessioni attive
--
-- ============================================================================
