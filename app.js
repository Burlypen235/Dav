const chatEl = document.getElementById('chat');
const historyEl = document.getElementById('history');
const form = document.getElementById('composer');
const messageEl = document.getElementById('message');
const modelEl = document.getElementById('model');
const systemPromptEl = document.getElementById('systemPrompt');
const fileUploadEl = document.getElementById('fileUpload');

const API_KEY = localStorage.getItem('cerebrax_api_key') || '';
if (!API_KEY) {
  const key = prompt('Enter your OpenAI API key for CerebraX:');
  if (key) localStorage.setItem('cerebrax_api_key', key.trim());
}

let chats = JSON.parse(localStorage.getItem('cerebrax_chats') || '[]');
let activeChatId = null;

function save() {
  localStorage.setItem('cerebrax_chats', JSON.stringify(chats));
}

function newChat() {
  activeChatId = crypto.randomUUID();
  chats.unshift({ id: activeChatId, title: 'New chat', messages: [] });
  save();
  render();
}

function activeChat() {
  return chats.find(c => c.id === activeChatId);
}

function render() {
  historyEl.innerHTML = '';
  chats.forEach(c => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.textContent = c.title;
    item.onclick = () => { activeChatId = c.id; render(); };
    historyEl.appendChild(item);
  });

  chatEl.innerHTML = '';
  const c = activeChat();
  if (!c) return;
  c.messages.forEach(m => pushMessage(m.role, m.content, false));
}

function pushMessage(role, content, append = true) {
  const div = document.createElement('div');
  div.className = `message ${role === 'user' ? 'user' : 'assistant'}`;
  div.textContent = content;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;

  if (append) {
    const c = activeChat();
    c.messages.push({ role, content });
    if (c.messages.length === 1 && role === 'user') c.title = content.slice(0, 30) || 'New chat';
    save();
    render();
  }
  return div;
}

async function askCerebraX() {
  const c = activeChat();
  if (!c) return;

  const systemPrompt = systemPromptEl.value.trim();
  const inputMessages = c.messages.map(m => ({ role: m.role, content: m.content }));
  if (systemPrompt) inputMessages.unshift({ role: 'system', content: systemPrompt });

  const assistantBubble = pushMessage('assistant', 'Thinking...', false);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('cerebrax_api_key') || API_KEY}`
    },
    body: JSON.stringify({
      model: modelEl.value,
      messages: inputMessages,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    assistantBubble.textContent = `Error: ${errText}`;
    return;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || 'No response';
  assistantBubble.remove();
  pushMessage('assistant', content, true);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = messageEl.value.trim();
  if (!text) return;

  pushMessage('user', text, true);
  messageEl.value = '';

  const files = [...fileUploadEl.files];
  if (files.length) {
    const names = files.map(f => f.name).join(', ');
    pushMessage('assistant', `Files attached: ${names}. (Wire document processing in your backend for production.)`, true);
  }

  await askCerebraX();
});

document.getElementById('newChat').onclick = newChat;
document.getElementById('clearBtn').onclick = () => {
  chats = [];
  activeChatId = null;
  save();
  newChat();
};
document.getElementById('exportBtn').onclick = () => {
  const c = activeChat();
  if (!c) return;
  const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${c.title || 'cerebrax-chat'}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

if (!chats.length) newChat();
else activeChatId = chats[0].id;
render();
