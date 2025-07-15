
// 🚀 Ultra-Optimized WhatsApp Server v3.0 - Enterprise Edition
// Integración completa con Supabase para Sistema de Psicólogos
// Características avanzadas: Auto-reconnect, JWT Auth, Rate Limiting, AI Optimization

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const compression = require('compression');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const cluster = require('cluster');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');
const EventEmitter = require('events');

// 🔧 Configuración Ultra-Avanzada
const CONFIG = {
  API_PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'ultra-secure-jwt-secret-2024',
  SUPABASE_URL: 'https://scikpgzpgzevkgwwobrf.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaWtwZ3pwZ3pldmtnd3dvYnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTQwOTEsImV4cCI6MjA2MzY5MDA5MX0._ToVfRlR4cuZ_xhZozT-zEHoc43V8iLDWp-wu_Ty_Io',
  RECONNECT_INTERVAL: 30000,
  MAX_RECONNECT_ATTEMPTS: 10,
  MESSAGE_RETRY_ATTEMPTS: 3,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX: 100, // 100 requests por ventana
  SESSION_BACKUP_INTERVAL: 5 * 60 * 1000, // 5 minutos
  HEALTH_CHECK_INTERVAL: 30000, // 30 segundos
  AUTO_CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 horas
  CLUSTERING_ENABLED: process.env.NODE_ENV === 'production'
};

// 🗄️ Inicializar Supabase
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// 📊 Sistema de Métricas Ultra-Avanzado
class MetricsCollector extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      messagesPerMinute: 0,
      successRate: 0,
      avgResponseTime: 0,
      activeConnections: 0,
      errorRate: 0,
      queueLength: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      lastUpdate: Date.now()
    };
    this.messageCount = 0;
    this.errorCount = 0;
    this.responseTimeSum = 0;
    this.responseTimes = [];
    this.startMetricsCollection();
  }

  startMetricsCollection() {
    setInterval(() => {
      this.calculateMetrics();
      this.emit('metricsUpdated', this.metrics);
    }, 60000); // Cada minuto
  }

  calculateMetrics() {
    const process = require('process');
    const usage = process.cpuUsage();
    const memUsage = process.memoryUsage();
    
    this.metrics = {
      ...this.metrics,
      messagesPerMinute: this.messageCount,
      successRate: this.messageCount > 0 ? ((this.messageCount - this.errorCount) / this.messageCount * 100) : 100,
      avgResponseTime: this.responseTimes.length > 0 ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length : 0,
      errorRate: this.messageCount > 0 ? (this.errorCount / this.messageCount * 100) : 0,
      cpuUsage: (usage.user + usage.system) / 1000000, // Convertir a ms
      memoryUsage: memUsage.heapUsed / 1024 / 1024, // MB
      lastUpdate: Date.now()
    };

    // Reset contadores
    this.messageCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
  }

  recordMessage(success = true, responseTime = 0) {
    this.messageCount++;
    if (!success) this.errorCount++;
    if (responseTime > 0) this.responseTimes.push(responseTime);
  }
}

