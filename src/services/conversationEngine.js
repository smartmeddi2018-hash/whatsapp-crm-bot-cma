const crmService = require('./crmService');
const whatsappService = require('./whatsappService');
const sessionManager = require('./sessionManager');

/**
 * Motor de fluxo conversacional
 * Processa mensagens e gerencia o fluxo de agendamento
 */

/**
 * Processa mensagens recebidas
 */
async function processarMensagem(numeroTelefone, mensagem, messageId) {
  try {
    // Marca como lida
    await whatsappService.marcarComoLida(messageId);

    const session = sessionManager.getSession(numeroTelefone);
    const step = session.step;
    const userMessage = mensagem.toLowerCase().trim();

    console.log(`📱 Mensagem de ${numeroTelefone}: "${mensagem}" (Step: ${step})`);

    switch (step) {
      case 'inicio':
        return await handleInicio(numeroTelefone, userMessage);
      
      case 'selecionando_convenio':
        return await handleSelecionarConvenio(numeroTelefone, userMessage);
      
      case 'selecionando_especialidade':
        return await handleSelecionarEspecialidade(numeroTelefone, userMessage);
      
      case 'selecionando_procedimento':
        return await handleSelecionarProcedimento(numeroTelefone, userMessage);
      
      case 'selecionando_profissional':
        return await handleSelecionarProfissional(numeroTelefone, userMessage);
      
      case 'selecionando_horario':
        return await handleSelecionarHorario(numeroTelefone, userMessage);
      
      case 'coletando_cpf':
        return await handleColetarCPF(numeroTelefone, userMessage);
      
      case 'coletando_nome':
        return await handleColetarNome(numeroTelefone, userMessage);
      
      case 'coletando_data_nascimento':
        return await handleColetarDataNascimento(numeroTelefone, userMessage);
      
      case 'confirmando_agendamento':
        return await handleConfirmarAgendamento(numeroTelefone, userMessage);
      
      default:
        return await handleInicio(numeroTelefone, userMessage);
    }
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    await whatsappService.enviarMensagem(numeroTelefone, 
      '❌ Desculpe, ocorreu um erro. Por favor, tente novamente ou fale com um atendente.');
  }
}

/**
 * Etapa inicial - Menu principal
 */
async function handleInicio(numeroTelefone, mensagem) {
  sessionManager.resetSession(numeroTelefone);

  const texto = `Olá! 👋 Sou o assistente virtual da CMA. Como posso ajudar você hoje?`;
  
  const botoes = [
    { title: '1️⃣ Agendar Consulta' },
    { title: '2️⃣ Falar com Atendente' }
  ];

  await whatsappService.enviarMensagemComBotoes(numeroTelefone, texto, botoes);
}

/**
 * Selecionar convênio
 */
async function handleSelecionarConvenio(numeroTelefone, mensagem) {
  try {
    const convenios = await crmService.getConvenios();
    
    // Limita a 10 convênios mais comuns
    const conveniosTop = convenios.slice(0, 10);
    
    const itens = conveniosTop.map(conv => ({
      title: conv.descricao,
      description: `ID: ${conv.id}`
    }));

    const texto = '💳 Qual convênio você gostaria de utilizar?';
    
    sessionManager.updateSession(numeroTelefone, 'selecionando_convenio', {
      convenios: convenios
    });

    await whatsappService.enviarMensagemComLista(numeroTelefone, texto, 'Selecione', itens);
  } catch (error) {
    console.error('Erro ao listar convênios:', error);
    await whatsappService.enviarMensagem(numeroTelefone, 
      '❌ Não consegui buscar os convênios. Tente novamente.');
  }
}

/**
 * Selecionar especialidade
 */
async function handleSelecionarEspecialidade(numeroTelefone, mensagem) {
  try {
    const session = sessionManager.getSession(numeroTelefone);
    
    // Extrai o ID do convênio da mensagem
    const convenioId = extrairIdDaMensagem(mensagem, session.data.convenios);
    
    if (!convenioId) {
      await whatsappService.enviarMensagem(numeroTelefone, 
        '❌ Convênio não reconhecido. Por favor, selecione novamente.');
      return;
    }

    const especialidades = await crmService.getEspecialidades();
    const especialidadesTop = especialidades.slice(0, 10);
    
    const itens = especialidadesTop.map(esp => ({
      title: esp.descricao,
      description: `ID: ${esp.id}`
    }));

    const texto = '🏥 Qual especialidade médica você está procurando?';
    
    sessionManager.updateSession(numeroTelefone, 'selecionando_especialidade', {
      convenio: convenioId,
      especialidades: especialidades
    });

    await whatsappService.enviarMensagemComLista(numeroTelefone, texto, 'Selecione', itens);
  } catch (error) {
    console.error('Erro ao listar especialidades:', error);
    await whatsappService.enviarMensagem(numeroTelefone, 
      '❌ Não consegui buscar as especialidades. Tente novamente.');
  }
}

