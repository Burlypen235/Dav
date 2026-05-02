# CerebraX

CerebraX is a ChatGPT-style AI assistant web app with:

- Multi-chat history
- Model selection
- System prompt support
- File attachment input
- Export chat transcripts
- Local memory (browser storage)
- OpenAI API integration

## Run

Because this is a static app, run a local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

- Create an account and log in from the new auth screen (stored in browser localStorage for demo use only).
- Enter your OpenAI API key when prompted after login (saved per user in localStorage).
- For production-grade parity with ChatGPT (voice mode, tool calling, image generation, retrieval, deep research, auth, billing, moderation, compliance, admin controls), move API calls to a secure backend and add service integrations.
