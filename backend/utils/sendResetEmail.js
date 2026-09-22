const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendResetEmail = async (email, resetLink) => {
    const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "Cine-X <onboarding@resend.dev>",
        to: [email],
        subject: "Reset Your Cine-X Password",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2>Reset Your Cine-X Password</h2>

                <p>You requested to reset your Cine-X password.</p>

                <p>Click the button below to create a new password:</p>

                <a
                    href="${resetLink}"
                    style="
                        display: inline-block;
                        padding: 12px 20px;
                        background: #e50914;
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                    "
                >
                    Reset Password
                </a>

                <p style="margin-top: 20px;">
                    This link will expire in 15 minutes.
                </p>

                <p>
                    If you did not request a password reset, you can ignore this email.
                </p>

                <p>— Cine-X Team</p>
            </div>
        `
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

module.exports = sendResetEmail;