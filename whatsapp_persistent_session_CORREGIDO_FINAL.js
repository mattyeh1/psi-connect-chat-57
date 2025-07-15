
// 🚀 Ultra-Optimized WhatsApp Server v4.0 - Enterprise Edition
// Integración completa con Supabase para Sistema de Psicólogos
// Características avanzadas: Auto-reconnect, JWT Auth, Rate Limiting, AI Optimization
// FIXED: Persistent Session Management + Complete REST API

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
const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

// 🔧 Configuración Ultra-Avanzada
const CONFIG = {
  API_PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'ultra-secure-jwt-secret-2024',
  SUPABASE_URL: 'https://scikpgzpgzevkgwwobrf.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaWtwZ3pwZ3pldmtnd3dvYnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTQwOTEsImV4cCI6MjA2MzY5MDA5MX0._ToVfRlR4cuZ_xhZozT-zEHoc43V8iLDWp-wu_Ty_Io',
  RECONNECT_INTERVAL: 10000,
  MAX_RECONNECT_ATTEMPTS: 50,
  MESSAGE_RETRY_ATTEMPTS: 3,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 100,
  SESSION_BACKUP_INTERVAL: 2 * 60 * 1000,
  HEALTH_CHECK_INTERVAL: 15000,
  AUTO_CLEANUP_INTERVAL: 24 * 60 * 60 * 1000,
  SESSION_PATH: path.join(process.cwd(), 'whatsapp-sessions'),
  CLIENT_ID: 'persistent-whatsapp-client'
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
      lastUpdate: Date.now(),
      totalMessagesSent: 0,
      totalMessagesReceived: 0,
      uniqueContacts: 0,
      uptime: 0
    };
    this.messageCount = 0;
    this.errorCount = 0;
    this.responseTimeSum = 0;
    this.responseTimes = [];
    this.startTime = Date.now();
    this.startMetricsCollection();
  }

  startMetricsCollection() {
    setInterval(() => {
      this.calculateMetrics();
      this.emit('metricsUpdated', this.metrics);
    }, 60000);
  }

  calculateMetrics() {
    const usage = process.cpuUsage();
    const memUsage = process.memoryUsage();
    
    this.metrics = {
      ...this.metrics,
      messagesPerMinute: this.messageCount,
      successRate: this.messageCount > 0 ? ((this.messageCount - this.errorCount) / this.messageCount * 100) : 100,
      avgResponseTime: this.responseTimes.length > 0 ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length : 0,
      errorRate: this.messageCount > 0 ? (this.errorCount / this.messageCount * 100) : 0,
      cpuUsage: (usage.user + usage.system) / 1000000,
      memoryUsage: memUsage.heapUsed / 1024 / 1024,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      lastUpdate: Date.now()
    };

    this.messageCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
  }

  recordMessage(success = true, responseTime = 0) {
    this.messageCount++;
    if (!success) this.errorCount++;
    if (responseTime > 0) this.responseTimes.push(responseTime);
  }

  async updateDatabaseStats() {
    try {
      const { data: stats } = await supabase
        .from('whatsapp_bot_stats')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (stats) {
        this.metrics.totalMessagesSent = stats.messages_sent;
        this.metrics.totalMessagesReceived = stats.messages_received;
      }

      const { count: contactsCount } = await supabase
        .from('whatsapp_contacts')
        .select('*', { count: 'exact', head: true });

      this.metrics.uniqueContacts = contactsCount || 0;
    } catch (error) {
      console.error('Error updating database stats:', error);
    }
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
      let message = this.priorityQueue.shift();
      if (!message) message = this.retryQueue.shift();
      if (!message) message = this.queue.shift();

      if (message && new Date() >= new Date(message.scheduledFor)) {
        const success = await this.processMessage(message);
        
        if (!success && message.attempts < CONFIG.MESSAGE_RETRY_ATTEMPTS) {
          message.attempts++;
          message.scheduledFor = new Date(Date.now() + (message.attempts * 30000));
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

// 💾 Sistema de Persistencia de Sesión
class SessionManager {
  constructor(sessionPath, clientId) {
    this.sessionPath = sessionPath;
    this.clientId = clientId;
    this.backupInterval = null;
    this.sessionData = null;
  }

  async ensureSessionDirectory() {
    try {
      await fs.mkdir(this.sessionPath, { recursive: true });
      console.log(`📁 Directorio de sesión creado: ${this.sessionPath}`);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error('Error creando directorio de sesión:', error);
      }
    }
  }

  async saveSessionInfo(sessionData) {
    try {
      const sessionFile = path.join(this.sessionPath, 'session-info.json');
      await fs.writeFile(sessionFile, JSON.stringify({
        ...sessionData,
        lastBackup: new Date().toISOString(),
        clientId: this.clientId
      }, null, 2));
      
      this.sessionData = sessionData;
      console.log('💾 Información de sesión guardada');
    } catch (error) {
      console.error('Error guardando información de sesión:', error);
    }
  }

  async loadSessionInfo() {
    try {
      const sessionFile = path.join(this.sessionPath, 'session-info.json');
      const data = await fs.readFile(sessionFile, 'utf8');
      this.sessionData = JSON.parse(data);
      console.log('📖 Información de sesión cargada');
      return this.sessionData;
    } catch (error) {
      console.log('ℹ️ No se encontró información de sesión previa');
      return null;
    }
  }

  async sessionExists() {
    try {
      const sessionDir = path.join(this.sessionPath, `session-${this.clientId}`);
      const stats = await fs.stat(sessionDir);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }

  async clearSession() {
    try {
      const sessionDir = path.join(this.sessionPath, `session-${this.clientId}`);
      await fs.rm(sessionDir, { recursive: true, force: true });
      
      const sessionFile = path.join(this.sessionPath, 'session-info.json');
      await fs.rm(sessionFile, { force: true });
      
      console.log('🗑️ Sesión limpiada completamente');
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  }

  startBackup() {
    this.backupInterval = setInterval(async () => {
      if (this.sessionData) {
        await this.saveSessionInfo(this.sessionData);
      }
    }, CONFIG.SESSION_BACKUP_INTERVAL);
  }

  stopBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }
}

// 🤖 Bot Ultra-Optimizado con Sesión Persistente
class WhatsAppUltraBot extends EventEmitter {
  constructor() {
    super();
    this.client = null;
    this.isReady = false;
    this.isInitializing = false;
    this.reconnectAttempts = 0;
    this.messageQueue = new MessageQueue();
    this.metrics = new MetricsCollector();
    this.sessionManager = new SessionManager(CONFIG.SESSION_PATH, CONFIG.CLIENT_ID);
    this.healthCheckInterval = null;
    this.qrCode = null;
    this.phoneNumber = null;
    this.deviceInfo = {};
    this.isDestroyed = false;
    this.reconnectTimeout = null;
    
    this.setupMessageQueue();
  }

  async initialize() {
    if (this.isInitializing || this.isDestroyed) return;
    
    this.isInitializing = true;
    console.log('🚀 Inicializando WhatsApp Ultra Bot v4.0 con sesión persistente...');

    try {
      await this.sessionManager.ensureSessionDirectory();
      
      const sessionInfo = await this.sessionManager.loadSessionInfo();
      if (sessionInfo) {
        console.log(`📱 Sesión anterior encontrada: ${sessionInfo.phoneNumber}`);
      }

      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: CONFIG.SESSION_PATH,
          clientId: CONFIG.CLIENT_ID
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
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ],
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        },
        webVersionCache: {
          type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        }
      });

      this.setupEventHandlers();
      
      const initPromise = this.client.initialize();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout de inicialización')), 60000);
      });

      await Promise.race([initPromise, timeoutPromise]);
      
    } catch (error) {
      console.error('❌ Error inicializando cliente:', error);
      this.isInitializing = false;
      if (!this.isDestroyed) {
        await this.scheduleReconnect();
      }
    }
  }

  setupEventHandlers() {
    this.client.on('qr', async (qr) => {
      this.qrCode = qr;
      console.log('\n🔗 CÓDIGO QR GENERADO (Escanea con WhatsApp):');
      qrcode.generate(qr, { small: true });
      
      await this.updateSessionStatus('qr_pending', qr);
    });

    this.client.on('ready', async () => {
      this.isReady = true;
      this.isInitializing = false;
      this.reconnectAttempts = 0;
      this.qrCode = null;
      
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      
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
      
      await this.sessionManager.saveSessionInfo({
        phoneNumber: this.phoneNumber,
        deviceInfo: this.deviceInfo,
        connectedAt: new Date().toISOString()
      });
      
      await this.updateSessionStatus('connected', null, this.phoneNumber, this.deviceInfo);
      
      this.startHealthChecks();
      this.sessionManager.startBackup();
      
      await this.processSupabaseNotifications();
      this.emit('ready', this.deviceInfo);
    });

    this.client.on('message', async (message) => {
      if (!this.isDestroyed) {
        await this.handleIncomingMessage(message);
      }
    });

    this.client.on('message_ack', async (message, ack) => {
      if (!this.isDestroyed) {
        await this.handleMessageAck(message, ack);
      }
    });

    this.client.on('disconnected', async (reason) => {
      this.isReady = false;
      console.log(`❌ WhatsApp desconectado: ${reason}`);
      
      await this.updateSessionStatus('disconnected');
      
      if (!this.isDestroyed) {
        await this.scheduleReconnect();
      }
    });

    this.client.on('auth_failure', async (msg) => {
      this.isReady = false;
      console.log(`❌ Error de autenticación: ${msg}`);
      
      await this.updateSessionStatus('auth_failure');
      
      if (!this.isDestroyed) {
        if (msg.includes('UNPAIRED') || msg.includes('LOGOUT')) {
          console.log('🗑️ Limpiando sesión por error de autenticación');
          await this.sessionManager.clearSession();
        }
        await this.scheduleReconnect();
      }
    });

    this.client.on('change_state', (state) => {
      console.log(`🔄 Estado cambiado a: ${state}`);
    });

    this.client.on('change_battery', (batteryInfo) => {
      console.log(`🔋 Batería: ${batteryInfo.battery}% - ${batteryInfo.plugged ? 'Conectado' : 'Desconectado'}`);
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
    if (!this.isReady || this.isDestroyed) {
      console.log('❌ WhatsApp no está conectado');
      return false;
    }

    try {
      const formattedNumber = this.formatArgentinePhoneNumber(phoneNumber);
      const chatId = `${formattedNumber}@c.us`;

      const isValidNumber = await this.client.isRegisteredUser(chatId);
      if (!isValidNumber) {
        console.log(`⚠️ Número no registrado en WhatsApp: ${phoneNumber}`);
        return false;
      }

      await this.client.sendMessage(chatId, message);
      
      await this.logMessage({
        from_number: this.phoneNumber,
        to_number: formattedNumber,
        message_body: message,
        direction: 'outgoing',
        whatsapp_message_id: `msg_${Date.now()}`,
        notification_id: notificationId,
        message_timestamp: new Date().toISOString(),
        delivery_status: 'sent'
      });

      console.log(`📤 Mensaje enviado exitosamente a ${phoneNumber}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Error enviando mensaje a ${phoneNumber}:`, error);
      return false;
    }
  }

  formatArgentinePhoneNumber(phone) {
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

      const sentiment = this.analyzeSentiment(messageText);
      const autoResponse = await this.generateAutoResponse(messageText, sentiment);
      
      if (autoResponse) {
        await message.reply(autoResponse);
        console.log(`🤖 Auto-respuesta enviada: ${autoResponse}`);
      }

      const isMedia = message.hasMedia;
      let mediaType = null;
      if (isMedia) {
        mediaType = message.type;
      }

      await this.logMessage({
        from_number: phoneNumber,
        to_number: this.phoneNumber,
        message_body: messageText,
        direction: 'incoming',
        whatsapp_message_id: message.id.id,
        contact_name: userName,
        message_timestamp: new Date().toISOString(),
        is_media: isMedia,
        media_type: mediaType,
        delivery_status: 'received',
        metadata: { userName, sentiment }
      });

    } catch (error) {
      console.error('❌ Error procesando mensaje entrante:', error);
    }
  }

  analyzeSentiment(text) {
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
    
    return null;
  }

  async handleMessageAck(message, ack) {
    const status = ['pending', 'sent', 'delivered', 'read'][ack] || 'unknown';
    
    try {
      await supabase
        .from('whatsapp_messages')
        .update({ delivery_status: status })
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
      // Primero, verificar si existe una sesión
      const { data: existingSession } = await supabase
        .from('whatsapp_sessions')
        .select('id')
        .eq('session_id', CONFIG.CLIENT_ID)
        .single();

      if (existingSession) {
        // Actualizar sesión existente
        await supabase
          .from('whatsapp_sessions')
          .update({
            status,
            qr_code: qrCode,
            phone_number: phoneNumber,
            device_info: deviceInfo,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSession.id);
      } else {
        // Crear nueva sesión
        await supabase
          .from('whatsapp_sessions')
          .insert({
            session_id: CONFIG.CLIENT_ID,
            status,
            qr_code: qrCode,
            phone_number: phoneNumber,
            device_info: deviceInfo,
            last_activity: new Date().toISOString()
          });
      }
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
      // Obtener la sesión actual
      const { data: session } = await supabase
        .from('whatsapp_sessions')
        .select('id')
        .eq('session_id', CONFIG.CLIENT_ID)
        .single();

      if (session) {
        // Insertar mensaje con referencia a la sesión
        await supabase
          .from('whatsapp_messages')
          .insert({
            session_id: session.id,
            from_number: messageData.from_number,
            to_number: messageData.to_number,
            message_body: messageData.message_body,
            direction: messageData.direction,
            whatsapp_message_id: messageData.whatsapp_message_id,
            contact_name: messageData.contact_name,
            message_timestamp: messageData.message_timestamp,
            is_media: messageData.is_media || false,
            media_type: messageData.media_type,
            delivery_status: messageData.delivery_status || 'sent',
            notification_id: messageData.notification_id,
            metadata: messageData.metadata || {}
          });
      }
    } catch (error) {
      console.error('Error registrando mensaje:', error);
    }
  }

  startHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      if (this.isDestroyed) return;
      
      try {
        if (this.isReady && this.client) {
          const state = await this.client.getState();
          if (state !== 'CONNECTED') {
            console.log(`⚠️ Cliente no conectado (${state}), iniciando reconexión...`);
            await this.scheduleReconnect();
          } else {
            await this.processSupabaseNotifications();
            await this.metrics.updateDatabaseStats();
          }
        }
      } catch (error) {
        console.error('❌ Error en health check:', error);
        if (!this.isDestroyed) {
          await this.scheduleReconnect();
        }
      }
    }, CONFIG.HEALTH_CHECK_INTERVAL);
  }

  async scheduleReconnect() {
    if (this.isDestroyed || this.reconnectTimeout) return;
    
    if (this.reconnectAttempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) {
      console.log('❌ Máximo número de intentos de reconexión alcanzado');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(CONFIG.RECONNECT_INTERVAL * Math.pow(2, this.reconnectAttempts - 1), 300000);
    
    console.log(`🔄 Programando reconexión ${this.reconnectAttempts}/${CONFIG.MAX_RECONNECT_ATTEMPTS} en ${delay/1000}s`);
    
    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null;
      if (!this.isDestroyed) {
        await this.reconnect();
      }
    }, delay);
  }

  async reconnect() {
    if (this.isDestroyed) return;
    
    console.log('🔄 Iniciando reconexión...');
    
    try {
      if (this.client) {
        await this.client.destroy();
      }

      await this.initialize();
    } catch (error) {
      console.error('❌ Error durante la reconexión:', error);
    }
  }

  // Métodos públicos para el API
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

  async restart() {
    console.log('🔄 Reiniciando bot...');
    this.isDestroyed = true;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.sessionManager.stopBackup();
    
    if (this.client) {
      await this.client.destroy();
    }
    
    // Reinicializar
    this.isDestroyed = false;
    this.isReady = false;
    this.reconnectAttempts = 0;
    await this.initialize();
  }

  async clearSession() {
    console.log('🗑️ Limpiando sesión...');
    this.isDestroyed = true;
    
    if (this.client) {
      await this.client.destroy();
    }
    
    await this.sessionManager.clearSession();
    
    // Reinicializar
    this.isDestroyed = false;
    this.isReady = false;
    this.reconnectAttempts = 0;
    await this.initialize();
  }
}

