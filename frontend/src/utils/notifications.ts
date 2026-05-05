/**
 * Exibe uma notificação de sessão expirada com estilo elegante
 */
export function showSessionExpiredNotification() {
  // Criar container da notificação
  const container = document.createElement('div')
  container.id = 'session-expired-notification'
  container.innerHTML = `
    <style>
      @keyframes slideDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      #session-expired-notification {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease-in-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .session-expired-modal {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 48px 40px;
        max-width: 420px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideDown 0.4s ease-out;
      }

      .session-expired-icon {
        font-size: 64px;
        margin-bottom: 20px;
        display: block;
      }

      .session-expired-title {
        font-size: 28px;
        font-weight: 700;
        color: white;
        margin: 0 0 12px 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .session-expired-subtitle {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.9);
        margin: 0 0 24px 0;
        line-height: 1.5;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .session-expired-message {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.85);
        margin-bottom: 32px;
        line-height: 1.6;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .session-expired-button {
        background: white;
        color: #667eea;
        border: none;
        padding: 14px 32px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .session-expired-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }

      .session-expired-button:active {
        transform: translateY(0);
      }

      .session-expired-loader {
        display: inline-block;
        width: 4px;
        height: 4px;
        background: white;
        border-radius: 50%;
        margin: 0 4px;
        animation: blink 1.4s infinite;
      }

      .session-expired-loader:nth-child(1) { animation-delay: 0s; }
      .session-expired-loader:nth-child(2) { animation-delay: 0.2s; }
      .session-expired-loader:nth-child(3) { animation-delay: 0.4s; }

      @keyframes blink {
        0%, 60%, 100% { opacity: 0.3; }
        30% { opacity: 1; }
      }
    </style>

    <div class="session-expired-modal">
      <span class="session-expired-icon">🔐</span>
      <h2 class="session-expired-title">Sessão Expirada</h2>
      <p class="session-expired-subtitle">Sua autenticação expirou</p>
      <p class="session-expired-message">
        Por razões de segurança, sua sessão foi encerrada.
        Por favor, faça login novamente para continuar.
      </p>
      <button class="session-expired-button" id="session-expired-btn">
        Voltar ao Login
      </button>
      <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 16px;">
        Redirecionando em <span id="countdown">3</span>s...
      </p>
    </div>
  `

  document.body.appendChild(container)

  // Botão para redirecionar manualmente
  const btn = document.getElementById('session-expired-btn')
  if (btn) {
    btn.addEventListener('click', () => {
      window.location.href = '/login'
    })
  }

  // Contador de redirecionamento automático
  let countdown = 3
  const countdownEl = document.getElementById('countdown')
  const interval = setInterval(() => {
    countdown--
    if (countdownEl) {
      countdownEl.textContent = countdown.toString()
    }
    if (countdown === 0) {
      clearInterval(interval)
      window.location.href = '/login'
    }
  }, 1000)
}
