const axios = require('axios');

const WHATSAPP_API_URL = 'https://graph.instagram.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_TOKEN = process.env.WHATSAPP_API_TOKEN;

/**
 * Envia uma mensagem de texto simples
 */
async function enviarMensagem(numeroTelefone, texto) {
  try {
    const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;
    
    const response = await axios.post(url, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: numeroTelefone,
      type: 'text',
      text: {
        body: texto
      }
    }, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Envia uma mensagem com botões (até 3 botões)
 */
async function enviarMensagemComBotoes(numeroTelefone, texto, botoes) {
  try {
    const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;
    
    const response = await axios.post(url, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: numeroTelefone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: texto
        },
        action: {
          buttons: botoes.map((btn, idx) => ({
            type: 'reply',
            reply: {
              id: `btn_${idx}`,
              title: btn.title
            }
          }))
        }
      }
    }, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem com botões:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Envia uma mensagem com lista (até 10 itens)
 */
async function enviarMensagemComLista(numeroTelefone, texto, titulo, itens) {
  try {
    const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;
    
    const response = await axios.post(url, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: numeroTelefone,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text: texto
        },
        action: {
          button: titulo,
          sections: [
            {
              title: 'Opções',
              rows: itens.slice(0, 10).map((item, idx) => ({
                id: `item_${idx}`,
                title: item.title,
                description: item.description || ''
              }))
            }
          ]
        }
      }
    }, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem com lista:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Marca mensagem como lida
 */
async function marcarComoLida(messageId) {
  try {
    const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`;
    
    const response = await axios.post(url, {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    }, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  enviarMensagem,
  enviarMensagemComBotoes,
  enviarMensagemComLista,
  marcarComoLida
};
