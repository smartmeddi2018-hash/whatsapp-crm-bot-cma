const express = require('express');
const router = express.Router();
const crmService = require('../services/crmService');

/**
 * GET /api/crm/convenios
 * Lista todos os convênios disponíveis
 */
router.get('/convenios', async (req, res) => {
  try {
    const convenios = await crmService.getConvenios();
    res.json({
      sucesso: true,
      total: convenios.length,
      dados: convenios
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

/**
 * GET /api/crm/especialidades
 * Lista todas as especialidades disponíveis
 */
router.get('/especialidades', async (req, res) => {
  try {
    const especialidades = await crmService.getEspecialidades();
    res.json({
      sucesso: true,
      total: especialidades.length,
      dados: especialidades
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

/**
 * GET /api/crm/procedimentos/:idEspecialidade
 * Lista procedimentos de uma especialidade
 */
router.get('/procedimentos/:idEspecialidade', async (req, res) => {
  try {
    const { idEspecialidade } = req.params;
    const procedimentos = await crmService.getProcedimentos(idEspecialidade);
    res.json({
      sucesso: true,
      especialidade: idEspecialidade,
      total: procedimentos.length,
      dados: procedimentos
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

/**
 * GET /api/crm/profissionais/:idEspecialidade/:idProcedimento
 * Lista profissionais de uma especialidade e procedimento
 */
router.get('/profissionais/:idEspecialidade/:idProcedimento', async (req, res) => {
  try {
    const { idEspecialidade, idProcedimento } = req.params;
    const profissionais = await crmService.getProfissionais(idEspecialidade, idProcedimento);
    res.json({
      sucesso: true,
      especialidade: idEspecialidade,
      procedimento: idProcedimento,
      total: profissionais.length,
      dados: profissionais
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

/**
 * GET /api/crm/horarios
 * Lista horários disponíveis
 * Query params: convenio, especialidade, procedimento, profissional (opcional)
 */
router.get('/horarios', async (req, res) => {
  try {
    const { convenio, especialidade, procedimento, profissional = 0 } = req.query;

    if (!convenio || !especialidade || !procedimento) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Parâmetros obrigatórios: convenio, especialidade, procedimento'
      });
    }

    const horarios = await crmService.getHorarios(convenio, especialidade, procedimento, profissional);
    res.json({
      sucesso: true,
      filtros: { convenio, especialidade, procedimento, profissional },
      total: horarios.length,
      dados: horarios
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

/**
 * POST /api/crm/consultar-paciente
 * Consulta dados do paciente
 * Body: { cpf: string }
 */
router.post('/consultar-paciente', async (req, res) => {
  try {
    const { cpf } = req.body;

    if (!cpf) {
      return res.status(400).json({
        sucesso: false,
        erro: 'CPF é obrigatório'
      });
    }

    const paciente = await crmService.consultarPaciente(cpf);
    res.json({
      sucesso: true,
      dados: paciente
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

/**
 * POST /api/crm/agendar
 * Finaliza o agendamento
 * Body: { idHorario, cpf, nome, dataNascimento }
 */
router.post('/agendar', async (req, res) => {
  try {
    const { idHorario, cpf, nome, dataNascimento } = req.body;

    if (!idHorario || !cpf) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Parâmetros obrigatórios: idHorario, cpf'
      });
    }

    const resultado = await crmService.finalizarAgendamento({
      idHorario,
      cpf,
      nome,
      dataNascimento
    });

    res.json({
      sucesso: true,
      dados: resultado
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

module.exports = router;
