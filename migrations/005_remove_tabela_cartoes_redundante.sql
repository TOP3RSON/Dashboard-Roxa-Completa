-- Migration para remover tabela cartoes redundante

-- Primeiro remover constraints e relacionamentos
ALTER TABLE cartoes DROP CONSTRAINT IF EXISTS cartoes_pkey;

-- Depois remover a tabela
DROP TABLE IF EXISTS cartoes;

-- Remover também o schema se existir
DROP SCHEMA IF EXISTS cartoes CASCADE;