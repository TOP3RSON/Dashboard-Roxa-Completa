-- Migration para atualizar as views contas_vencer e contas_vencidas para incluir o campo grupo_parcelamento_id

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

-- Comentário para documentar a atualização
COMMENT ON COLUMN vw_contas_vencer.grupo_parcelamento_id IS 'Identificador para agrupar parcelas relacionadas de uma mesma conta. NULL se a conta não faz parte de um grupo de parcelamento.';
COMMENT ON COLUMN vw_contas_vencidas.grupo_parcelamento_id IS 'Identificador para agrupar parcelas relacionadas de uma mesma conta. NULL se a conta não faz parte de um grupo de parcelamento.';