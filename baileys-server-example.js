
// Ejemplo de servidor Node.js con Baileys para integración
const { makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let sock;
let isConnected = false;

// Configuración de autenticación
const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexión cerrada debido a ', lastDisconnect?.error, ', reconectando ', shouldReconnect);
      isConnected = false;
      
      if (shouldReconnect) {
        startSock();
      }
    } else if (connection === 'open') {
      console.log('WhatsApp conectado');
      isConnected = true;
    }
  });

  sock.ev.on('creds.update', saveCreds);
};

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token !== process.env.BAILEYS_API_KEY) {
    return res.sendStatus(401);
  }
  next();
};

// Endpoints de la API

// Enviar mensaje de texto
app.post('/send-message', authenticateToken, async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!isConnected) {
      return res.status(503).json({ error: 'WhatsApp no conectado' });
    }

    const phoneNumber = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
    
    await sock.sendMessage(phoneNumber, { text: message });
    
    res.json({ 
      success: true, 
      message: 'Mensaje enviado',
      to: phoneNumber 
    });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enviar mensaje con plantilla
app.post('/send-template', authenticateToken, async (req, res) => {
  try {
    const { to, template, variables } = req.body;
    
    if (!isConnected) {
      return res.status(503).json({ error: 'WhatsApp no conectado' });
    }

    // Plantillas predefinidas
    const templates = {
      appointment_reminder_template: `Hola {{patient_name}}, te recordamos tu cita con el Dr. {{psychologist_name}} el {{appointment_date}} a las {{appointment_time}}. ¡Te esperamos!`,
      payment_due_template: `Hola {{patient_name}}, tienes un pago pendiente de ${{amount}} por tu sesión del {{session_date}}. Puedes realizar el pago a través de {{payment_link}}.`,
      document_ready_template: `Hola {{patient_name}}, tu {{document_type}} está listo para ser revisado. Puedes acceder desde tu portal de paciente.`
    };

    let message = templates[template] || template;
    
    // Reemplazar variables
    const parsedVariables = typeof variables === 'string' ? JSON.parse(variables) : variables;
    Object.keys(parsedVariables).forEach(key => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), parsedVariables[key]);
    });

    const phoneNumber = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
    
    await sock.sendMessage(phoneNumber, { text: message });
    
    res.json({ 
      success: true, 
      message: 'Plantilla enviada',
      to: phoneNumber,
      processedMessage: message
    });
  } catch (error) {
    console.error('Error enviando plantilla:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verificar estado de conexión
app.get('/get-status', authenticateToken, (req, res) => {
  res.json({ 
    status: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Inicializar conexión
app.post('/initialize', authenticateToken, async (req, res) => {
  try {
    if (!isConnected) {
      await startSock();
      res.json({ message: 'Inicializando conexión WhatsApp' });
    } else {
      res.json({ message: 'WhatsApp ya está conectado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook para confirmaciones de entrega (opcional)
app.post('/webhook/delivery', authenticateToken, (req, res) => {
  const { messageId, status, timestamp } = req.body;
  
  // Aquí puedes actualizar el estado en tu base de datos
  console.log(`Mensaje ${messageId} - Estado: ${status} - ${timestamp}`);
  
  res.json({ received: true });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`Servidor Baileys ejecutándose en puerto ${PORT}`);
  await startSock();
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});
