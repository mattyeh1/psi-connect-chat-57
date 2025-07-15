// Servidor optimizado de Baileys para integración con n8n - Con persistencia en Supabase
const { makeWASocket, DisconnectReason, useMultiFileAuthState, downloadMediaMessage } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configuración de Supabase
const supabaseUrl = 'https://scikpgzpgzevkgwwobrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaWtwZ3pwZ3pldmtnd3dvYnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTQwOTEsImV4cCI6MjA2MzY5MDA5MX0._ToVfRlR4cuZ_xhZozT-zEHoc43V8iLDWp-wu_Ty_Io';
const supabase = createClient(supabaseUrl, supabaseKey);

let sock;
let isConnected = false;
let qrCode = null;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;
const SESSION_ID = 'baileys-main-session';

// Implementación de AuthState para Supabase
const useSupabaseAuthState = async (sessionId) => {
  const writeData = async (data, file) => {
    try {
      const { error } = await supabase
        .from('whatsapp_session_storage')
        .upsert({
          session_id: `${sessionId}-${file}`,
          session_data: data
        });
      
      if (error) {
        console.error('❌ Error guardando en Supabase:', error);
        throw error;
      }
      console.log('💾 Datos guardados en Supabase:', file);
    } catch (error) {
      console.error('❌ Error en writeData:', error);
      throw error;
    }
  };

  const readData = async (file) => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_session_storage')
        .select('session_data')
        .eq('session_id', `${sessionId}-${file}`)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró el archivo, devolver null
          return null;
        }
        console.error('❌ Error leyendo de Supabase:', error);
        throw error;
      }
      
      console.log('📖 Datos leídos de Supabase:', file);
      return data.session_data;
    } catch (error) {
      console.error('❌ Error en readData:', error);
      return null;
    }
  };

  const removeData = async (file) => {
    try {
      const { error } = await supabase
        .from('whatsapp_session_storage')
        .delete()
        .eq('session_id', `${sessionId}-${file}`);
      
      if (error) {
        console.error('❌ Error eliminando de Supabase:', error);
        throw error;
      }
      console.log('🗑️ Datos eliminados de Supabase:', file);
    } catch (error) {
      console.error('❌ Error en removeData:', error);
    }
  };

  const creds = await readData('creds.json') || {
    noiseKey: null,
    signedIdentityKey: null,
    signedPreKey: null,
    registrationId: null,
    advSecretKey: null,
    processedHistoryMessages: [],
    nextPreKeyId: 1,
    firstUnuploadedPreKeyId: 1,
    accountSettings: {
      unarchiveChats: false
    }
  };

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          for (const id of ids) {
            const key = await readData(`${type}-${id}.json`);
            if (key) {
              data[id] = key;
            }
          }
          return data;
        },
        set: async (data) => {
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              if (value) {
                await writeData(value, `${category}-${id}.json`);
              } else {
                await removeData(`${category}-${id}.json`);
              }
            }
          }
        }
      }
    },
    saveCreds: async () => {
      await writeData(creds, 'creds.json');
    }
  };
};

// Función para limpiar sesión de Supabase
const clearSupabaseSession = async (sessionId) => {
  try {
    const { error } = await supabase
      .from('whatsapp_session_storage')
      .delete()
      .like('session_id', `${sessionId}%`);
    
    if (error) {
      console.error('❌ Error limpiando sesión de Supabase:', error);
    } else {
      console.log('🧹 Sesión limpiada de Supabase');
    }
  } catch (error) {
    console.error('❌ Error en clearSupabaseSession:', error);
  }
};

// Función para verificar si existe sesión en Supabase
const checkSupabaseSession = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from('whatsapp_session_storage')
      .select('session_id')
      .like('session_id', `${sessionId}%`)
      .limit(1);
    
    if (error) {
      console.error('❌ Error verificando sesión:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('❌ Error en checkSupabaseSession:', error);
    return false;
  }
};

