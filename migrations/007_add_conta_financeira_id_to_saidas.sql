-- Migration para adicionar campo de conta financeira à tabela de saídas

-- Adicionando coluna à tabela saidas
ALTER TABLE saidas 
ADD COLUMN conta_financeira_id BIGINT REFERENCES contas_financeiras(id) ON DELETE SET NULL;

-- Adicionando comentário à nova coluna
COMMENT ON COLUMN saidas.conta_financeira_id IS 'ID da conta financeira associada à saída (opcional)';