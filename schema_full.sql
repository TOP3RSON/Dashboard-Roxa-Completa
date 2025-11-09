-- ===========================================
-- DASHBOARD FINANCEIRA – TEMPLATE MÍNIMO (DB NOVO)
-- Tabelas: usuarios, categorias, entradas, saidas, contas, cartoes
-- Views: vw_entradas_saidas_mensal, vw_saidas_por_categoria, vw_saldo_diario
-- Sem RLS, permissões, triggers ou funções.
-- ===========================================

-- ---------- Tabelas ----------

CREATE TABLE public.usuarios (
  id         BIGSERIAL PRIMARY KEY,
  nome       TEXT NOT NULL,
  whatsapp   TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.categorias (
  id         BIGSERIAL PRIMARY KEY,
  nome       TEXT NOT NULL,
  tipo       TEXT CHECK (tipo IN ('entrada','saida')) NULL,
  descricao  TEXT NULL,
  cor_hex    TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.entradas (
  id           BIGSERIAL PRIMARY KEY,
  data         DATE NOT NULL,
  valor        NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
  descricao    TEXT NULL,
  categoria_id BIGINT NULL REFERENCES public.categorias(id) ON DELETE SET NULL,
  whatsapp     TEXT NULL, -- opcional
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.saidas (
  id           BIGSERIAL PRIMARY KEY,
  data         DATE NOT NULL,
  valor        NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
  descricao    TEXT NULL,
  categoria_id BIGINT NULL REFERENCES public.categorias(id) ON DELETE SET NULL,
  whatsapp     TEXT NULL, -- opcional
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Nova tabela: Contas (a pagar e a receber)
CREATE TABLE public.contas (
  id                 BIGSERIAL PRIMARY KEY,
  descricao          TEXT NOT NULL,
  valor              NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
  data_vencimento    DATE NOT NULL,
  tipo               TEXT NOT NULL CHECK (tipo IN ('a_pagar', 'a_receber')),
  status             TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'recebida', 'vencida')),
  categoria_id       BIGINT REFERENCES public.categorias(id) ON DELETE SET NULL,
  data_pagamento_recebimento DATE NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  whatsapp           TEXT NULL -- opcional
);

-- Nova tabela: Cartões (padrão do template, sem permissões adicionais)
CREATE TABLE public.cartoes (
  id               BIGSERIAL NOT NULL,
  nome_exibicao    TEXT NOT NULL,
  apelido          TEXT NULL,
  bandeira         TEXT NULL,
  final_cartao     TEXT NULL,
  limite_total     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  valor_utilizado  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  valor_disponivel NUMERIC(12, 2) NOT NULL DEFAULT 0,
  uso_percentual   NUMERIC(5, 2) NULL DEFAULT 0,
  criado_em        TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT now(),
  emissor          TEXT NULL,
  is_principal     BOOLEAN NULL,
  CONSTRAINT cartoes_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- ---------- Índices úteis ----------
CREATE INDEX entradas_data_idx    ON public.entradas (data);
CREATE INDEX saidas_data_idx      ON public.saidas (data);
CREATE INDEX entradas_cat_idx     ON public.entradas (categoria_id);
CREATE INDEX saidas_cat_idx       ON public.saidas (categoria_id);
CREATE INDEX contas_tipo_idx      ON public.contas (tipo);
CREATE INDEX contas_status_idx    ON public.contas (status);
CREATE INDEX contas_data_vencimento_idx ON public.contas (data_vencimento);
CREATE INDEX contas_categoria_idx ON public.contas (categoria_id);

-- ---------- Views para os 3 gráficos ----------

-- 1) Barras: Entradas vs Saídas por mês
CREATE OR REPLACE VIEW public.vw_entradas_saidas_mensal AS
WITH e AS (
  SELECT date_trunc('month', data) AS mes, SUM(valor) AS total_entradas
  FROM public.entradas GROUP BY 1
),
s AS (
  SELECT date_trunc('month', data) AS mes, SUM(valor) AS total_saidas
  FROM public.saidas GROUP BY 1
)
SELECT
  COALESCE(e.mes, s.mes) AS mes,
  COALESCE(e.total_entradas, 0) AS total_entradas,
  COALESCE(s.total_saidas, 0)   AS total_saidas
FROM e FULL OUTER JOIN s ON e.mes = s.mes
ORDER BY mes;

-- 2) Donut: Distribuição das Saídas por Categoria
CREATE OR REPLACE VIEW public.vw_saidas_por_categoria AS
SELECT
  c.id AS categoria_id,
  COALESCE(c.nome, 'Sem categoria') AS categoria,
  SUM(s.valor) AS total_saidas
FROM public.saidas s
LEFT JOIN public.categorias c ON c.id = s.categoria_id
GROUP BY c.id, c.nome
ORDER BY total_saidas DESC;

-- 3) Linha: Evolução do Saldo (acumulado)
CREATE OR REPLACE VIEW public.vw_saldo_diario AS
WITH dias AS (
  SELECT GENERATE_SERIES(
    LEAST(
      COALESCE((SELECT MIN(data) FROM public.entradas), CURRENT_DATE),
      COALESCE((SELECT MIN(data) FROM public.saidas),   CURRENT_DATE)
    ),
    GREATEST(
      COALESCE((SELECT MAX(data) FROM public.entradas), CURRENT_DATE),
      COALESCE((SELECT MAX(data) FROM public.saidas),   CURRENT_DATE)
    ),
    INTERVAL '1 day'
  )::date AS dia
),
e AS (SELECT data AS dia, SUM(valor) AS entradas_dia FROM public.entradas GROUP BY 1),
s AS (SELECT data AS dia, SUM(valor) AS saidas_dia   FROM public.saidas   GROUP BY 1),
base AS (
  SELECT
    d.dia,
    COALESCE(e.entradas_dia, 0) AS entradas_dia,
    COALESCE(s.saidas_dia,  0) AS saidas_dia,
    COALESCE(e.entradas_dia, 0) - COALESCE(s.saidas_dia, 0) AS saldo_dia
  FROM dias d
  LEFT JOIN e ON e.dia = d.dia
  LEFT JOIN s ON s.dia = d.dia
)
SELECT
  dia,
  entradas_dia,
  saidas_dia,
  SUM(saldo_dia) OVER (ORDER BY dia) AS saldo_acumulado
