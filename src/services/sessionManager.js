/**
 * Gerenciador de sessões de usuários
 * Armazena o estado da conversa de cada usuário
 */

const sessions = new Map();

// Tempo de expiração da sessão (30 minutos)
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Cria ou recupera uma sessão
 */
function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      userId,
      step: 'inicio',
      data: {},
      createdAt: Date.now(),
      lastActivity: Date.now()
    });
  }

  const session = sessions.get(userId);
  session.lastActivity = Date.now();

  return session;
}

/**
 * Atualiza o estado da sessão
 */
function updateSession(userId, step, data = {}) {
  const session = getSession(userId);
  session.step = step;
  session.data = { ...session.data, ...data };
  session.lastActivity = Date.now();
  return session;
}

/**
 * Limpa uma sessão
 */
function clearSession(userId) {
  sessions.delete(userId);
}

/**
 * Limpa sessões expiradas
 */
function cleanExpiredSessions() {
  const now = Date.now();
  for (const [userId, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      sessions.delete(userId);
    }
  }
}

/**
 * Retorna o estado atual da sessão
 */
function getSessionState(userId) {
  const session = getSession(userId);
  return {
    step: session.step,
    data: session.data
  };
}

/**
 * Reseta a sessão para o início
 */
function resetSession(userId) {
  sessions.delete(userId);
  return getSession(userId);
}

// Limpa sessões expiradas a cada 5 minutos
setInterval(cleanExpiredSessions, 5 * 60 * 1000);

module.exports = {
  getSession,
  updateSession,
  clearSession,
  getSessionState,
  resetSession,
  cleanExpiredSessions
};
