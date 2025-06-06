
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Edit,
  FileText
} from "lucide-react";
import { usePaymentReceipts } from "@/hooks/usePaymentReceipts";

interface ReceiptValidationPanelProps {
  psychologistId: string;
}

export const ReceiptValidationPanel = ({ psychologistId }: ReceiptValidationPanelProps) => {
  const { receipts, validateReceipt, updateReceiptInclusion, loading } = usePaymentReceipts(psychologistId);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [validationNotes, setValidationNotes] = useState('');

  const pendingReceipts = receipts.filter(r => r.validation_status === 'pending');

  const handleEditData = (receipt: any) => {
    setSelectedReceipt(receipt);
    setEditingData({
      receipt_date: receipt.receipt_date || '',
      amount: receipt.amount || '',
      receipt_type: receipt.receipt_type || '',
      receipt_number: receipt.receipt_number || '',
      patient_cuit: receipt.patient_cuit || '',
      payment_method: receipt.payment_method || ''
    });
    setValidationNotes('');
  };

  const handleApprove = async (receiptId: string) => {
    await validateReceipt(receiptId, 'approved', validationNotes, editingData);
    setSelectedReceipt(null);
    setEditingData({});
    setValidationNotes('');
  };

  const handleReject = async (receiptId: string) => {
    await validateReceipt(receiptId, 'rejected', validationNotes);
    setSelectedReceipt(null);
    setValidationNotes('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      case 'needs_correction':
        return <Badge variant="secondary"><Edit className="w-3 h-3 mr-1" />Requiere corrección</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validación de Comprobantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-slate-600">Cargando comprobantes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Validación de Comprobantes
          {pendingReceipts.length > 0 && (
            <Badge variant="outline">{pendingReceipts.length} pendientes</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(receipt.validation_status)}
                    <span className="text-sm text-slate-600">
                      {new Date(receipt.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-slate-700">Fecha</p>
                      <p>{receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString() : 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Monto</p>
                      <p>{formatCurrency(receipt.amount)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Tipo</p>
                      <p>{receipt.receipt_type || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Método de pago</p>
                      <p>{receipt.payment_method || 'No especificado'}</p>
                    </div>
                  </div>

                  {receipt.validation_notes && (
                    <div className="mt-3 p-2 bg-slate-50 rounded border-l-4 border-blue-500">
                      <p className="text-sm text-slate-700">{receipt.validation_notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={receipt.include_in_report}
                      onCheckedChange={(checked) => updateReceiptInclusion(receipt.id, checked)}
                    />
                    <Label className="text-xs">Incluir en reporte</Label>
                  </div>
                  
                  {receipt.original_file_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={receipt.original_file_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </a>
                    </Button>
                  )}
                  
                  {receipt.validation_status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditData(receipt)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>
              </div>

              {selectedReceipt?.id === receipt.id && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                  <h4 className="font-medium mb-3">Editar datos del comprobante</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="receipt_date">Fecha</Label>
                      <Input
                        id="receipt_date"
                        type="date"
                        value={editingData.receipt_date}
                        onChange={(e) => setEditingData({...editingData, receipt_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Monto</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={editingData.amount}
                        onChange={(e) => setEditingData({...editingData, amount: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="receipt_type">Tipo de comprobante</Label>
                      <select
                        id="receipt_type"
                        className="w-full p-2 border rounded"
                        value={editingData.receipt_type}
                        onChange={(e) => setEditingData({...editingData, receipt_type: e.target.value})}
                      >
                        <option value="">Seleccionar</option>
                        <option value="factura_a">Factura A</option>
                        <option value="factura_b">Factura B</option>
                        <option value="factura_c">Factura C</option>
                        <option value="ticket">Ticket</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="payment_method">Método de pago</Label>
                      <select
                        id="payment_method"
                        className="w-full p-2 border rounded"
                        value={editingData.payment_method}
                        onChange={(e) => setEditingData({...editingData, payment_method: e.target.value})}
                      >
                        <option value="">Seleccionar</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta_debito">Tarjeta de débito</option>
                        <option value="tarjeta_credito">Tarjeta de crédito</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="validation_notes">Notas de validación</Label>
                    <Textarea
                      id="validation_notes"
                      placeholder="Agregar notas sobre la validación..."
                      value={validationNotes}
                      onChange={(e) => setValidationNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApprove(receipt.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleReject(receipt.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rechazar
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedReceipt(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {receipts.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay comprobantes para revisar</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
