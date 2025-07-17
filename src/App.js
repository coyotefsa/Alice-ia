import React, { useState, useEffect } from 'react';

const defaultPersona = {
  name: 'Alice',
  personality: 'Flirty, douce, immersive, répond en français.',
  style: 'Familier',
  nsfw: true,
  description: 'Alice est ta partenaire virtuelle, prête pour toutes les discussions, même les plus coquines.',
};

export default function App() {
  const [persona, setPersona] = useState(() => {
    const saved = localStorage.getItem('persona');
    return saved ? JSON.parse(saved) : defaultPersona;
  });
  const [step, setStep] = useState('config'); // 'config' or 'chat'
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    localStorage.setItem('persona', JSON.stringify(persona));
  }, [persona]);

  function buildPrompt(message) {
    return `
Tu es ${persona.name}, une IA avec cette personnalité : ${persona.personality}
Style : ${persona.style}
Description : ${persona.description}
NSFW autorisé : ${persona.nsfw ? 'Oui' : 'Non'}

Utilisateur : ${message}
Réponds en respectant ta personnalité et en français.
    `.trim();
  }

  async function sendMessage() {
    if (!input.trim() || !apiUrl) return alert('Entrez un message et l\'URL de l\'IA');
    const userMessage = input.trim();
    setChat((c) => [...c, { from: 'user', text: userMessage }]);
    setInput('');

    const prompt = buildPrompt(userMessage);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [prompt] }),
      });
      const json = await response.json();
      const botReply = json.data?.[0] || 'Pas de réponse...';

      setChat((c) => [...c, { from: 'bot', text: botReply }]);
    } catch (e) {
      setChat((c) => [...c, { from: 'bot', text: 'Erreur serveur : ' + e.message }]);
    }
  }

  if (step === 'config') {
    return (
      <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
        <h1>Créateur de personnage</h1>
        <label>
          Nom du personnage :<br />
          <input
            value={persona.name}
            onChange={(e) => setPersona({ ...persona, name: e.target.value })}
            style={{ width: '100%', marginBottom: 10 }}
          />
        </label>
        <label>
          Personnalité :<br />
          <textarea
            value={persona.personality}
            onChange={(e) => setPersona({ ...persona, personality: e.target.value })}
            rows={3}
            style={{ width: '100%', marginBottom: 10 }}
          />
        </label>
        <label>
          Style de langage :<br />
          <select
            value={persona.style}
            onChange={(e) => setPersona({ ...persona, style: e.target.value })}
            style={{ width: '100%', marginBottom: 10 }}
          >
            <option>Familier</option>
            <option>Formel</option>
            <option>Argot</option>
            <option>Poétique</option>
          </select>
        </label>
        <label>
          NSFW autorisé :&nbsp;
          <input
            type="checkbox"
            checked={persona.nsfw}
            onChange={(e) => setPersona({ ...persona, nsfw: e.target.checked })}
          />
        </label>
        <br />
        <label>
          Description / prompt initial :<br />
          <textarea
            value={persona.description}
            onChange={(e) => setPersona({ ...persona, description: e.target.value })}
            rows={3}
            style={{ width: '100%', marginBottom: 10 }}
          />
        </label>
        <label>
          URL de l’IA (ex: ton lien Gradio Colab) :<br />
          <input
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://xxxx.gradio.live/api/predict/"
            style={{ width: '100%', marginBottom: 20 }}
          />
        </label>
        <button onClick={() => setStep('chat')} style={{ padding: '10px 20px', fontSize: 16 }}>
          Sauvegarder et commencer à discuter
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>Chat avec {persona.name}</h1>
      <div
        style={{
          border: '1px solid #ccc',
          height: 400,
          overflowY: 'auto',
          padding: 10,
          marginBottom: 10,
          backgroundColor: '#f9f9f9',
        }}
      >
        {chat.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.from === 'user' ? 'right' : 'left',
              margin: '8px 0',
              color: msg.from === 'user' ? 'blue' : 'green',
            }}
          >
            <b>{msg.from === 'user' ? 'Toi' : persona.name} :</b> {msg.text}
          </div>
        ))}
      </div>
      <textarea
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
        placeholder="Écris ton message ici..."
      />
      <button onClick={sendMessage} style={{ padding: '10px 20px', fontSize: 16 }}>
        Envoyer
      </button>
      <br />
      <button onClick={() => setStep('config')} style={{ marginTop: 20 }}>
        Modifier le personnage
      </button>
    </div>
  );
}
