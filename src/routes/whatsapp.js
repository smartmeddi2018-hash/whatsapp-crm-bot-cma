const express = require('express');
const router = express.Router();
const conversationEngine = require('../services/conversationEngine');

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'seu_token_verificacao';

/**
 * GET /api/whatsapp/webhook
 * Verifica o webhook com a WhatsApp Cloud API
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verificado com sucesso!');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Token de verificação inválido');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

/**
 * POST /api/whatsapp/webhook
 * Recebe mensagens da WhatsApp Cloud API
 */
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Verifica se é um evento de mensagem
    if (body.object) {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
        const mensagens = body.entry[0].changes[0].value.messages;
        const contatos = body.entry[0].changes[0].value.contacts;

        for (let msg of mensagens) {
          const numeroTelefone = msg.from;
          const messageId = msg.id;
          const tipo = msg.type;

          console.log(`\n📨 Mensagem recebida:`);
          console.log(`   De: ${numeroTelefone}`);
          console.log(`   Tipo: ${tipo}`);
          console.log(`   ID: ${messageId}`);

          // Processa apenas mensagens de texto
          if (tipo === 'text') {
            const texto = msg.text.body;
            console.log(`   Texto: ${texto}`);

            // Processa a mensagem através do motor de conversa
            await conversationEngine.processarMensagem(numeroTelefone, texto, messageId);
          } else if (tipo === 'button') {
            // Processa cliques em botões
            const textoResposta = msg.button.text;
            console.log(`   Botão: ${textoResposta}`);

            await conversationEngine.processarMensagem(numeroTelefone, textoResposta, messageId);
          } else if (tipo === 'interactive') {
            // Processa seleções em listas
            const textoResposta = msg.interactive.list_reply?.title || 
                                  msg.interactive.button_reply?.title || 
                                  'Seleção';
            console.log(`   Seleção: ${textoResposta}`);

            await conversationEngine.processarMensagem(numeroTelefone, textoResposta, messageId);
          }
        }
      }

      // Retorna 200 OK para confirmar recebimento
      res.status(200).json({ received: true });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

module.exports = router;
