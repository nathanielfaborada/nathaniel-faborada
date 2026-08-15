import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends a password reset email using direct Brevo REST API (https://api.brevo.com/v3/smtp/email).
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise<{ success: boolean, messageId?: string }>}
 */
export async function sendResetPasswordEmail(email, resetToken) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'faboradanathaniel@gmail.com';
  const senderName = 'Portfolio Admin';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:1234';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

  if (!apiKey || apiKey.startsWith('your_') || apiKey === '') {
    console.warn('\n=======================================================');
    console.warn('⚠️ [DEV MODE] BREVO_API_KEY is not configured.');
    console.warn(`📧 Intended Recipient: ${email}`);
    console.warn(`🔗 Password Reset Link: ${resetLink}`);
    console.warn('=======================================================\n');
    return {
      success: true,
      simulated: true,
      message: 'Simulated email send in development mode.',
      previewLink: resetLink,
    };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Portfolio Admin Password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f0f2f5;
          margin: 0;
          padding: 30px 15px;
          color: #1c1e21;
        }
        .container {
          max-width: 560px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          border: 1px solid #e4e6eb;
        }
        .header {
          background: #1877f2;
          padding: 24px 30px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }
        .content {
          padding: 32px 30px;
          line-height: 1.6;
          font-size: 15px;
        }
        .greeting {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #050505;
        }
        .btn-wrapper {
          text-align: center;
          margin: 28px 0;
        }
        .reset-btn {
          display: inline-block;
          background-color: #1877f2;
          color: #ffffff !important;
          text-decoration: none;
          padding: 13px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 2px 6px rgba(24, 119, 242, 0.3);
        }
        .reset-btn:hover {
          background-color: #166fe5;
        }
        .notice-box {
          background-color: #fff9e6;
          border-left: 4px solid #f59e0b;
          padding: 12px 16px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 13.5px;
          color: #854d0e;
        }
        .footer {
          background-color: #f7f8fa;
          padding: 18px 30px;
          text-align: center;
          font-size: 12px;
          color: #65676b;
          border-top: 1px solid #e4e6eb;
        }
        .url-text {
          word-break: break-all;
          color: #1877f2;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Portfolio Admin Password Reset</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello Admin,</div>
          <p>We received a request to reset your password for the Portfolio Admin Dashboard.</p>
          <p>Click the button below to choose a new password:</p>
          
          <div class="btn-wrapper">
            <a href="${resetLink}" target="_blank" class="reset-btn">Reset My Password</a>
          </div>

          <div class="notice-box">
            ⏰ <strong>Important:</strong> This password reset link is valid for <strong>1 hour</strong>. If you did not make this request, you can safely ignore this email.
          </div>

          <p style="font-size: 13px; color: #65676b; margin-top: 24px;">
            If the button above does not work, copy and paste this link into your browser:
            <br>
            <a href="${resetLink}" class="url-text">${resetLink}</a>
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Nathaniel Faborada Portfolio. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: email,
          },
        ],
        subject: 'Reset Your Portfolio Admin Password',
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || `Brevo API error with HTTP status ${response.status}`;
      console.error('❌ Brevo API error response:', data);
      throw new Error(errorMsg);
    }

    console.log(`✅ Password reset email sent via Brevo REST API to ${email}. Message ID:`, data?.messageId || 'Success');

    return {
      success: true,
      messageId: data?.messageId,
    };
  } catch (error) {
    console.error('❌ Failed to send password reset email via Brevo REST API:', error.message);
    throw new Error(error.message || 'Failed to send transactional email via Brevo.');
  }
}

// Alias for backwards compatibility
export const sendPasswordResetEmail = sendResetPasswordEmail;

export default {
  sendResetPasswordEmail,
  sendPasswordResetEmail,
};
