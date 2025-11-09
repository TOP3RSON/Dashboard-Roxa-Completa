-- Migration para adicionar tabela de contas financeiras

CREATE TYPE tipo_conta AS ENUM ('pix', 'poupanca', 'debito', 'dinheiro', 'credito', 'investimento');

CREATE TABLE contas_financeiras (
  id bigserial NOT NULL,
  nome_conta TEXT NOT NULL,
  tipo_conta tipo_conta NOT NULL,
  saldo NUMERIC(12,2) NOT NULL DEFAULT 0,
  dados_especificos JSONB, -- Armazena informações específicas por tipo (chave PIX, dados bancários, etc.)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT contas_financeiras_pkey PRIMARY KEY (id)
);

-- Índice para melhorar performance na busca por tipo de conta
CREATE INDEX idx_contas_financeiras_tipo ON contas_financeiras(tipo_conta);

-- Comentários para documentar a tabela
COMMENT ON TABLE contas_financeiras IS 'Tabela para armazenar diferentes tipos de contas financeiras (PIX, poupança, débito, dinheiro, crédito, investimento)';
COMMENT ON COLUMN contas_financeiras.tipo_conta IS 'Tipo da conta: pix, poupanca, debito, dinheiro, credito ou investimento';
COMMENT ON COLUMN contas_financeiras.dados_especificos IS 'JSON com dados específicos por tipo de conta (chave PIX, dados bancários, etc.)';