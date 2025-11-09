-- Migration para adicionar campo de status na tabela tarefas

-- Adiciona uma nova coluna status com valores possíveis
ALTER TABLE tarefas 
ADD COLUMN status TEXT DEFAULT 'a_fazer' 
CHECK (status IN ('a_fazer', 'em_andamento', 'concluida'));

-- Atualiza os registros com base no campo concluida
UPDATE tarefas 
SET status = 'concluida' 
WHERE concluida = true;

-- Atualiza os registros com base no campo concluida
UPDATE tarefas 
SET status = 'a_fazer' 
WHERE concluida = false OR concluida IS NULL;

-- Opcional: remover o campo concluida se o novo campo status for suficiente
-- ALTER TABLE tarefas DROP COLUMN concluida;