// Configuración de autenticación persistente con Supabase
const startSock = async () => {
  try {
    console.log('🔄 Iniciando conexión WhatsApp...');
    
    // Verificar si existe sesión en Supabase
    const hasSession = await checkSupabaseSession(SESSION_ID);
    if (hasSession) {
      console.log('✅ Sesión encontrada en Supabase');
    } else {
      console.log('🆕 No se encontró sesión anterior, iniciando nueva sesión');
    }

    const { state, saveCreds } = await useSupabaseAuthState(SESSION_ID);
    
    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: {
        level: 'silent' // Reducir logs para producción
      },
      browser: ['Sistema Notificaciones', 'Chrome', '1.0.0'],
      generateHighQualityLinkPreview: true,
      markOnlineOnConnect: false,
      // Configuraciones adicionales para persistencia
      defaultQueryTimeoutMs: 60000,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
      retryRequestDelayMs: 1000,
      maxMsgRetryCount: 5
    });

    // Manejar actualizaciones de conexión
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        qrCode = qr;
        console.log('📱 QR Code generado. Escanéalo con WhatsApp Web.');
      }
      
      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        
        console.log('❌ Conexión cerrada. Código:', statusCode, 'Reconectar:', shouldReconnect);
        
        isConnected = false;
        qrCode = null;
        
        // Manejar diferentes tipos de desconexión
        if (statusCode === DisconnectReason.loggedOut) {
          console.log('🚪 Sesión cerrada por el usuario. Limpiando sesión de Supabase...');
          await clearSupabaseSession(SESSION_ID);
        } else if (shouldReconnect && connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
          connectionAttempts++;
          console.log(`🔄 Intento de reconexión ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}`);
          setTimeout(() => startSock(), 5000 * connectionAttempts); // Backoff exponencial
        } else if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
          console.error('❌ Máximo número de intentos de reconexión alcanzado');
        }
      } else if (connection === 'open') {
        console.log('✅ WhatsApp conectado exitosamente');
        console.log('💾 Sesión guardada en Supabase');
        isConnected = true;
        connectionAttempts = 0;
        qrCode = null;
        
        // Verificar información de la cuenta
        const info = sock.user;
        if (info) {
          console.log('👤 Conectado como:', info.name || info.id);
        }
      } else if (connection === 'connecting') {
        console.log('🔄 Conectando a WhatsApp...');
      }
    });

    // Guardar credenciales cuando se actualicen - CRÍTICO para persistencia
    sock.ev.on('creds.update', async () => {
      try {
        await saveCreds();
        console.log('💾 Credenciales guardadas correctamente en Supabase');
      } catch (error) {
        console.error('❌ Error guardando credenciales:', error);
      }
    });

    // Manejar mensajes entrantes (opcional, para logs)
    sock.ev.on('messages.upsert', (m) => {
      const messages = m.messages;
      if (messages && messages.length > 0) {
        messages.forEach(msg => {
          if (!msg.key.fromMe && msg.message) {
            console.log('📨 Mensaje recibido de:', msg.key.remoteJid);
          }
        });
      }
    });

    // Manejar actualizaciones de presencia
    sock.ev.on('presence.update', ({ id, presences }) => {
      // Solo log si es necesario
      // console.log('👁️ Presencia actualizada:', id);
    });

  } catch (error) {
    console.error('❌ Error iniciando WhatsApp:', error);
    isConnected = false;
    
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      connectionAttempts++;
      console.log(`🔄 Reintentando en ${10 * connectionAttempts} segundos...`);
      setTimeout(() => startSock(), 10000 * connectionAttempts);
    }
  }
};