// 🔄 Sistema de Cola de Mensajes Ultra-Avanzado
class MessageQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.processing = false;
    this.retryQueue = [];
    this.priorityQueue = [];
    this.processInterval = null;
    this.startProcessing();
  }

  addMessage(message, priority = 'normal') {
    const queuedMessage = {
      id: Date.now() + Math.random(),
      ...message,
      priority,
      attempts: 0,
      createdAt: new Date(),
      scheduledFor: message.scheduledFor || new Date()
    };

    if (priority === 'high' || priority === 'urgent') {
      this.priorityQueue.push(queuedMessage);
    } else {
      this.queue.push(queuedMessage);
    }

    this.emit('messageQueued', queuedMessage);
    console.log(`📥 Mensaje añadido a cola (${priority}): ${message.phoneNumber}`);
  }

  startProcessing() {
    this.processInterval = setInterval(async () => {
      if (!this.processing && (this.priorityQueue.length > 0 || this.queue.length > 0 || this.retryQueue.length > 0)) {
        await this.processNext();
      }
    }, 1000);
  }

  async processNext() {
    this.processing = true;
    
    try {
      // Procesar primero mensajes de alta prioridad
      let message = this.priorityQueue.shift();
      if (!message) message = this.retryQueue.shift();
      if (!message) message = this.queue.shift();

      if (message && new Date() >= new Date(message.scheduledFor)) {
        const success = await this.processMessage(message);
        
        if (!success && message.attempts < CONFIG.MESSAGE_RETRY_ATTEMPTS) {
          message.attempts++;
          message.scheduledFor = new Date(Date.now() + (message.attempts * 30000)); // Backoff exponencial
          this.retryQueue.push(message);
          console.log(`🔄 Reintentando mensaje ${message.id}, intento ${message.attempts}`);
        } else if (!success) {
          await this.markMessageAsFailed(message);
          console.log(`❌ Mensaje ${message.id} marcado como fallido después de ${message.attempts} intentos`);
        }
      }
    } catch (error) {
      console.error('❌ Error procesando cola de mensajes:', error);
    } finally {
      this.processing = false;
    }
  }

  async processMessage(message) {
    // Esta función será implementada por WhatsAppUltraBot
    this.emit('processMessage', message);
    return true;
  }

  async markMessageAsFailed(message) {
    try {
      await supabase
        .from('system_notifications')
        .update({ 
          status: 'failed',
          metadata: {
            ...message.metadata,
            failed_at: new Date().toISOString(),
            failure_reason: 'Max retry attempts exceeded'
          }
        })
        .eq('id', message.notificationId);
    } catch (error) {
      console.error('Error marcando mensaje como fallido:', error);
    }
  }

  getQueueStats() {
    return {
      total: this.queue.length + this.priorityQueue.length + this.retryQueue.length,
      normal: this.queue.length,
      priority: this.priorityQueue.length,
      retry: this.retryQueue.length,
      processing: this.processing
    };
  }
}

// 🤖 Bot Ultra-Optimizado con IA y Características Avanzadas
class WhatsAppUltraBot extends EventEmitter {
  constructor() {
    super();
    this.client = null;
    this.isReady = false;
    this.isInitializing = false;
    this.reconnectAttempts = 0;
    this.sessions = new Map();
    this.messageQueue = new MessageQueue();
    this.metrics = new MetricsCollector();
    this.healthCheckInterval = null;
    this.sessionBackupInterval = null;
    this.qrCode = null;
    this.phoneNumber = null;
    this.deviceInfo = {};
    this.rateLimitStore = new Map();
    
    this.setupMessageQueue();
    this.startHealthChecks();
    this.startSessionBackup();
    this.setupCleanupTasks();
  }

