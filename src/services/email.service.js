const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (env.nodeEnv !== 'test' && env.smtpHost && env.smtpUser && env.smtpPass) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  } else {
    // Fallback para desenvolvimento / testes quando credenciais SMTP não estão configuradas
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

/**
 * Envia e-mail com código de verificação para redefinição de senha
 * @param {string} to - E-mail do destinatário
 * @param {string} code - Código de 6 dígitos
 * @param {string} name - Nome do usuário
 */
async function sendPasswordResetCode(to, code, name = 'Cliente') {
  const mailTransporter = getTransporter();

  const mailOptions = {
    from: env.emailFrom,
    to,
    subject: 'Recuperação de Senha - Blanger Arte Rústica',
    text: `Olá, ${name}!\n\nSeu código para redefinição de senha é: ${code}\nEste código é válido por 15 minutos.\n\nSe você não solicitou este e-mail, por favor desconsidere.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fafafa;">
        <h2 style="color: #4a3525; text-align: center;">Blanger Arte Rústica</h2>
        <hr style="border: 0; border-top: 1px solid #d4a373; margin: 20px 0;" />
        <p style="font-size: 16px; color: #333;">Olá, <strong>${name}</strong>!</p>
        <p style="font-size: 14px; color: #555;">Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #8b4513; background-color: #f4ede4; padding: 12px 24px; border-radius: 6px; border: 1px dashed #8b4513; display: inline-block;">
            ${code}
          </span>
        </div>
        <p style="font-size: 13px; color: #777; text-align: center;">Este código é válido por <strong>15 minutos</strong>.</p>
        <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">Se você não solicitou a redefinição de senha, nenhuma ação é necessária.</p>
      </div>
    `,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    logger.info(`[EmailService] E-mail de recuperação enviado para ${to}. ID: ${info.messageId || 'json-mode'}`);
    return info;
  } catch (error) {
    logger.error(`[EmailService] Erro ao enviar e-mail para ${to}:`, error);
    throw error;
  }
}

module.exports = {
  sendPasswordResetCode,
};
