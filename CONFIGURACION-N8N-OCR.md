
# Configuración Completa: n8n + OpenAI OCR para Comprobantes

## 1. Configuración de Supabase

### Agregar API Key de OpenAI en Secrets
1. Ve a tu proyecto de Supabase
2. Navega a Settings > Edge Functions > Secrets
3. Agrega el siguiente secret:
   ```
   OPENAI_API_KEY = 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
   ```

### Opcional: Configurar Webhook n8n
Si quieres usar n8n además de la Edge Function:
```
N8N_WEBHOOK_URL = https://tu-instancia-n8n.com/webhook/receipt-ocr
```

## 2. Configuración de n8n

### Importar Workflow
1. Copia el contenido del archivo `n8n-receipt-ocr-workflow.json`
2. En n8n, ve a Workflows > Import from JSON
3. Pega el JSON y guarda

### Configurar Credenciales

#### OpenAI API Key
1. Ve a Settings > Credentials
2. Crea nueva credencial: "OpenAI API Key"
3. Nombre: `openai-credentials`
4. API Key: `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`

#### Supabase API
1. Crea nueva credencial: "Supabase API"
2. Nombre: `supabase-credentials`
3. Host: `https://your-supabase-url.supabase.co`
4. Service Role Key: Tu service role key de Supabase

### ⚠️ CONFIGURACIÓN CRÍTICA: Nodo OpenAI Vision

**IMPORTANTE**: El nodo OpenAI debe configurarse exactamente así:

1. **Tipo de Nodo**: Usar "OpenAI" (no "OpenAI Chat Model" ni otros)
2. **Operación**: Seleccionar "Analyze Image" 
3. **Configuración específica**:
   - **Image Input Type**: "Binary Data"
   - **Binary Property**: `data` (por defecto)
   - **Prompt**: (ya está configurado en el JSON)
   - **Model**: `gpt-4o` o `gpt-4-vision-preview`
   - **Max Tokens**: 500
   - **Temperature**: 0.1

### Pasos Detallados para Configurar el Nodo OpenAI:

1. Abre el workflow importado
2. Haz clic en el nodo "OpenAI Vision Analysis"
3. En "Operation", selecciona "Analyze Image"
4. En "Image Input Type", selecciona "Binary Data"
5. En "Credentials", selecciona "openai-credentials"
6. Verifica que el prompt esté configurado
7. Configura las opciones avanzadas:
   - Max Tokens: 500
   - Temperature: 0.1

### Actualizar URLs en el Workflow
1. Abre el workflow importado
2. En los nodos "Update Receipt - Success" y "Update Receipt - Error":
   - Cambia `https://your-supabase-url.supabase.co` por tu URL real de Supabase

### Activar el Workflow
1. Activa el workflow en n8n
2. Copia la URL del webhook (aparece en el nodo "Webhook Trigger")

## 3. Configuración en el Sistema

### Actualizar URL del Webhook
En `PatientAppointmentRequestForm.tsx`, línea ~100, cambia:
```typescript
const webhookUrl = 'https://tu-instancia-n8n.com/webhook/receipt-ocr';
```
Por tu URL real del webhook de n8n.

## 4. Resolución de Problemas Específicos

### Si el nodo OpenAI no aparece o no funciona:

1. **Verificar instalación del nodo**:
   - Ve a Settings > Community Nodes
   - Busca e instala "@n8n/n8n-nodes-openai" si no está instalado

2. **Configuración correcta del nodo**:
   - **NO uses**: "Chat" o "Custom API Call"
   - **SÍ usa**: "Analyze Image" operation
   - **Importante**: El tipo debe ser "OpenAI" (base node)

3. **Verificar credenciales**:
   - La API key debe ser válida y tener acceso a modelos de visión
   - Probar la conexión en las credenciales

4. **Formato de imagen**:
   - Asegurar que el archivo se descarga como binary
   - Verificar que es JPG, PNG o PDF válido

### Si continúa sin funcionar:
1. Check logs del workflow execution
2. Verificar que el archivo se descarga correctamente
3. Probar el nodo OpenAI manualmente con una imagen de prueba
4. Revisar que las credenciales tengan permisos para Vision API

## 5. Flujo Completo del Sistema

### Cuando un paciente sube un comprobante:

1. **Frontend**: Paciente sube archivo en `PatientAppointmentRequestForm`
2. **Supabase Storage**: Archivo se guarda en bucket `payment-proofs`
3. **Database**: Se crea registro en `payment_receipts` con status `pending`
4. **Doble Procesamiento**:
   - **Edge Function**: `process-receipt-ocr` procesa con OpenAI
   - **n8n Webhook**: Workflow paralelo procesa con OpenAI
5. **OpenAI Vision**: Extrae datos del comprobante automáticamente
6. **Database Update**: Se actualiza registro con datos extraídos
7. **Real-time**: Frontend recibe notificación de procesamiento completo
8. **Profesional**: Ve comprobante procesado para validación

## 6. Testing del Workflow

Para probar que el nodo OpenAI funciona:

1. **Test Manual**:
   - En n8n, abre el workflow
   - Haz clic en "Execute Workflow"
   - Proporciona datos de prueba:
     ```json
     {
       "fileUrl": "URL_DE_IMAGEN_DE_PRUEBA",
       "receiptId": "test-123"
     }
     ```

2. **Test desde Sistema**:
   - Sube un comprobante como paciente
   - Verifica logs del workflow en n8n
   - Check que el nodo OpenAI ejecute correctamente

3. **Verificación de Resultados**:
   - El nodo debe retornar JSON con datos extraídos
   - La base de datos debe actualizarse con status "extracted"
   - El frontend debe mostrar notificación de procesamiento completo

## 7. Beneficios del Sistema

- ✅ **Procesamiento Automático**: Sin intervención manual
- ✅ **Doble Redundancia**: Edge Function + n8n
- ✅ **Tiempo Real**: Notificaciones instantáneas
- ✅ **Alta Precisión**: OpenAI Vision API
- ✅ **Validación Humana**: Profesional revisa antes de aprobar
- ✅ **Integración Contable**: Automáticamente en reportes mensuales
