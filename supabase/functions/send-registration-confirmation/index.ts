import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "GT Esports <noreply@gtesports.co>";

interface RegistrationEmailPayload {
  first_name: string;
  last_name: string;
  email: string;
  admission_type: string;
  school?: string;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { record } = await req.json();

    if (!record || !record.email || !record.first_name || !record.last_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const payload = record as RegistrationEmailPayload;
    const admissionTypeText =
      payload.admission_type === "BYOC"
        ? "Bring Your Own Computer"
        : "General Admission";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #00d4ff; margin: 0 0 10px 0;">You're Registered!</h1>
            <p style="color: #fff; margin: 0;">GT Esports GameFest 2026</p>
          </div>
          
          <div style="padding: 20px 0;">
            <p>Hi ${payload.first_name},</p>
            
            <p>Thank you for registering for GT Esports GameFest 2026! We're excited to have you join us.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1a1a2e;">Registration Details</h3>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${
                payload.first_name
              } ${payload.last_name}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${
                payload.email
              }</p>
              <p style="margin: 8px 0;"><strong>Admission Type:</strong> ${admissionTypeText}</p>
              ${
                payload.school
                  ? `<p style="margin: 8px 0;"><strong>School:</strong> ${payload.school}</p>`
                  : ""
              }
            </div>
            
            <p>We'll send more details about the event soon. In the meantime, feel free to join our Discord for updates!</p>
            
            <a href="https://discord.gg/gtesports" style="display: inline-block; background: #5865F2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Join Discord</a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
            <p>GT Esports - Georgia Tech's Premier Gaming Organization</p>
            <p style="margin: 0;">Questions? Reach out at gtesports@gmail.com</p>
          </div>
        </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.email,
        subject: "You're Registered! - GT Esports GameFest 2026",
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend error:", errorData);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
