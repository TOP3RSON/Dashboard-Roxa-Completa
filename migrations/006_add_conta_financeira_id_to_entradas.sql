-- Migration para adicionar campo de conta financeira à tabela de entradas

-- Adicionando coluna à tabela entradas
ALTER TABLE entradas 
ADD COLUMN conta_financeira_id BIGINT REFERENCES contas_financeiras(id) ON DELETE SET NULL;

-- Adicionando comentário à nova coluna
COMMENT ON COLUMN entradas.conta_financeira_id IS 'ID da conta financeira associada à entrada (opcional)';