// Middleware de autenticación mejorado
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de autorización requerido',
      code: 'MISSING_TOKEN'
    });
  }

  if (token !== process.env.BAILEYS_API_KEY) {
    return res.status(401).json({ 
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
  
  next();
};

// Función para formatear número de teléfono
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  
  // Remover caracteres no numéricos excepto el +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Si no tiene código de país, asumir Argentina (+54)
  if (!cleaned.startsWith('+') && !cleaned.startsWith('54')) {
    cleaned = '54' + cleaned;
  }
  
  // Remover el + si existe
  cleaned = cleaned.replace('+', '');
  
  // Formato final para WhatsApp
  return cleaned + '@s.whatsapp.net';
};

// Función para validar conexión antes de enviar
const validateConnection = () => {
  if (!isConnected || !sock) {
    throw new Error('WhatsApp no está conectado');
  }
};

// ENDPOINTS DE LA API

// Obtener estado de conexión mejorado
app.get('/get-status', authenticateToken, async (req, res) => {
  // Verificar sesión en Supabase
  const hasSupabaseSession = await checkSupabaseSession(SESSION_ID);
  
  res.json({ 
    status: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    connectionAttempts,
    hasQR: !!qrCode,
    uptime: process.uptime(),
    supabaseSession: hasSupabaseSession,
    sessionStorage: 'supabase',
    hasValidSession: hasSupabaseSession
  });
});

// Obtener código QR
app.get('/get-qr', authenticateToken, (req, res) => {
  if (qrCode) {
    res.json({ 
      qr: qrCode,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({ 
      error: 'No hay código QR disponible',
      status: isConnected ? 'connected' : 'disconnected'
    });
  }
});

// Inicializar conexión
app.post('/initialize', authenticateToken, async (req, res) => {
  try {
    if (isConnected) {
      return res.json({ 
        message: 'WhatsApp ya está conectado',
        status: 'connected'
      });
    }

    connectionAttempts = 0;
    await startSock();
    
    res.json({ 
      message: 'Inicializando conexión WhatsApp',
      status: 'initializing'
    });
  } catch (error) {
    console.error('Error inicializando:', error);
    res.status(500).json({ 
      error: error.message,
      code: 'INITIALIZATION_ERROR'
    });
  }
});

// Reiniciar conexión
app.post('/restart', authenticateToken, async (req, res) => {
  try {
    if (sock) {
      sock.end();
    }
    
    isConnected = false;
    connectionAttempts = 0;
    qrCode = null;
    
    setTimeout(async () => {
      await startSock();
    }, 2000);
    
    res.json({ 
      message: 'Reiniciando conexión WhatsApp',
      status: 'restarting'
    });
  } catch (error) {
    console.error('Error reiniciando:', error);
    res.status(500).json({ 
      error: error.message,
      code: 'RESTART_ERROR'
    });
  }
});

// Limpiar sesión (logout manual) - Actualizado para Supabase
app.post('/clear-session', authenticateToken, async (req, res) => {
  try {
    // Cerrar conexión actual
    if (sock) {
      sock.end();
    }
    
    isConnected = false;
    qrCode = null;
    connectionAttempts = 0;
    
    // Limpiar sesión de Supabase
    await clearSupabaseSession(SESSION_ID);
    console.log('🧹 Sesión limpiada manualmente de Supabase');
    
    res.json({ 
      message: 'Sesión limpiada exitosamente de Supabase',
      status: 'session_cleared'
    });
  } catch (error) {
    console.error('Error limpiando sesión:', error);
    res.status(500).json({ 
      error: error.message,
      code: 'CLEAR_SESSION_ERROR'
    });
  }
});

// Enviar mensaje de texto
app.post('/send-message', authenticateToken, async (req, res) => {
  try {
    const { to, message, type = 'text' } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ 
        error: 'Campos "to" y "message" son requeridos',
        code: 'MISSING_FIELDS'
      });
    }

    validateConnection();

    const phoneNumber = formatPhoneNumber(to);
    if (!phoneNumber) {
      return res.status(400).json({ 
        error: 'Número de teléfono inválido',
        code: 'INVALID_PHONE'
      });
    }
    
    console.log(`📤 Enviando mensaje a ${phoneNumber}: ${message.substring(0, 50)}...`);
    
    const result = await sock.sendMessage(phoneNumber, { text: message });
    
    res.json({ 
      success: true, 
      message: 'Mensaje enviado exitosamente',
      to: phoneNumber,
      messageId: result.key.id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
    res.status(500).json({ 
      error: error.message,
      code: 'SEND_MESSAGE_ERROR',
      details: error.output || null
    });
  }
});

// Enviar mensaje con plantilla
app.post('/send-template', authenticateToken, async (req, res) => {
  try {
    const { to, template, variables = {} } = req.body;
    
    if (!to || !template) {
      return res.status(400).json({ 
        error: 'Campos "to" y "template" son requeridos',
        code: 'MISSING_FIELDS'
      });
    }

    validateConnection();

    // Plantillas predefinidas mejoradas
    const templates = {
      appointment_reminder_template: `🏥 *Recordatorio de Cita*

Hola {{patient_name}}, 

Te recordamos tu cita con {{psychologist_name}} programada para:
📅 *Fecha:* {{appointment_date}}
🕐 *Hora:* {{appointment_time}}

Si necesitas reprogramar o tienes alguna consulta, no dudes en contactarnos.

¡Te esperamos! 😊`,

      payment_due_template: `💳 *Recordatorio de Pago*

Hola {{patient_name}},

Tienes un pago pendiente de *${{amount}}* correspondiente a tu sesión del {{session_date}}.

Puedes realizar el pago através de: {{payment_link}}

Gracias por tu atención. 🙏`,

      document_ready_template: `📄 *Documento Disponible*

Hola {{patient_name}},

Tu {{document_type}} está listo para ser revisado.

Puedes acceder desde tu portal de paciente o contactarnos para más información.

Gracias por confiar en nosotros. ✨`,

      payment_confirmed_template: `✅ *Pago Confirmado*

Hola {{patient_name}},

Hemos recibido tu pago de *${{amount}}*.

✅ Estado: Confirmado
📅 Fecha: {{payment_date}}
🎫 Referencia: {{payment_reference}}

¡Gracias! 😊`,

      appointment_confirmed_template: `✅ *Cita Confirmada*

Hola {{patient_name}},

Tu cita ha sido confirmada:
👩‍⚕️ *Profesional:* {{psychologist_name}}
📅 *Fecha:* {{appointment_date}}
🕐 *Hora:* {{appointment_time}}
📍 *Modalidad:* {{session_type}}

¡Nos vemos pronto! 😊`
    };

    let message = templates[template];
    
    if (!message) {
      return res.status(400).json({ 
        error: `Plantilla "${template}" no encontrada`,
        code: 'TEMPLATE_NOT_FOUND',
        availableTemplates: Object.keys(templates)
      });
    }
    
    // Reemplazar variables en el mensaje
    const parsedVariables = typeof variables === 'string' ? JSON.parse(variables) : variables;
    
    Object.keys(parsedVariables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      message = message.replace(regex, parsedVariables[key] || '');
    });

    const phoneNumber = formatPhoneNumber(to);
    if (!phoneNumber) {
      return res.status(400).json({ 
        error: 'Número de teléfono inválido',
        code: 'INVALID_PHONE'
      });
    }
    
    console.log(`📤 Enviando plantilla "${template}" a ${phoneNumber}`);
    
    const result = await sock.sendMessage(phoneNumber, { text: message });
    
    res.json({ 
      success: true, 
      message: 'Plantilla enviada exitosamente',
      to: phoneNumber,
      template,
      processedMessage: message,
      messageId: result.key.id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error enviando plantilla:', error);
    res.status(500).json({ 
      error: error.message,
      code: 'SEND_TEMPLATE_ERROR',
      details: error.output || null
    });
  }
});

// Verificar si un número existe en WhatsApp
app.post('/check-number', authenticateToken, async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ 
        error: 'Campo "phone" es requerido',
        code: 'MISSING_PHONE'
      });
    }

    validateConnection();

    const phoneNumber = formatPhoneNumber(phone);
    if (!phoneNumber) {
      return res.status(400).json({ 
        error: 'Número de teléfono inválido',
        code: 'INVALID_PHONE'
      });
    }

    const [result] = await sock.onWhatsApp(phoneNumber.replace('@s.whatsapp.net', ''));
    
    res.json({
      exists: !!result?.exists,
      phone: phoneNumber,
      jid: result?.jid || null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error verificando número:', error);
    res.status(500).json({ 
      error: error.message,
      code: 'CHECK_NUMBER_ERROR'
    });
  }
});

