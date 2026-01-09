const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const express = require("express");
const pino = require("pino");

const app = express();
app.use(express.json());

async function startSystem() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_tiger');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    // 1-Hour Problem Unlock API
    app.post('/unlock-timer', async (req, res) => {
        const { number } = req.body;
        try {
            // Timer bypass karne ke liye pehle registration data check karna parta hai
            await sock.requestRegistrationCode({
                phoneNumber: number,
                phoneNumberCountryCode: '92', // Change to 91 for India
                method: 'sms'
            });
            res.json({ status: "success", msg: "Request Sent! Check WhatsApp Timer." });
        } catch (err) {
            // Agar 1 hour problem hai toh error yahan show hoga
            res.json({ status: "error", msg: "WhatsApp Response: " + err.message });
        }
    });

    app.listen(3000, () => console.log("Tiger Unlocker Live!"));
}
startSystem();