// Instancia global del bot
let bot = null;

// 🚀 Inicializar y lanzar el bot
async function initializeBot() {
  bot = new WhatsAppUltraBot();
  await bot.initialize();
}

// =================== 🌐 SERVIDOR EXPRESS ===================

const app = express();

// Middleware de seguridad y configuración
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW,
  max: CONFIG.RATE_LIMIT_MAX,
  message: { error: 'Demasiadas solicitudes, intenta más tarde' }
});

// Rate limiting específico para envío de mensajes
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // Máximo 10 mensajes por minuto
  message: { error: 'Límite de mensajes alcanzado, espera un minuto' }
});

// Middleware de autenticación JWT
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

// Aplicar rate limiting general
app.use(generalLimiter);

// =================== 🔐 RUTAS DE AUTENTICACIÓN ===================

// Login básico (para demo - en producción usar autenticación más robusta)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validación básica (en producción, verificar contra base de datos)
    if (username === 'admin' && password === 'whatsapp2024') {
      const token = jwt.sign(
        { username, role: 'admin' },
        CONFIG.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ success: true, token, message: 'Login exitoso' });
    } else {
      res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================== 📱 RUTAS DEL BOT ===================

// Estado básico del servidor (sin autenticación)
app.get('/api/status', (req, res) => {
  const status = bot ? bot.getStatus() : { connected: false, error: 'Bot no inicializado' };
  res.json(status);
});

// Estado detallado del bot (con autenticación)
app.get('/api/status/detailed', authenticateToken, async (req, res) => {
  try {
    if (!bot) {
      return res.status(503).json({ error: 'Bot no inicializado' });
    }

    const status = bot.getStatus();
    
    // Obtener estadísticas adicionales de la base de datos
    const { data: todayStats } = await supabase
      .from('whatsapp_bot_stats')
      .select('*')
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    const { data: recentMessages } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      ...status,
      todayStats: todayStats || { messages_sent: 0, messages_received: 0 },
      recentMessages: recentMessages || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Información de la sesión actual
app.get('/api/session', authenticateToken, (req, res) => {
  try {
    if (!bot) {
      return res.status(503).json({ error: 'Bot no inicializado' });
    }

    const sessionInfo = {
      connected: bot.isReady,
      phoneNumber: bot.phoneNumber,
      deviceInfo: bot.deviceInfo,
      qrCode: bot.qrCode,
      uptime: bot.metrics.metrics.uptime,
      lastActivity: new Date().toISOString()
    };

    res.json(sessionInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =================== 📤 ENVÍO DE MENSAJES ===================

// Validar número de teléfono argentino
const validateArgentinePhone = (phone) => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return /^(\+54|54)?9?\d{8,12}$/.test(cleaned);
};

// Enviar mensaje individual
app.post('/api/send', [authenticateToken, messageLimiter], async (req, res) => {
  try {
    const { phoneNumber, message, priority = 'normal' } = req.body;

    // Validaciones
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Número de teléfono y mensaje son requeridos' 
      });
    }

    if (!validateArgentinePhone(phoneNumber)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Número de teléfono inválido (debe ser argentino)' 
      });
    }

    if (message.length > 4096) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mensaje demasiado largo (máximo 4096 caracteres)' 
      });
    }

    if (!bot || !bot.isReady) {
      return res.status(503).json({ 
        success: false, 
        error: 'WhatsApp bot no está conectado' 
      });
    }

    // Enviar mensaje
    const success = await bot.sendDirectMessage(phoneNumber, message);

    if (success) {
      res.json({ 
        success: true, 
        message: 'Mensaje enviado exitosamente',
        phoneNumber: bot.formatArgentinePhoneNumber(phoneNumber),
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Error enviando mensaje. Verifica que el número esté registrado en WhatsApp.' 
      });
    }

  } catch (error) {
    console.error('Error en /api/send:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enviar mensajes en lote
app.post('/api/send-bulk', [authenticateToken, messageLimiter], async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requiere un array de mensajes' 
      });
    }

    if (messages.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: 'Máximo 50 mensajes por lote' 
      });
    }

    if (!bot || !bot.isReady) {
      return res.status(503).json({ 
        success: false, 
        error: 'WhatsApp bot no está conectado' 
      });
    }

    const results = [];
    
    for (const msg of messages) {
      const { phoneNumber, message, priority = 'normal' } = msg;
      
      if (!phoneNumber || !message) {
        results.push({ 
          phoneNumber, 
          success: false, 
          error: 'Número y mensaje requeridos' 
        });
        continue;
      }

      if (!validateArgentinePhone(phoneNumber)) {
        results.push({ 
          phoneNumber, 
          success: false, 
          error: 'Número inválido' 
        });
        continue;
      }

      // Agregar a la cola en lugar de enviar inmediatamente
      bot.messageQueue.addMessage({
        phoneNumber,
        message,
        priority
      }, priority);

      results.push({ 
        phoneNumber: bot.formatArgentinePhoneNumber(phoneNumber), 
        success: true, 
        status: 'queued' 
      });

      // Pausa entre mensajes para evitar spam
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    res.json({ 
      success: true, 
      message: `${results.length} mensajes procesados`,
      results,
      queueStats: bot.messageQueue.getQueueStats()
    });

  } catch (error) {
    console.error('Error en /api/send-bulk:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================== 📨 CONSULTA DE MENSAJES ===================

// Obtener mensajes con filtros y paginación
app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      direction,
      phone,
      startDate,
      endDate,
      search
    } = req.query;

    // Validar parámetros
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Construir query
    let query = supabase
      .from('whatsapp_messages')
      .select(`
        *,
        whatsapp_sessions!inner(session_id)
      `)
      .eq('whatsapp_sessions.session_id', CONFIG.CLIENT_ID);

    // Aplicar filtros
    if (direction && ['incoming', 'outgoing'].includes(direction)) {
      query = query.eq('direction', direction);
    }

    if (phone) {
      const formattedPhone = bot ? bot.formatArgentinePhoneNumber(phone) : phone;
      query = query.or(`from_number.eq.${formattedPhone},to_number.eq.${formattedPhone}`);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (search) {
      query = query.ilike('message_body', `%${search}%`);
    }

    // Obtener total de registros para paginación
    const { count } = await query.select('*', { count: 'exact', head: true });

    // Obtener datos paginados
    const { data: messages, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    res.json({
      success: true,
      messages: messages || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum)
      },
      filters: {
        direction,
        phone,
        startDate,
        endDate,
        search
      }
    });

  } catch (error) {
    console.error('Error en /api/messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener estadísticas de mensajes
app.get('/api/messages/stats', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = Math.min(365, Math.max(1, parseInt(days)));
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // Estadísticas por día
    const { data: dailyStats } = await supabase
      .from('whatsapp_bot_stats')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    // Contactos más activos
    const { data: topContacts } = await supabase
      .from('whatsapp_contacts')
      .select('phone_number, contact_name, message_count, last_message_at')
      .order('message_count', { ascending: false })
      .limit(10);

    // Estadísticas generales
    const { data: totalStats } = await supabase
      .from('whatsapp_messages')
      .select('direction')
      .gte('created_at', startDate.toISOString());

    const sentCount = totalStats?.filter(m => m.direction === 'outgoing').length || 0;
    const receivedCount = totalStats?.filter(m => m.direction === 'incoming').length || 0;

    res.json({
      success: true,
      period: {
        days: daysNum,
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      totals: {
        sent: sentCount,
        received: receivedCount,
        total: sentCount + receivedCount
      },
      dailyStats: dailyStats || [],
      topContacts: topContacts || []
    });

  } catch (error) {
    console.error('Error en /api/messages/stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================== 👥 GESTIÓN DE CONTACTOS ===================

// Obtener contactos
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('whatsapp_contacts')
      .select('*');

    if (search) {
      query = query.or(`contact_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }

    const { count } = await query.select('*', { count: 'exact', head: true });

    const { data: contacts, error } = await query
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    res.json({
      success: true,
      contacts: contacts || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum)
      }
    });

  } catch (error) {
    console.error('Error en /api/contacts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================== 🔧 CONTROL DEL BOT ===================

// Reiniciar bot
app.post('/api/bot/restart', authenticateToken, async (req, res) => {
  try {
    if (!bot) {
      return res.status(503).json({ 
        success: false, 
        error: 'Bot no inicializado' 
      });
    }

    await bot.restart();
    
    res.json({ 
      success: true, 
      message: 'Bot reiniciado exitosamente' 
    });

  } catch (error) {
    console.error('Error reiniciando bot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Limpiar sesión
app.post('/api/bot/clear-session', authenticateToken, async (req, res) => {
  try {
    if (!bot) {
      return res.status(503).json({ 
        success: false, 
        error: 'Bot no inicializado' 
      });
    }

    await bot.clearSession();
    
    res.json({ 
      success: true, 
      message: 'Sesión limpiada y bot reiniciado' 
    });

  } catch (error) {
    console.error('Error limpiando sesión:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================== 📊 MÉTRICAS ===================

// Obtener métricas del bot
app.get('/api/metrics', authenticateToken, (req, res) => {
  try {
    if (!bot) {
      return res.status(503).json({ error: 'Bot no inicializado' });
    }

    const metrics = bot.metrics.metrics;
    const queueStats = bot.messageQueue.getQueueStats();

    res.json({
      success: true,
      metrics: {
        ...metrics,
        queue: queueStats,
        bot: {
          connected: bot.isReady,
          reconnectAttempts: bot.reconnectAttempts,
          phoneNumber: bot.phoneNumber
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================== 🏥 HEALTH CHECK ===================

// Health check detallado
app.get('/health', (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      bot: {
        initialized: !!bot,
        connected: bot ? bot.isReady : false,
        phoneNumber: bot ? bot.phoneNumber : null
      }
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// =================== 🚫 MANEJO DE ERRORES ===================

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint no encontrado' 
  });
});

// =================== 🚀 INICIAR SERVIDOR ===================

// Ruta básica
app.get('/', (req, res) => {
  res.json({
    name: 'WhatsApp UltraBot API v4.0',
    status: 'online',
    version: '4.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth/login',
      status: '/api/status',
      send: '/api/send',
      messages: '/api/messages',
      contacts: '/api/contacts',
      metrics: '/api/metrics',
      health: '/health'
    }
  });
});

// Iniciar servidor y bot
const server = app.listen(CONFIG.API_PORT, async () => {
  console.log(`🚀 WhatsApp UltraBot API v4.0 iniciado en puerto ${CONFIG.API_PORT}`);
  console.log(`📡 Endpoint de estado: http://localhost:${CONFIG.API_PORT}/api/status`);
  console.log(`📚 Documentación: http://localhost:${CONFIG.API_PORT}/`);
  
  // Inicializar bot después de que el servidor esté listo
  try {
    await initializeBot();
  } catch (error) {
    console.error('❌ Error inicializando bot:', error);
  }
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('🔄 Cerrando servidor gracefully...');
  
  if (bot) {
    bot.isDestroyed = true;
    if (bot.client) {
      await bot.client.destroy();
    }
  }
  
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🔄 Cerrando servidor por SIGINT...');
  
  if (bot) {
    bot.isDestroyed = true;
    if (bot.client) {
      await bot.client.destroy();
    }
  }
  
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente');
    process.exit(0);
  });
});

module.exports = app;
