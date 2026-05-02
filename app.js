const authGateEl = document.getElementById('authGate');
const appRootEl = document.getElementById('appRoot');
const authForm = document.getElementById('authForm');
const authNameEl = document.getElementById('authName');
const authPassEl = document.getElementById('authPass');
const authStatusEl = document.getElementById('authStatus');

const chatEl = document.getElementById('chat');
const historyEl = document.getElementById('history');
const form = document.getElementById('composer');
const messageEl = document.getElementById('message');
const modelEl = document.getElementById('model');
const systemPromptEl = document.getElementById('systemPrompt');
const fileUploadEl = document.getElementById('fileUpload');

let currentUser = localStorage.getItem('cerebrax_current_user') || '';
let chats = [];
let activeChatId = null;

function userKey(suffix) {
  return `cerebrax_${currentUser}_${suffix}`;
}

function getUsers() {
  return JSON.parse(localStorage.getItem('cerebrax_users') || '{}');
}

function saveUsers(users) {
  localStorage.setItem('cerebrax_users', JSON.stringify(users));
}

function setAuthStatus(text, isError = false) {
  authStatusEl.textContent = text;
  authStatusEl.className = isError ? 'status error' : 'status success';
}

function loadChats() {
  chats = JSON.parse(localStorage.getItem(userKey('chats')) || '[]');
}

function saveChats() {
  localStorage.setItem(userKey('chats'), JSON.stringify(chats));
}

function getApiKey() {
  return localStorage.getItem(userKey('api_key')) || '';
}

function ensureApiKey() {
  const existing = getApiKey();
  if (existing) return existing;
  const key = prompt('Enter your OpenAI API key for CerebraX:');
  if (key && key.trim()) {
    localStorage.setItem(userKey('api_key'), key.trim());
    return key.trim();
  }
  return '';
}

function newChat() {
  activeChatId = crypto.randomUUID();
  chats.unshift({ id: activeChatId, title: 'New chat', messages: [] });
  saveChats();
  render();
}

function activeChat() {
  return chats.find((c) => c.id === activeChatId);
}

function render() {
  historyEl.innerHTML = '';
  chats.forEach((c) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `history-item ${c.id === activeChatId ? 'active' : ''}`;
    item.textContent = c.title;
    item.onclick = () => {
      activeChatId = c.id;
      render();
    };
    historyEl.appendChild(item);
  });

  chatEl.innerHTML = '';
  const c = activeChat();
  if (!c) return;
  c.messages.forEach((m) => pushMessage(m.role, m.content, false));
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
    saveChats();
    render();
  }

  return div;
}

async function askCerebraX() {
  const c = activeChat();
  if (!c) return;

  const apiKey = ensureApiKey();
  if (!apiKey) {
    pushMessage('assistant', 'Please add your API key to continue.', true);
    return;
  }

  const systemPrompt = systemPromptEl.value.trim();
  const inputMessages = c.messages.map((m) => ({ role: m.role, content: m.content }));
  if (systemPrompt) inputMessages.unshift({ role: 'system', content: systemPrompt });

  const assistantBubble = pushMessage('assistant', 'Thinking...', false);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
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

function showApp() {
  authGateEl.classList.add('hidden');
  appRootEl.classList.remove('hidden');
  loadChats();
  if (!chats.length) newChat();
  else activeChatId = chats[0].id;
  render();
}

function logout() {
  currentUser = '';
  localStorage.removeItem('cerebrax_current_user');
  chats = [];
  activeChatId = null;
  appRootEl.classList.add('hidden');
  authGateEl.classList.remove('hidden');
  setAuthStatus('Logged out.', false);
}

authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = authNameEl.value.trim().toLowerCase();
  const password = authPassEl.value;
  const users = getUsers();

  if (!users[username] || users[username] !== password) {
    setAuthStatus('Invalid username or password.', true);
    return;
  }

  currentUser = username;
  localStorage.setItem('cerebrax_current_user', username);
  setAuthStatus('Login successful.', false);
  showApp();
});

document.getElementById('registerBtn').onclick = () => {
  const username = authNameEl.value.trim().toLowerCase();
  const password = authPassEl.value;
  if (username.length < 3 || password.length < 6) {
    setAuthStatus('Username must be 3+ chars, password 6+ chars.', true);
    return;
  }

  const users = getUsers();
  if (users[username]) {
    setAuthStatus('Username already exists.', true);
    return;
  }

  users[username] = password;
  saveUsers(users);
  setAuthStatus('Account created. Please log in.', false);
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = messageEl.value.trim();
  if (!text) return;

  pushMessage('user', text, true);
  messageEl.value = '';

  const files = [...fileUploadEl.files];
  if (files.length) {
    const names = files.map((f) => f.name).join(', ');
    pushMessage('assistant', `Files attached: ${names}. (Wire document processing in your backend for production.)`, true);
  }

  await askCerebraX();
});

document.getElementById('newChat').onclick = newChat;
document.getElementById('clearBtn').onclick = () => {
  chats = [];
  activeChatId = null;
  saveChats();
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
document.getElementById('logoutBtn').onclick = logout;

if (currentUser) {
  showApp();
}