// Webhook para confirmaciones de entrega
app.post('/webhook/delivery', authenticateToken, (req, res) => {
  const { messageId, status, timestamp, phoneNumber } = req.body;
  
  console.log(`📬 Confirmación de entrega - ID: ${messageId}, Estado: ${status}, Teléfono: ${phoneNumber}`);
  
  // Aquí puedes integrar con tu base de datos para actualizar el estado
  // Por ejemplo, actualizar system_notifications con status = 'delivered'
  
  res.json({ 
    received: true,
    timestamp: new Date().toISOString()
  });
});

// Endpoint de salud del sistema
app.get('/health', async (req, res) => {
  const hasSupabaseSession = await checkSupabaseSession(SESSION_ID);
  
  res.json({
    status: 'healthy',
    whatsapp: isConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    version: '2.2.0',
    sessionPersistence: {
      storage: 'supabase',
      hasValidSession: hasSupabaseSession,
      sessionId: SESSION_ID
    }
  });
});

// Endpoint para obtener plantillas disponibles
app.get('/templates', authenticateToken, (req, res) => {
  const templateInfo = {
    appointment_reminder_template: {
      name: 'Recordatorio de Cita',
      variables: ['patient_name', 'psychologist_name', 'appointment_date', 'appointment_time']
    },
    payment_due_template: {
      name: 'Pago Pendiente', 
      variables: ['patient_name', 'amount', 'session_date', 'payment_link']
    },
    document_ready_template: {
      name: 'Documento Listo',
      variables: ['patient_name', 'document_type']
    },
    payment_confirmed_template: {
      name: 'Pago Confirmado',
      variables: ['patient_name', 'amount', 'payment_date', 'payment_reference']
    },
    appointment_confirmed_template: {
      name: 'Cita Confirmada',
      variables: ['patient_name', 'psychologist_name', 'appointment_date', 'appointment_time', 'session_type']
    }
  };
  
  res.json({
    templates: templateInfo,
    count: Object.keys(templateInfo).length,
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error global:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
});

// Puerto y configuración del servidor
const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor Baileys ejecutándose en puerto ${PORT}`);
  console.log(`🔐 API Key requerida: ${process.env.BAILEYS_API_KEY ? 'Configurada' : 'NO CONFIGURADA'}`);
  console.log(`💾 Almacenamiento de sesión: Supabase`);
  
  // Verificar sesión existente al iniciar
  const hasSupabaseSession = await checkSupabaseSession(SESSION_ID);
  
  if (hasSupabaseSession) {
    console.log(`✅ Se encontró sesión en Supabase`);
    console.log('🔄 Intentando restaurar sesión anterior...');
  } else {
    console.log('🆕 No se encontró sesión anterior, se requerirá nuevo QR');
  }
  
  // Iniciar WhatsApp al arrancar el servidor
  await startSock();
});

// Manejo mejorado de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('💥 Error no capturado:', err);
  // Opcional: reiniciar el proceso o notificar al sistema de monitoreo
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promesa rechazada no manejada en:', promise, 'razón:', reason);
});

// Graceful shutdown - IMPORTANTE para guardar sesión
process.on('SIGTERM', () => {
  console.log('📴 Cerrando servidor (SIGTERM)...');
  if (sock) {
    console.log('💾 Guardando sesión antes de cerrar...');
    sock.end();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Cerrando servidor (SIGINT)...');
  if (sock) {
    console.log('💾 Guardando sesión antes de cerrar...');
    sock.end();
  }
  process.exit(0);
});

module.exports = app;
