const express = require('express');
const app = express();

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  console.log('Webhook request received:', { mode, token, challenge });
  
  if (mode === 'subscribe' && token === 'whatsapp_webhook_token_cma_2026') {
    console.log('✅ Webhook verified!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.sendStatus(403);
  }
});

app.listen(3000, () => {
  console.log('Test server running on port 3000');
});
