import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MessageCircle, CreditCard, Clock, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PatientAppointmentRequestForm } from '@/components/PatientAppointmentRequestForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Appointment {
  id: string;
  appointment_date: string;
  type: string;
  status: string;
  meeting_url?: string;
  notes?: string;
  psychologist?: {
    first_name: string;
    last_name: string;
  };
}

interface PaymentReceipt {
  id: string;
  amount: number;
  receipt_date?: string;
  created_at: string;
  validation_status: string;
  notes?: string;
}

export const PatientPortal = () => {
  const { user, signOut } = useAuth();
  const { profile, patient } = useProfile();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [psychologistInfo, setPsychologistInfo] = useState<{ first_name: string; last_name: string } | null>(null);

  useEffect(() => {
    if (user && profile) {
      fetchPatientData();
    } else if (!user) {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    if (patient?.psychologist_id) {
      fetchPsychologistInfo();
    }
  }, [patient]);

  const fetchPatientData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          psychologist:psychologists(first_name, last_name)
        `)
        .eq('patient_id', user.id)
        .gte('appointment_date', new Date().toISOString())
        .in('status', ['scheduled', 'confirmed', 'accepted'])
        .order('appointment_date', { ascending: true });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      } else {
        setAppointments(appointmentsData || []);
      }

      // Fetch payment receipts
      const { data: receiptsData, error: receiptsError } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (receiptsError) {
        console.error('Error fetching receipts:', receiptsError);
      } else {
        setReceipts(receiptsData || []);
      }

    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPsychologistInfo = async () => {
    if (!patient?.psychologist_id) return;

    try {
      const { data, error } = await supabase
        .from('psychologists')
        .select('first_name, last_name')
        .eq('id', patient.psychologist_id)
        .single();

      if (error) {
        console.error('Error fetching psychologist info:', error);
      } else {
        setPsychologistInfo(data);
      }
    } catch (error) {
      console.error('Error fetching psychologist info:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando tu portal...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Acceso no autorizado</h1>
          <p className="text-slate-600">Por favor, inicia sesión para acceder a tu portal.</p>
        </div>
      </div>
    );
  }

  const patientName = patient 
    ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() 
    : profile.email || 'Usuario';
  const pendingPayment = receipts.find(r => r.validation_status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PC</span>
              </div>
              <span className="text-lg font-semibold text-slate-800">ProConnection</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {patientName.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-700 font-medium">{patientName}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  await signOut();
                  window.location.href = '/auth';
                }}
                className="hover:scale-105 transition-transform duration-200"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Hola, {patientName.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-600">
            Aquí podés gestionar tus citas y pagos de forma segura
          </p>
          {psychologistInfo && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tu profesional:</strong> {psychologistInfo.first_name} {psychologistInfo.last_name}
              </p>
            </div>
          )}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Próximas citas */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Mis próximas citas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => {
                    const aptDate = new Date(appointment.appointment_date);
                    const dateStr = aptDate.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                    const timeStr = aptDate.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });
                    const isOnline = appointment.type === 'online' || appointment.meeting_url;
                    const statusLabels: Record<string, string> = {
                      'scheduled': 'Programada',
                      'confirmed': 'Confirmada',
                      'accepted': 'Confirmada',
                      'pending': 'Pendiente'
                    };

                    return (
                      <div key={appointment.id} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-slate-800">
                              {dateStr}
                            </div>
                            <div className="text-slate-600">{timeStr}</div>
                            {appointment.psychologist && (
                              <div className="text-sm text-slate-500 mt-1">
                                Con {appointment.psychologist.first_name} {appointment.psychologist.last_name}
                              </div>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' || appointment.status === 'accepted'
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {statusLabels[appointment.status] || appointment.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            !isOnline
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {!isOnline ? 'Presencial' : 'Online'}
                          </span>
                          {appointment.meeting_url && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(appointment.meeting_url, '_blank')}
                              className="text-xs"
                              aria-label="Unirse a reunión"
                            >
                              Unirse
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No tenés citas programadas</p>
                  <Button 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    onClick={() => setShowAppointmentModal(true)}
                  >
                    Pedir turno
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagos */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Pago pendiente destacado */}
              {pendingPayment && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-700">Pago pendiente de validación</span>
                  </div>
                  <div className="text-red-600">
                    Tenés un pago pendiente de ${pendingPayment.amount.toLocaleString()}
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Tu psicólogo está revisando el comprobante de pago
                  </p>
                </div>
              )}

              {/* Historial de pagos */}
              <div className="space-y-3">
                {receipts.map((receipt) => {
                  const receiptDate = receipt.receipt_date || receipt.created_at;
                  const dateStr = new Date(receiptDate).toLocaleDateString('es-ES');
                  const statusLabels: Record<string, { label: string; color: string }> = {
                    'approved': { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
                    'pending': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
                    'rejected': { label: 'Rechazado', color: 'bg-red-100 text-red-800' }
                  };
                  const status = statusLabels[receipt.validation_status] || { label: receipt.validation_status, color: 'bg-gray-100 text-gray-800' };

                  return (
                    <div key={receipt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-800">
                          {receipt.notes || `Pago del ${dateStr}`}
                        </div>
                        <div className="text-sm text-slate-500">{dateStr}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-800">
                          ${receipt.amount.toLocaleString()}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button variant="outline" className="w-full mt-4">
                Ver historial completo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              ¿Necesitás ayuda?
            </h3>
            <p className="text-slate-600 mb-4">
              Si tenés alguna duda sobre tu portal o necesitás asistencia, contactanos
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contactar soporte
              </Button>
              <Button variant="outline">
                <User className="w-4 h-4 mr-2" />
                Hablar con mi psicólogo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal para pedir turno */}
      {patient?.psychologist_id && (
        <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Solicitar una nueva cita</DialogTitle>
            </DialogHeader>
            <PatientAppointmentRequestForm
              psychologistId={patient.psychologist_id}
              onClose={() => setShowAppointmentModal(false)}
              onRequestCreated={() => {
                fetchPatientData();
                setShowAppointmentModal(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
