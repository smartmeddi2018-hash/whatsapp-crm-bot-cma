# 📱 Bot de Agendamento WhatsApp - Integração CRM PriorizesenhaS

Este projeto é um servidor Node.js que atua como ponte entre a **WhatsApp Cloud API** e o **CRM PriorizesenhaS**. Ele fornece um bot conversacional que permite aos pacientes agendar consultas de forma automatizada e intuitiva pelo WhatsApp.

## 🚀 Arquitetura do Sistema

O sistema foi desenvolvido utilizando a seguinte arquitetura:

1. **Servidor Node.js/Express**: Gerencia as requisições HTTP e webhooks.
2. **Motor Conversacional**: Controla o estado da sessão de cada usuário e define qual mensagem enviar.
3. **Serviço CRM**: Realiza a comunicação direta com a API do PriorizesenhaS.
4. **Serviço WhatsApp**: Envia mensagens interativas (botões, listas) utilizando a API Oficial da Meta.

## 📋 Pré-requisitos

Para rodar este projeto, você precisará de:

- **Node.js** (v16 ou superior)
- Conta no **Meta for Developers** com um aplicativo WhatsApp configurado
- Número de telefone verificado na **WhatsApp Business API**
- Credenciais de acesso da API do CRM (Serial e Empresa)

## ⚙️ Instalação e Configuração

### Passo 1: Clonar e Instalar Dependências

```bash
git clone <url-do-repositorio>
cd whatsapp-crm-bot
npm install
```

### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# WhatsApp Cloud API
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_API_TOKEN=seu_token_api_whatsapp
WHATSAPP_WEBHOOK_VERIFY_TOKEN=seu_token_verificacao_webhook

# CRM PriorizesenhaS
CRM_SERIAL=0Pu5500l11
CRM_EMPRESA=CMA
CRM_BASE_URL=https://apimarcacao.priorizesenhas.com.br

# Servidor
PORT=3000
NODE_ENV=development
```

### Passo 3: Executar o Servidor

**Modo de Desenvolvimento:**
```bash
npm run dev
```

**Modo de Produção:**
```bash
npm start
```

## 🌐 Configuração do Webhook no Meta

Para que o WhatsApp envie as mensagens dos clientes para o seu servidor:

1. Seu servidor precisa estar acessível publicamente (use **Ngrok** para testes locais: `ngrok http 3000`).
2. Acesse o [Painel de Desenvolvedores da Meta](https://developers.facebook.com/).
3. Vá em **WhatsApp > Configuração > Webhook**.
4. Clique em **Editar**.
5. Em **URL de retorno de chamada**, insira: `https://seu-dominio.com/api/whatsapp/webhook`
6. Em **Token de verificação**, insira o valor definido em `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
7. Clique em **Verificar e Salvar**.
8. Na seção "Campos do Webhook", inscreva-se no evento `messages`.

## 🐳 Deploy com Docker

O projeto inclui configurações prontas para deploy via Docker.

```bash
# Construir a imagem e rodar o container
docker-compose up -d --build

# Ver os logs
docker-compose logs -f
```

## 🔄 Fluxo de Agendamento

O bot segue o seguinte fluxo estruturado:

1. **Menu Inicial**: Oferece a opção de agendar consulta.
2. **Convênio**: Lista os convênios disponíveis.
3. **Especialidade**: Lista as especialidades médicas.
4. **Procedimento**: Lista os procedimentos da especialidade.
5. **Profissional**: Permite escolher um médico específico ou o primeiro horário livre.
6. **Horário**: Apresenta os próximos horários disponíveis.
7. **Identificação**: Solicita o CPF do paciente.
8. **Confirmação**: Valida os dados e finaliza o agendamento no CRM.

## 📁 Estrutura de Arquivos

- `src/index.js`: Ponto de entrada do servidor.
- `src/routes/whatsapp.js`: Rotas para recebimento e verificação do webhook do WhatsApp.
- `src/routes/crm.js`: Rotas para testar a integração com o CRM diretamente.
- `src/services/crmService.js`: Funções de comunicação com a API do PriorizesenhaS.
- `src/services/whatsappService.js`: Funções para envio de mensagens interativas via Meta API.
- `src/services/conversationEngine.js`: Lógica de controle do fluxo do bot.
- `src/services/sessionManager.js`: Gerenciamento do estado da conversa por usuário.
