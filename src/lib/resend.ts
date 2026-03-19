import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

// Sends a notification to the Balal Finance admin when a new tenant signs up
export async function sendNewTenantAlert({
  tenantName,
  ownerEmail,
  shopName,
  phone,
  signupTime,
}: {
  tenantName: string
  ownerEmail: string
  shopName: string
  phone?: string
  signupTime: string
}) {
  await resend.emails.send({
    from: 'Balal Finance Alerts <alerts@balal.in>',
    to: process.env.ADMIN_NOTIFICATION_EMAIL!,
    subject: `New signup: ${tenantName} — ${shopName}`,
    html: `
      <h2>New Balal Finance Signup</h2>
      <table>
        <tr><td><b>Owner Name</b></td><td>${tenantName}</td></tr>
        <tr><td><b>Email</b></td><td>${ownerEmail}</td></tr>
        <tr><td><b>Shop Name</b></td><td>${shopName}</td></tr>
        <tr><td><b>Phone</b></td><td>${phone || 'Not provided'}</td></tr>
        <tr><td><b>Signed up at</b></td><td>${signupTime}</td></tr>
      </table>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">
          Open Admin Panel
        </a>
      </p>
    `,
  })
}

// Sends trial expiry warning to the shop owner
export async function sendTrialExpiryWarning({
  ownerEmail,
  ownerName,
  daysLeft,
}: {
  ownerEmail: string
  ownerName: string
  daysLeft: number
}) {
  await resend.emails.send({
    from: 'Balal Finance <hello@balal.in>',
    to: ownerEmail,
    subject: `Your Balal Finance trial ends in ${daysLeft} days`,
    html: `
      <h2>Hi ${ownerName},</h2>
      <p>Your free trial ends in <b>${daysLeft} days</b>.</p>
      <p>To keep using Balal Finance, please contact us on WhatsApp to complete your payment.</p>
      <p>
        <a href="https://wa.me/91XXXXXXXXXX">
          Chat with us on WhatsApp
        </a>
      </p>
      <p>— Team Balal Finance</p>
    `,
  })
}