/**
 * Selecionar procedimento
 */
async function handleSelecionarProcedimento(numeroTelefone, mensagem) {
  try {
    const session = sessionManager.getSession(numeroTelefone);
    const especialidadeId = extrairIdDaMensagem(mensagem, session.data.especialidades);

    if (!especialidadeId) {
      await whatsappService.enviarMensagem(numeroTelefone, 
        '❌ Especialidade não reconhecida. Por favor, selecione novamente.');
      return;
    }

    const procedimentos = await crmService.getProcedimentos(especialidadeId);
    const procedimentosTop = procedimentos.slice(0, 10);
    
    const itens = procedimentosTop.map(proc => ({
      title: proc.descricao,
      description: `ID: ${proc.id}`
    }));

    const texto = '📋 Qual o tipo de atendimento?';
    
    sessionManager.updateSession(numeroTelefone, 'selecionando_procedimento', {
      especialidade: especialidadeId,
      procedimentos: procedimentos
    });

    await whatsappService.enviarMensagemComLista(numeroTelefone, texto, 'Selecione', itens);
  } catch (error) {
    console.error('Erro ao listar procedimentos:', error);
    await whatsappService.enviarMensagem(numeroTelefone, 
      '❌ Não consegui buscar os procedimentos. Tente novamente.');
  }
}

/**
 * Selecionar profissional
 */
async function handleSelecionarProfissional(numeroTelefone, mensagem) {
  try {
    const session = sessionManager.getSession(numeroTelefone);
    const procedimentoId = extrairIdDaMensagem(mensagem, session.data.procedimentos);

    if (!procedimentoId) {
      await whatsappService.enviarMensagem(numeroTelefone, 
        '❌ Procedimento não reconhecido. Por favor, selecione novamente.');
      return;
    }

    const profissionais = await crmService.getProfissionais(session.data.especialidade, procedimentoId);
    
    const itens = [
      { title: '⏱️ Primeiro horário disponível', description: 'Qualquer profissional' },
      ...profissionais.slice(0, 9).map(prof => ({
        title: prof.descricao,
        description: `CRM: ${prof.crm || 'N/A'}`
      }))
    ];

    const texto = '👨‍⚕️ Você tem preferência por algum médico(a)?';
    
    sessionManager.updateSession(numeroTelefone, 'selecionando_profissional', {
      procedimento: procedimentoId,
      profissionais: profissionais
    });

    await whatsappService.enviarMensagemComLista(numeroTelefone, texto, 'Selecione', itens);
  } catch (error) {
    console.error('Erro ao listar profissionais:', error);
    await whatsappService.enviarMensagem(numeroTelefone, 
      '❌ Não consegui buscar os profissionais. Tente novamente.');
  }
}

/**
 * Selecionar horário
 */
async function handleSelecionarHorario(numeroTelefone, mensagem) {
  try {
    const session = sessionManager.getSession(numeroTelefone);
    const profissionalId = extrairIdDaMensagem(mensagem, session.data.profissionais) || 0;

    const horarios = await crmService.getHorarios(
      session.data.convenio,
      session.data.especialidade,
      session.data.procedimento,
      profissionalId
    );

    if (horarios.length === 0) {
      await whatsappService.enviarMensagem(numeroTelefone, 
        '😞 Poxa, não encontrei horários disponíveis para essa especialidade no momento. Deseja buscar outra especialidade?');
      sessionManager.resetSession(numeroTelefone);
      return;
    }

    const itens = horarios.slice(0, 10).map(hor => ({
      title: `${hor.data} - ${hor.hora}`,
      description: hor.profnome
    }));

    const texto = '📅 Aqui estão os próximos horários disponíveis:';
    
    sessionManager.updateSession(numeroTelefone, 'selecionando_horario', {
      profissional: profissionalId,
      horarios: horarios
    });

    await whatsappService.enviarMensagemComLista(numeroTelefone, texto, 'Selecione', itens);
  } catch (error) {
    console.error('Erro ao listar horários:', error);
    await whatsappService.enviarMensagem(numeroTelefone, 
      '❌ Não consegui buscar os horários. Tente novamente.');
  }
}

/**
 * Coletar CPF
 */
