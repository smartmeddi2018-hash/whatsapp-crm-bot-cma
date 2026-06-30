const axios = require('axios');

const CRM_BASE_URL = process.env.CRM_BASE_URL || 'https://apimarcacao.priorizesenhas.com.br';
const CRM_SERIAL = process.env.CRM_SERIAL || '0Pu5500l11';
const CRM_EMPRESA = process.env.CRM_EMPRESA || 'CMA';

// Configuração padrão para requisições
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Content-Length': '0'
};

/**
 * Busca convênios disponíveis
 */
async function getConvenios() {
  try {
    const url = `${CRM_BASE_URL}/Agendamento/AgendaListagens`;
    const response = await axios.post(url, null, {
      params: {
        serial: CRM_SERIAL,
        empresa: CRM_EMPRESA,
        tipo: 3,
        id: 0,
        id2: 0
      },
      headers: defaultHeaders
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar convênios:', error.message);
    throw error;
  }
}

/**
 * Busca especialidades disponíveis
 */
async function getEspecialidades() {
  try {
    const url = `${CRM_BASE_URL}/Agendamento/AgendaListagens`;
    const response = await axios.post(url, null, {
      params: {
        serial: CRM_SERIAL,
        empresa: CRM_EMPRESA,
        tipo: 0,
        id: 0,
        id2: 0
      },
      headers: defaultHeaders
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar especialidades:', error.message);
    throw error;
  }
}

/**
 * Busca procedimentos de uma especialidade
 */
async function getProcedimentos(idEspecialidade) {
  try {
    const url = `${CRM_BASE_URL}/Agendamento/AgendaListagens`;
    const response = await axios.post(url, null, {
      params: {
        serial: CRM_SERIAL,
        empresa: CRM_EMPRESA,
        tipo: 1,
        id: idEspecialidade,
        id2: 0
      },
      headers: defaultHeaders
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar procedimentos:', error.message);
    throw error;
  }
}

/**
 * Busca profissionais de uma especialidade e procedimento
 */
async function getProfissionais(idEspecialidade, idProcedimento) {
  try {
    const url = `${CRM_BASE_URL}/Agendamento/AgendaListagens`;
    const response = await axios.post(url, null, {
      params: {
        serial: CRM_SERIAL,
        empresa: CRM_EMPRESA,
        tipo: 2,
        id: idEspecialidade,
        id2: idProcedimento
      },
      headers: defaultHeaders
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error.message);
    throw error;
  }
}

/**
 * Busca horários disponíveis
 */
async function getHorarios(convenio, especialidade, procedimento, profissional = 0) {
  try {
    const url = `${CRM_BASE_URL}/Agendamento/AgendaHorarios`;
    const response = await axios.post(url, null, {
      params: {
        serial: CRM_SERIAL,
        empresa: CRM_EMPRESA,
        conv: convenio,
        esp: especialidade,
        proc: procedimento,
        prof: profissional
      },
      headers: defaultHeaders
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar horários:', error.message);
    throw error;
  }
}

/**
 * Consulta dados do paciente
 */
async function consultarPaciente(cpf) {
  try {
    const url = `${CRM_BASE_URL}/Agendamento/AgendaPacientes`;
    const response = await axios.post(url, { cpf }, {
      params: {
        serial: CRM_SERIAL,
        empresa: CRM_EMPRESA
      },
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao consultar paciente:', error.message);
    throw error;
  }
}

/**
 * Finaliza o agendamento
 */
async function finalizarAgendamento(dados) {
  try {
    const url = `${CRM_BASE_URL}/Agendamento/setMarcar`;
    const response = await axios.post(url, dados, {
      params: {
        serial: CRM_SERIAL,
        empresa: CRM_EMPRESA
      },
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao finalizar agendamento:', error.message);
    throw error;
  }
}

module.exports = {
  getConvenios,
  getEspecialidades,
  getProcedimentos,
  getProfissionais,
  getHorarios,
  consultarPaciente,
  finalizarAgendamento
};
