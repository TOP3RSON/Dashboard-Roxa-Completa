import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Configuracoes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona para a página de configurações de contas
    navigate('/configuracoes/contas');
  }, [navigate]);

  return null;
};

export default Configuracoes;