-- Migration para adicionar suporte a parcelamento de contas

-- Certifica-se de que a extensão pgcrypto está disponível para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Adiciona uma coluna para agrupar parcelas relacionadas
ALTER TABLE contas 
ADD COLUMN grupo_parcelamento_id UUID;

-- Cria um índice para melhorar a performance na busca por parcelas de um mesmo grupo
CREATE INDEX idx_contas_grupo_parcelamento_id ON contas(grupo_parcelamento_id);

-- Comentário para documentar a coluna
COMMENT ON COLUMN contas.grupo_parcelamento_id IS 'Identificador para agrupar parcelas relacionadas de uma mesma conta. NULL se a conta não faz parte de um grupo de parcelamento.';

-- Atualização opcional: Atualizar as views para incluir o novo campo (descomente se necessário)
/*
-- Atualizar a view vw_contas_vencer para incluir o campo grupo_parcelamento_id
CREATE OR REPLACE VIEW public.vw_contas_vencer AS
SELECT 
    c.id,
    c.descricao,
    c.valor,
    c.data_vencimento,
    c.tipo,
    c.status,
    c.categoria_id,
    c.whatsapp,
    c.created_at,
    c.grupo_parcelamento_id
FROM public.contas c
WHERE c.data_vencimento >= CURRENT_DATE 
  AND (c.status = 'pendente' OR c.status = 'vencida');

-- Atualizar a view vw_contas_vencidas para incluir o campo grupo_parcelamento_id
CREATE OR REPLACE VIEW public.vw_contas_vencidas AS
SELECT 
    c.id,
    c.descricao,
    c.valor,
    c.data_vencimento,
    c.tipo,
    c.status,
    c.categoria_id,
    c.whatsapp,
    c.created_at,
    c.grupo_parcelamento_id
FROM public.contas c
WHERE c.data_vencimento < CURRENT_DATE 
  AND (c.status = 'pendente' OR c.status = 'vencida');
*/