FROM base
ORDER BY dia;

-- Nova view: Contas por vencer (próximos 30 dias)
CREATE OR REPLACE VIEW public.vw_contas_vencer AS
SELECT
  id,
  descricao,
  valor,
  data_vencimento,
  tipo,
  status,
  categoria_id,
  whatsapp,
  created_at
FROM public.contas
WHERE data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND status = 'pendente'
ORDER BY data_vencimento;

-- Nova view: Contas vencidas
CREATE OR REPLACE VIEW public.vw_contas_vencidas AS
SELECT
  id,
  descricao,
  valor,
  data_vencimento,
  tipo,
  status,
  categoria_id,
  whatsapp,
  created_at
FROM public.contas
WHERE data_vencimento < CURRENT_DATE
  AND status = 'pendente'
ORDER BY data_vencimento;

-- ---------------------------------
-- Nova tabela: Tarefas (genérica)
-- ---------------------------------
CREATE TABLE IF NOT EXISTS public.tarefas (
  id          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  titulo      TEXT NULL,
  descricao   TEXT NULL,
  concluida   BOOLEAN NOT NULL DEFAULT false
) TABLESPACE pg_default;

-- Função para atualizar automaticamente o status com base na data de vencimento
CREATE OR REPLACE FUNCTION atualizar_status_contas()
RETURNS TRIGGER AS $
BEGIN
  IF NEW.data_vencimento < CURRENT_DATE AND NEW.status = 'pendente' THEN
    NEW.status := 'vencida';
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger para atualizar o status automaticamente ao inserir ou atualizar
CREATE TRIGGER trigger_atualizar_status_contas
  BEFORE INSERT OR UPDATE ON public.contas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_status_contas();

-- Índices úteis para filtros e ordenação
CREATE INDEX IF NOT EXISTS idx_tarefas_concluida  ON public.tarefas (concluida);
CREATE INDEX IF NOT EXISTS idx_tarefas_created_at ON public.tarefas (created_at DESC);