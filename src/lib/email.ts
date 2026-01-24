// Email notification service
// For production, integrate with a service like Resend, SendGrid, or AWS SES

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Check if email service is configured
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL
const EMAIL_API_KEY = process.env.EMAIL_API_KEY

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Skip if email service is not configured
  if (!EMAIL_SERVICE_URL || !EMAIL_API_KEY) {
    console.log('[Email] Service not configured, skipping email:', options.subject)
    return false
  }

  try {
    // This is a placeholder for actual email service integration
    // Replace with your preferred email service (Resend, SendGrid, etc.)
    const response = await fetch(EMAIL_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Collective Sense <noreply@collectivesense.app>',
        ...options,
      }),
    })

    if (!response.ok) {
      console.error('[Email] Failed to send:', await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('[Email] Error sending email:', error)
    return false
  }
}

// Pre-built email templates

export function synthesisReadyEmail(params: {
  problemTitle: string
  synthesisUrl: string
}): EmailOptions {
  const { problemTitle, synthesisUrl } = params

  return {
    to: '', // Will be set by caller
    subject: 'Your collective wisdom is ready',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #3D3D3D; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { color: #E07A5F; font-size: 24px; margin-bottom: 20px; }
            .button { display: inline-block; background: #E07A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8E4E0; color: #8D99AE; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="header">Your collective wisdom is ready</h1>
            <p>The community has contributed their thoughts on your request:</p>
            <p><strong>"${problemTitle}"</strong></p>
            <p>We've synthesised their contributions into collective wisdom just for you.</p>
            <a href="${synthesisUrl}" class="button">View Your Synthesis</a>
            <div class="footer">
              <p>This is a one-time notification. We won't send you any other emails unless you request another synthesis.</p>
              <p>&mdash; Collective Sense</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Your collective wisdom is ready

The community has contributed their thoughts on your request:
"${problemTitle}"

We've synthesised their contributions into collective wisdom just for you.

View your synthesis: ${synthesisUrl}

---
This is a one-time notification. We won't send you any other emails unless you request another synthesis.
- Collective Sense
    `,
  }
}

export function welcomeEmail(params: {
  confirmUrl: string
}): EmailOptions {
  return {
    to: '', // Will be set by caller
    subject: 'Welcome to Collective Sense',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #3D3D3D; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { color: #E07A5F; font-size: 24px; margin-bottom: 20px; }
            .button { display: inline-block; background: #E07A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="header">Welcome to Collective Sense</h1>
            <p>Thank you for joining our community of people helping each other with life's questions.</p>
            <p>Click below to confirm your email and get started:</p>
            <a href="${params.confirmUrl}" class="button">Confirm Email</a>
            <p>&mdash; Collective Sense</p>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to Collective Sense

Thank you for joining our community of people helping each other with life's questions.

Click below to confirm your email and get started:
${params.confirmUrl}

- Collective Sense
    `,
  }
}

export function passwordResetEmail(params: {
  resetUrl: string
}): EmailOptions {
  return {
    to: '', // Will be set by caller
    subject: 'Reset your password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #3D3D3D; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { color: #E07A5F; font-size: 24px; margin-bottom: 20px; }
            .button { display: inline-block; background: #E07A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .warning { color: #8D99AE; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="header">Reset your password</h1>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${params.resetUrl}" class="button">Reset Password</a>
            <p class="warning">If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
            <p>&mdash; Collective Sense</p>
          </div>
        </body>
      </html>
    `,
    text: `
Reset your password

We received a request to reset your password. Click the link below to create a new password:
${params.resetUrl}

If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.

- Collective Sense
    `,
  }
}