async function handleColetarCPF(numeroTelefone, mensagem) {
  const cpf = mensagem.replace(/\D/g, '');

  if (cpf.length !== 11) {
    await whatsappService.enviarMensagem(numeroTelefone, 
      '❌ CPF inválido. Por favor, digite apenas os 11 dígitos (ex: 12345678900).');
    return;
  }

  try {
    const paciente = await crmService.consultarPaciente(cpf);
    
    if (paciente) {
      const nomePaciente = paciente.nome || 'Paciente';
      await whatsappService.enviarMensagem(numeroTelefone, 
        `✅ Encontrei seu cadastro, ${nomePaciente}! Confirmar agendamento?`);
      
      sessionManager.updateSession(numeroTelefone, 'confirmando_agendamento', {
        cpf: cpf,
        pacienteEncontrado: true
      });
    } else {
      await whatsappService.enviarMensagem(numeroTelefone, 
        '📝 Não encontrei seu cadastro. Por favor, digite seu **Nome Completo**:');
      
      sessionManager.updateSession(numeroTelefone, 'coletando_nome', {
        cpf: cpf,
        pacienteEncontrado: false
      });
    }
  } catch (error) {
    console.error('Erro ao consultar paciente:', error);
    await whatsappService.enviarMensagem(numeroTelefone, 
      '❌ Erro ao consultar cadastro. Tente novamente.');
  }
}

/**
 * Coletar nome
 */
async function handleColetarNome(numeroTelefone, mensagem) {
  const nome = mensagem.trim();

  if (nome.length < 3) {
    await whatsappService.enviarMensagem(numeroTelefone, 
      '❌ Nome inválido. Por favor, digite seu nome completo.');
    return;
  }

  await whatsappService.enviarMensagem(numeroTelefone, 
    '📅 Agora, sua **Data de Nascimento** (DD/MM/AAAA):');
  
  sessionManager.updateSession(numeroTelefone, 'coletando_data_nascimento', {
    nome: nome
  });
}

/**
 * Coletar data de nascimento
 */
async function handleColetarDataNascimento(numeroTelefone, mensagem) {
  const dataParts = mensagem.split('/');
  
  if (dataParts.length !== 3 || dataParts[0].length !== 2 || dataParts[1].length !== 2 || dataParts[2].length !== 4) {
    await whatsappService.enviarMensagem(numeroTelefone, 
      '❌ Data inválida. Por favor, use o formato DD/MM/AAAA (ex: 15/03/1990).');
    return;
  }

  sessionManager.updateSession(numeroTelefone, 'confirmando_agendamento', {
    dataNascimento: mensagem
  });

  await whatsappService.enviarMensagem(numeroTelefone, 
    '✅ Dados coletados! Confirmar agendamento?');
}

/**
 * Confirmar agendamento
 */
async function handleConfirmarAgendamento(numeroTelefone, mensagem) {
  const confirmacao = mensagem.toLowerCase();

  if (!confirmacao.includes('sim') && !confirmacao.includes('confirmar') && !confirmacao.includes('s')) {
    await whatsappService.enviarMensagem(numeroTelefone, 
      '❌ Agendamento cancelado. Deseja começar novamente?');
    sessionManager.resetSession(numeroTelefone);
    return;
  }

  try {
    const session = sessionManager.getSession(numeroTelefone);
    
    // Dados do agendamento
    const dadosAgendamento = {
      idHorario: session.data.horarioSelecionado,
      cpf: session.data.cpf,
      nome: session.data.nome,
      dataNascimento: session.data.dataNascimento
    };

    // Finaliza o agendamento
    const resultado = await crmService.finalizarAgendamento(dadosAgendamento);

    if (resultado.sucesso) {
      await whatsappService.enviarMensagem(numeroTelefone, 
        `🎉 **Agendamento confirmado com sucesso!**\n\n` +
        `📅 Data: ${session.data.dataHorario}\n` +
        `⏰ Hora: ${session.data.horaHorario}\n` +
        `👨‍⚕️ Profissional: ${session.data.profissionalNome}\n\n` +
        `Chegue com 15 minutos de antecedência e não esqueça sua carteirinha do convênio e documento com foto.\n\n` +
        `Se precisar de mais alguma coisa, é só chamar. Tenha um excelente dia! 💙`);
      
      sessionManager.clearSession(numeroTelefone);
    } else {
      await whatsappService.enviarMensagem(numeroTelefone, 
        '❌ Erro ao confirmar agendamento. Por favor, tente novamente ou fale com um atendente.');
    }
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error);
    await whatsappService.enviarMensagem(numeroTelefone, 
      '❌ Erro ao confirmar agendamento. Por favor, tente novamente ou fale com um atendente.');
  }
}

/**
 * Função auxiliar para extrair ID da mensagem
 */
function extrairIdDaMensagem(mensagem, lista) {
  if (!lista || lista.length === 0) return null;

  const numero = parseInt(mensagem.match(/\d+/)?.[0]);
  if (isNaN(numero) || numero < 1 || numero > lista.length) return null;

  return lista[numero - 1].id;
}

module.exports = {
  processarMensagem
};