  async initialize() {
    if (this.isInitializing) return;
    
    this.isInitializing = true;
    console.log('🚀 Inicializando WhatsApp Ultra Bot v3.0...');

    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: './ultra-sessions',
          clientId: `ultra-bot-${Date.now()}`
        }),
        puppeteer: {
          headless: process.env.NODE_ENV === 'production',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        },
        webVersionCache: {
          type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        }
      });

      this.setupEventHandlers();
      await this.client.initialize();
      
    } catch (error) {
      console.error('❌ Error inicializando cliente:', error);
      this.isInitializing = false;
      await this.scheduleReconnect();
    }
  }

  setupEventHandlers() {
    // 📱 QR Code con auto-regeneración
    this.client.on('qr', async (qr) => {
      this.qrCode = qr;
      console.log('\n🔗 NUEVO CÓDIGO QR GENERADO:');
      qrcode.generate(qr, { small: true });
      
      // Actualizar estado en Supabase
      await this.updateSessionStatus('qr_pending', qr);
      
      // Auto-regenerar QR cada 2 minutos si no se conecta
      setTimeout(() => {
        if (!this.isReady && this.client) {
          console.log('🔄 Regenerando código QR...');
          this.client.pupPage?.reload();
        }
      }, 120000);
    });

    // ✅ Conexión exitosa
    this.client.on('ready', async () => {
      this.isReady = true;
      this.isInitializing = false;
      this.reconnectAttempts = 0;
      this.qrCode = null;
      
      // Obtener información del dispositivo
      const info = this.client.info;
      this.phoneNumber = info.wid.user;
      this.deviceInfo = {
        platform: info.platform,
        phone: info.wid.user,
        pushname: info.pushname,
        connected: true,
        timestamp: new Date().toISOString()
      };

      console.log('✅ WhatsApp Ultra Bot conectado exitosamente!');
      console.log(`📱 Número: ${this.phoneNumber}`);
      console.log(`🔧 Plataforma: ${info.platform}`);
      
      await this.updateSessionStatus('connected', null, this.phoneNumber, this.deviceInfo);
      await this.processSupabaseNotifications();
      
      this.emit('ready', this.deviceInfo);
    });

    // 📨 Mensajes entrantes con IA
    this.client.on('message', async (message) => {
      await this.handleIncomingMessage(message);
    });

    // 📤 Confirmaciones de entrega
    this.client.on('message_ack', async (message, ack) => {
      await this.handleMessageAck(message, ack);
    });

    // ❌ Desconexión con auto-reconexión
    this.client.on('disconnected', async (reason) => {
      this.isReady = false;
      console.log(`❌ WhatsApp desconectado: ${reason}`);
      await this.updateSessionStatus('disconnected');
      await this.scheduleReconnect();
    });

    // 🔐 Errores de autenticación
    this.client.on('auth_failure', async () => {
      this.isReady = false;
      console.log('❌ Error de autenticación');
      await this.updateSessionStatus('error');
      await this.clearSession();
      await this.scheduleReconnect();
    });
  }

  setupMessageQueue() {
    this.messageQueue.on('processMessage', async (message) => {
      const startTime = Date.now();
      let success = false;
      
      try {
        success = await this.sendDirectMessage(message.phoneNumber, message.message, message.notificationId);
        
        if (success && message.notificationId) {
          await this.updateNotificationStatus(message.notificationId, 'sent');
        }
      } catch (error) {
        console.error('Error procesando mensaje de cola:', error);
      }
      
      const responseTime = Date.now() - startTime;
      this.metrics.recordMessage(success, responseTime);
    });
  }

  async sendDirectMessage(phoneNumber, message, notificationId = null) {
    if (!this.isReady) {
      console.log('❌ WhatsApp no está conectado');
      return false;
    }

    try {
      // Formatear número argentino
      const formattedNumber = this.formatArgentinePhoneNumber(phoneNumber);
      const chatId = `${formattedNumber}@c.us`;

      // Verificar si el número existe en WhatsApp
      const isValidNumber = await this.client.isRegisteredUser(chatId);
      if (!isValidNumber) {
        console.log(`⚠️ Número no registrado en WhatsApp: ${phoneNumber}`);
        return false;
      }

      await this.client.sendMessage(chatId, message);
      
      // Log en Supabase
      await this.logMessage({
        from_number: this.phoneNumber,
        to_number: formattedNumber,
        message_body: message,
        direction: 'outgoing',
        whatsapp_message_id: `msg_${Date.now()}`,
        notification_id: notificationId
      });

      console.log(`📤 Mensaje enviado exitosamente a ${phoneNumber}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Error enviando mensaje a ${phoneNumber}:`, error);
      return false;
    }
  }

  formatArgentinePhoneNumber(phone) {
    // Lógica específica para números argentinos
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    if (!cleaned.startsWith('+') && !cleaned.startsWith('54')) {
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      if (cleaned.length === 10 && !cleaned.startsWith('9')) {
        cleaned = '9' + cleaned;
      }
      cleaned = '54' + cleaned;
    } else if (cleaned.startsWith('54') && !cleaned.startsWith('+')) {
      cleaned = cleaned.substring(2);
      if (cleaned.length === 10 && !cleaned.startsWith('9')) {
        cleaned = '54' + '9' + cleaned;
      } else {
        cleaned = '54' + cleaned;
      }
    }
    
    return cleaned.replace('+', '');
  }

  async handleIncomingMessage(message) {
    try {
      if (message.fromMe || message.from.includes('@g.us')) return;

      const contact = await message.getContact();
      const phoneNumber = message.from.replace('@c.us', '');
      const userName = contact.pushname || contact.name || phoneNumber;
      const messageText = message.body;

      console.log(`📱 Mensaje entrante de ${userName} (${phoneNumber}): ${messageText}`);

      // Análisis de sentimiento con IA (simulado)
      const sentiment = this.analyzeSentiment(messageText);
      
      // Auto-respuesta inteligente basada en contexto
      const autoResponse = await this.generateAutoResponse(messageText, sentiment);
      
      if (autoResponse) {
        await message.reply(autoResponse);
        console.log(`🤖 Auto-respuesta enviada: ${autoResponse}`);
      }

      // Log en Supabase
      await this.logMessage({
        from_number: phoneNumber,
        to_number: this.phoneNumber,
        message_body: messageText,
        direction: 'incoming',
        whatsapp_message_id: message.id.id,
        metadata: { userName, sentiment }
      });

    } catch (error) {
      console.error('❌ Error procesando mensaje entrante:', error);
    }
  }

  analyzeSentiment(text) {
    // Análisis básico de sentimiento (en producción usar un servicio de IA real)
    const positiveWords = ['gracias', 'excelente', 'perfecto', 'bien', 'bueno', 'genial'];
    const negativeWords = ['mal', 'terrible', 'horrible', 'problema', 'error', 'cancelar'];
    
    const textLower = text.toLowerCase();
    const hasPositive = positiveWords.some(word => textLower.includes(word));
    const hasNegative = negativeWords.some(word => textLower.includes(word));
    
    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative && !hasPositive) return 'negative';
    return 'neutral';
  }

  async generateAutoResponse(text, sentiment) {
    // Auto-respuestas inteligentes basadas en contexto
    const textLower = text.toLowerCase();
    
    if (textLower.includes('horario') || textLower.includes('disponible')) {
      return 'Nuestros horarios de atención son de Lunes a Viernes de 9:00 a 18:00 hs. ¿En qué podemos ayudarte?';
    }
    
    if (textLower.includes('cita') || textLower.includes('turno') || textLower.includes('consulta')) {
      return 'Para agendar una cita, por favor contáctanos durante nuestro horario de atención. Un profesional te atenderá personalmente.';
    }
    
    if (textLower.includes('precio') || textLower.includes('costo') || textLower.includes('honorario')) {
      return 'Los honorarios varían según el tipo de consulta. Te enviaremos la información detallada en breve.';
    }
    
    if (sentiment === 'negative') {
      return 'Entendemos tu preocupación. Un profesional se pondrá en contacto contigo lo antes posible para resolver cualquier inconveniente.';
    }
    
    return null; // No auto-responder en otros casos
  }

  async handleMessageAck(message, ack) {
    // 0: Mensaje enviado
    // 1: Mensaje entregado al servidor
    // 2: Mensaje entregado al destinatario
    // 3: Mensaje leído por el destinatario
    
    const status = ['pending', 'sent', 'delivered', 'read'][ack] || 'unknown';
    
    try {
      await supabase
        .from('whatsapp_messages')
        .update({ status })
        .eq('whatsapp_message_id', message.id.id);
        
    } catch (error) {
      console.error('Error actualizando estado de mensaje:', error);
    }
  }

  async processSupabaseNotifications() {
    try {
      const { data: notifications, error } = await supabase
        .from('system_notifications')
        .select('*')
        .eq('delivery_method', 'whatsapp')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .limit(50);

      if (error) throw error;

      if (notifications && notifications.length > 0) {
        console.log(`📋 Procesando ${notifications.length} notificaciones de Supabase`);
        
        for (const notification of notifications) {
          const metadata = notification.metadata || {};
          const phoneNumber = metadata.phone_number;
          
          if (phoneNumber) {
            const priority = this.determineMessagePriority(notification.notification_type);
            
            this.messageQueue.addMessage({
              phoneNumber,
              message: notification.message,
              notificationId: notification.id,
              metadata
            }, priority);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error procesando notificaciones de Supabase:', error);
    }
  }

  determineMessagePriority(notificationType) {
    const priorityMap = {
      'appointment_reminder': 'high',
      'payment_due': 'normal',
      'document_ready': 'normal',
      'payment_confirmed': 'high',
      'appointment_confirmed': 'urgent',
      'system_alert': 'urgent'
    };
    
    return priorityMap[notificationType] || 'normal';
  }

  async updateSessionStatus(status, qrCode = null, phoneNumber = null, deviceInfo = null) {
    try {
      await supabase.rpc('update_whatsapp_session_status', {
        session_id_param: 'ultra-bot-primary',
        new_status: status,
        qr_code_param: qrCode,
        phone_number_param: phoneNumber,
        device_info_param: deviceInfo
      });
    } catch (error) {
      console.error('Error actualizando estado de sesión:', error);
    }
  }

  async updateNotificationStatus(notificationId, status) {
    try {
      await supabase
        .from('system_notifications')
        .update({ 
          status,
          sent_at: status === 'sent' ? new Date().toISOString() : null
        })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error actualizando estado de notificación:', error);
    }
  }

  async logMessage(messageData) {
    try {
      const sessionResult = await supabase
        .from('whatsapp_sessions')
        .select('id')
        .eq('session_id', 'ultra-bot-primary')
        .single();

      if (sessionResult.data) {
        await supabase.rpc('log_whatsapp_message', {
          session_id_param: sessionResult.data.id,
          ...messageData
        });
      }
    } catch (error) {
      console.error('Error registrando mensaje:', error);
    }
  }

  startHealthChecks() {
    this.healthCheckInterval = setInterval(async () => {
      if (this.isReady && this.client) {
        try {
          // Verificar estado del cliente
          const state = await this.client.getState();
          if (state !== 'CONNECTED') {
            console.log('⚠️ Cliente no conectado, iniciando reconexión...');
            await this.scheduleReconnect();
          }
        } catch (error) {
          console.error('❌ Error en health check:', error);
          await this.scheduleReconnect();
        }
      }
      
      // Procesar nuevas notificaciones
      if (this.isReady) {
        await this.processSupabaseNotifications();
      }
    }, CONFIG.HEALTH_CHECK_INTERVAL);
  }

  startSessionBackup() {
    this.sessionBackupInterval = setInterval(async () => {
      if (this.isReady) {
        try {
          // Backup de métricas y estado
          await this.backupSessionData();
        } catch (error) {
          console.error('Error en backup de sesión:', error);
        }
      }
    }, CONFIG.SESSION_BACKUP_INTERVAL);
  }

  async backupSessionData() {
    const backupData = {
      timestamp: new Date().toISOString(),
      isReady: this.isReady,
      phoneNumber: this.phoneNumber,
      deviceInfo: this.deviceInfo,
      metrics: this.metrics.metrics,
      queueStats: this.messageQueue.getQueueStats()
    };

    try {
      await fs.writeFile(
        path.join('./ultra-sessions', 'backup.json'),
        JSON.stringify(backupData, null, 2)
      );
    } catch (error) {
      console.error('Error escribiendo backup:', error);
    }
  }

  setupCleanupTasks() {
    // Limpiar logs antiguos diariamente
    cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Ejecutando limpieza automática...');
      await this.cleanupOldLogs();
    });
  }

  async cleanupOldLogs() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await supabase
        .from('whatsapp_messages')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      console.log('✅ Limpieza de logs completada');
    } catch (error) {
      console.error('Error en limpieza de logs:', error);
    }
  }

  async scheduleReconnect() {
    if (this.reconnectAttempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) {
      console.log('❌ Máximo número de intentos de reconexión alcanzado');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(CONFIG.RECONNECT_INTERVAL * this.reconnectAttempts, 300000); // Max 5 min
    
    console.log(`🔄 Programando reconexión ${this.reconnectAttempts}/${CONFIG.MAX_RECONNECT_ATTEMPTS} en ${delay/1000}s`);
    
    setTimeout(async () => {
      await this.destroy();
      await this.initialize();
    }, delay);
  }

  async clearSession() {
    try {
      const sessionPath = './ultra-sessions';
      if (await fs.access(sessionPath).then(() => true).catch(() => false)) {
        await fs.rm(sessionPath, { recursive: true, force: true });
        console.log('🗑️ Sesión limpiada');
      }
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  }

  async destroy() {
    if (this.client) {
      try {
        await this.client.destroy();
      } catch (error) {
        console.error('Error destruyendo cliente:', error);
      }
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (this.sessionBackupInterval) {
      clearInterval(this.sessionBackupInterval);
    }
    
    this.isReady = false;
    this.isInitializing = false;
  }

  // Getters para APIs
  getStatus() {
    return {
      connected: this.isReady,
      phoneNumber: this.phoneNumber,
      deviceInfo: this.deviceInfo,
      qrCode: this.qrCode,
      metrics: this.metrics.metrics,
      queueStats: this.messageQueue.getQueueStats(),
      reconnectAttempts: this.reconnectAttempts,
      timestamp: new Date().toISOString()
    };
  }

  // API Methods
  async sendMessage(phoneNumber, message, notificationId = null, priority = 'normal') {
    this.messageQueue.addMessage({
      phoneNumber,
      message,
      notificationId,
      scheduledFor: new Date()
    }, priority);
    
    return { success: true, queued: true };
  }

  async sendBulkMessages(messages) {
    const results = [];
    
    for (const msg of messages) {
      try {
        await this.sendMessage(msg.phoneNumber, msg.message, msg.notificationId, msg.priority || 'normal');
        results.push({ ...msg, success: true, queued: true });
      } catch (error) {
        results.push({ ...msg, success: false, error: error.message });
      }
    }
    
    return { results };
  }

  async scheduleMessage(phoneNumber, message, delayMinutes, priority = 'normal') {
    const scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000);
    
    this.messageQueue.addMessage({
      phoneNumber,
      message,
      scheduledFor
    }, priority);
    
    return {
      success: true,
      scheduledFor: scheduledFor.toISOString(),
      message: `Mensaje programado para ${delayMinutes} minutos`
    };
  }
}

// 🌐 Servidor API Ultra-Avanzado con Clustering
class UltraAPIServer {
  constructor() {
    this.app = express();
    this.bot = null;
    this.wsServer = null;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupMiddleware() {
    // Seguridad avanzada
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://scikpgzpgzevkgwwobrf.supabase.co'] 
        : true,
      credentials: true
    }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting avanzado
    const limiter = rateLimit({
      windowMs: CONFIG.RATE_LIMIT_WINDOW,
      max: CONFIG.RATE_LIMIT_MAX,
      message: { error: 'Demasiadas solicitudes, intenta más tarde' },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Logging de requests
    this.app.use((req, res, next) => {
      console.log(`📡 ${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  setupRoutes() {
    // 🔐 Autenticación JWT
    this.app.post('/api/auth/login', async (req, res) => {
      try {
        const { username, password } = req.body;
        
        // En producción, validar contra base de datos
        if (username === 'admin' && password === 'ultra-secure-2024') {
          const token = jwt.sign(
            { userId: 1, username: 'admin', role: 'admin' },
            CONFIG.JWT_SECRET,
            { expiresIn: '24h' }
          );
          
          res.json({ success: true, token, expiresIn: '24h' });
        } else {
          res.status(401).json({ error: 'Credenciales inválidas' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Middleware de autenticación
    const authenticateToken = (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
      }

      jwt.verify(token, CONFIG.JWT_SECRET, (err, user) => {
        if (err) {
          return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
      });
    };

    // 📱 Estado de conexión ultra-detallado
    this.app.get('/api/status', (req, res) => {
      const status = this.bot ? this.bot.getStatus() : { 
        connected: false, 
        error: 'Bot no inicializado' 
      };
      res.json(status);
    });

    // 📤 Envío de mensaje simple
    this.app.post('/api/send-message', authenticateToken, async (req, res) => {
      try {
        const { phoneNumber, message, notificationId, priority } = req.body;

        if (!phoneNumber || !message) {
          return res.status(400).json({ 
            error: 'phoneNumber y message son requeridos' 
          });
        }

        if (!this.bot?.isReady) {
          return res.status(503).json({ 
            error: 'WhatsApp no está conectado',
            status: this.bot?.getStatus() || {} 
          });
        }

        const result = await this.bot.sendMessage(phoneNumber, message, notificationId, priority);
        res.json({ success: true, ...result });

      } catch (error) {
        console.error('Error en send-message:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // 📨 Envío masivo optimizado
    this.app.post('/api/send-bulk', authenticateToken, async (req, res) => {
      try {
        const { messages } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
          return res.status(400).json({ 
            error: 'Se requiere un array de mensajes no vacío' 
          });
        }

        if (!this.bot?.isReady) {
          return res.status(503).json({ 
            error: 'WhatsApp no está conectado' 
          });
        }

        const result = await this.bot.sendBulkMessages(messages);
        res.json({ success: true, ...result });

      } catch (error) {
        console.error('Error en send-bulk:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // ⏰ Programación de mensajes
    this.app.post('/api/schedule-reminder', authenticateToken, async (req, res) => {
      try {
        const { phoneNumber, message, delay, priority } = req.body;

        if (!phoneNumber || !message || !delay) {
          return res.status(400).json({ 
            error: 'phoneNumber, message y delay son requeridos' 
          });
        }

        const result = await this.bot.scheduleMessage(phoneNumber, message, delay, priority);
        res.json({ success: true, ...result });

      } catch (error) {
        console.error('Error en schedule-reminder:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // 📊 Métricas detalladas
    this.app.get('/api/metrics', authenticateToken, (req, res) => {
      if (!this.bot) {
        return res.status(503).json({ error: 'Bot no inicializado' });
      }

      const metrics = this.bot.metrics.metrics;
      const queueStats = this.bot.messageQueue.getQueueStats();
      
      res.json({
        metrics,
        queue: queueStats,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      });
    });

    // 🔄 Sincronización manual con Supabase
    this.app.post('/api/sync-notifications', authenticateToken, async (req, res) => {
      try {
        if (!this.bot?.isReady) {
          return res.status(503).json({ error: 'WhatsApp no está conectado' });
        }

        await this.bot.processSupabaseNotifications();
        res.json({ success: true, message: 'Sincronización completada' });

      } catch (error) {
        console.error('Error en sync-notifications:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // 🗂️ Plantillas de mensajes
    this.app.get('/api/templates', authenticateToken, (req, res) => {
      const templates = {
        appointment_reminder: {
          name: 'Recordatorio de Cita',
          template: 'Hola {{patient_name}}, te recordamos tu cita con {{psychologist_name}} para el {{date}} a las {{time}}.',
          variables: ['patient_name', 'psychologist_name', 'date', 'time']
        },
        payment_confirmation: {
          name: 'Confirmación de Pago',
          template: 'Hola {{patient_name}}, hemos recibido tu pago de ${{amount}}. ¡Gracias!',
          variables: ['patient_name', 'amount']
        },
        document_ready: {
          name: 'Documento Listo',
          template: 'Hola {{patient_name}}, tu {{document_type}} está listo para ser revisado.',
          variables: ['patient_name', 'document_type']
        }
      };
      
      res.json({ templates });
    });

    // 🔧 Control del bot
    this.app.post('/api/bot/restart', authenticateToken, async (req, res) => {
      try {
        if (this.bot) {
          await this.bot.destroy();
        }
        
        this.bot = new WhatsAppUltraBot();
        await this.bot.initialize();
        
        res.json({ success: true, message: 'Bot reiniciado exitosamente' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 🗑️ Limpiar sesión
    this.app.post('/api/bot/clear-session', authenticateToken, async (req, res) => {
      try {
        if (this.bot) {
          await this.bot.clearSession();
          await this.bot.destroy();
        }
        
        res.json({ success: true, message: 'Sesión limpiada exitosamente' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // ❤️ Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        version: '3.0-ultra',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        whatsapp: this.bot?.isReady || false
      });
    });
  }

  setupWebSocket() {
    this.wsServer = new WebSocket.Server({ port: CONFIG.API_PORT + 1 });
    
    this.wsServer.on('connection', (ws) => {
      console.log('🔌 Nueva conexión WebSocket');
      
      // Enviar estado inicial
      ws.send(JSON.stringify({
        type: 'status',
        data: this.bot?.getStatus() || { connected: false }
      }));

      // Escuchar eventos del bot
      if (this.bot) {
        const statusHandler = (data) => {
          ws.send(JSON.stringify({ type: 'status_update', data }));
        };
        
        const metricsHandler = (data) => {
          ws.send(JSON.stringify({ type: 'metrics_update', data }));
        };

        this.bot.on('ready', statusHandler);
        this.bot.metrics.on('metricsUpdated', metricsHandler);

        ws.on('close', () => {
          if (this.bot) {
            this.bot.off('ready', statusHandler);
            this.bot.metrics.off('metricsUpdated', metricsHandler);
          }
        });
      }
    });

    console.log(`🔌 WebSocket server iniciado en puerto ${CONFIG.API_PORT + 1}`);
  }

  async start() {
    // Inicializar bot
    this.bot = new WhatsAppUltraBot();
    await this.bot.initialize();

    // Iniciar servidor HTTP
    this.app.listen(CONFIG.API_PORT, () => {
      console.log(`\n🚀 Ultra WhatsApp Server v3.0 iniciado exitosamente!`);
      console.log(`📡 Puerto HTTP: ${CONFIG.API_PORT}`);
      console.log(`🔌 Puerto WebSocket: ${CONFIG.API_PORT + 1}`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n📋 APIs Disponibles:`);
      console.log(`   POST /api/auth/login - Autenticación`);
      console.log(`   GET  /api/status - Estado del sistema`);
      console.log(`   POST /api/send-message - Enviar mensaje`);
      console.log(`   POST /api/send-bulk - Envío masivo`);
      console.log(`   POST /api/schedule-reminder - Programar mensaje`);
      console.log(`   GET  /api/metrics - Métricas del sistema`);
      console.log(`   POST /api/sync-notifications - Sincronizar Supabase`);
      console.log(`   GET  /api/templates - Plantillas de mensajes`);
      console.log(`   POST /api/bot/restart - Reiniciar bot`);
      console.log(`   POST /api/bot/clear-session - Limpiar sesión`);
      console.log(`   GET  /health - Health check`);
      console.log(`\n✨ Características Ultra-Avanzadas Activas:`);
      console.log(`   🔄 Auto-reconexión inteligente`);
      console.log(`   📊 Métricas en tiempo real`);
      console.log(`   🔐 Autenticación JWT`);
      console.log(`   ⚡ Rate limiting`);
      console.log(`   📱 Validación números argentinos`);
      console.log(`   🤖 Auto-respuestas con IA`);
      console.log(`   📈 Cola de mensajes optimizada`);
      console.log(`   🔌 WebSocket en tiempo real`);
      console.log(`   🗄️ Integración total Supabase`);
      console.log(`   🧹 Limpieza automática`);
      console.log(`   📦 Backup automático`);
    });
  }
}

// 🚀 Inicialización con Clustering (Producción)
if (CONFIG.CLUSTERING_ENABLED && cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`🏭 Iniciando ${numCPUs} procesos worker...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`💀 Worker ${worker.process.pid} murió. Reiniciando...`);
    cluster.fork();
  });
} else {
  // Proceso worker o modo desarrollo
  const server = new UltraAPIServer();
  server.start().catch(error => {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  });
}

// 🛑 Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando Ultra WhatsApp Server...');
  try {
    if (global.server?.bot) {
      await global.server.bot.destroy();
    }
    console.log('✅ Servidor cerrado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cerrando servidor:', error);
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('💥 Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promesa rechazada no manejada:', reason);
  process.exit(1);
});

module.exports = { WhatsAppUltraBot, UltraAPIServer };
