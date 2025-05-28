import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Clock, Calendar, AlertTriangle, CheckCircle, Settings, Plus, DollarSign } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AffiliateAdminPanel } from './AffiliateAdminPanel';

export const AdminPanel = () => {
  const { isAdmin, psychologistStats, loading, refetch } = useAdmin();
  const { toast } = useToast();
  const [selectedPsychologist, setSelectedPsychologist] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'trial' | 'subscription'>('trial');
  const [additionalDays, setAdditionalDays] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [subscriptionDays, setSubscriptionDays] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      refetch();
    }
  }, [isAdmin, refetch]);

  const handleUpdateTrialDays = async () => {
    if (!selectedPsychologist || !additionalDays) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase.rpc('admin_update_trial_days', {
        psychologist_id: selectedPsychologist.id,
        additional_days: parseInt(additionalDays)
      });

      if (error) throw error;

      toast({
        title: "Trial actualizado",
        description: `Se agregaron ${additionalDays} días al trial de ${selectedPsychologist.first_name} ${selectedPsychologist.last_name}`,
      });

      setDialogOpen(false);
      setAdditionalDays('');
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el trial",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateSubscriptionStatus = async () => {
    if (!selectedPsychologist || !newStatus) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase.rpc('admin_update_subscription_status', {
        psychologist_id: selectedPsychologist.id,
        new_status: newStatus,
        subscription_days: subscriptionDays ? parseInt(subscriptionDays) : null
      });

      if (error) throw error;

      toast({
        title: "Suscripción actualizada",
        description: `El estado de ${selectedPsychologist.first_name} ${selectedPsychologist.last_name} se cambió a ${newStatus}`,
      });

      setDialogOpen(false);
      setNewStatus('');
      setSubscriptionDays('');
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la suscripción",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openManageDialog = (psychologist: any, type: 'trial' | 'subscription') => {
    setSelectedPsychologist(psychologist);
    setActionType(type);
    setDialogOpen(true);
  };

  const createAdminUser = async () => {
    try {
      // Sign up the admin user
      const { data, error } = await supabase.auth.signUp({
        email: 'admin',
        password: 'admin123',
        options: {
          data: {
            user_type: 'psychologist'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Add to admins table
        const { error: adminError } = await supabase
          .from('admins')
          .insert({ id: data.user.id });

        if (adminError) throw adminError;

        toast({
          title: "Usuario admin creado",
          description: "Usuario: admin, Contraseña: admin123",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario admin",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Denegado</h2>
            <p className="text-slate-600 mb-4">No tienes permisos para acceder al panel de administración.</p>
            <Button onClick={createAdminUser} variant="outline">
              Crear Usuario Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    switch (status) {
      case 'trial':
        return <Badge variant="secondary">Trial</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-500">Activo</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const totalPsychologists = psychologistStats.length;
  const activePsychologists = psychologistStats.filter(p => p.subscription_status === 'active').length;
  const trialPsychologists = psychologistStats.filter(p => p.subscription_status === 'trial').length;
  const expiredPsychologists = psychologistStats.filter(p => p.is_expired).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Panel de Administración</h1>
          <p className="text-slate-600">Gestiona psicólogos, suscripciones y sistema de afiliados</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createAdminUser} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Crear Admin
          </Button>
          <Button onClick={refetch} variant="outline">
            Actualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="psychologists" className="space-y-4">
        <TabsList>
          <TabsTrigger value="psychologists">Psicólogos</TabsTrigger>
          <TabsTrigger value="affiliates">
            <DollarSign className="w-4 h-4 mr-2" />
            Sistema de Afiliados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="psychologists">
          {/* Estadísticas generales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Psicólogos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPsychologists}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activePsychologists}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Trial</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{trialPsychologists}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expirados</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{expiredPsychologists}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de psicólogos */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Psicólogos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Días Trial</TableHead>
                    <TableHead>Días Suscripción</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {psychologistStats.map((psychologist) => (
                    <TableRow key={psychologist.id}>
                      <TableCell className="font-medium">
                        {psychologist.first_name} {psychologist.last_name}
                      </TableCell>
                      <TableCell>{psychologist.email}</TableCell>
                      <TableCell>
                        {getStatusBadge(psychologist.subscription_status, psychologist.is_expired)}
                      </TableCell>
                      <TableCell>
                        {psychologist.subscription_status === 'trial' ? (
                          <span className={psychologist.trial_days_remaining <= 2 ? 'text-red-600 font-bold' : 'text-blue-600'}>
                            {psychologist.trial_days_remaining} días
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {psychologist.subscription_status === 'active' ? (
                          <span className={psychologist.subscription_days_remaining <= 7 ? 'text-orange-600 font-bold' : 'text-green-600'}>
                            {psychologist.subscription_days_remaining} días
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{formatDate(psychologist.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openManageDialog(psychologist, 'trial')}
                          >
                            + Días
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openManageDialog(psychologist, 'subscription')}
                          >
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {psychologistStats.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No hay psicólogos registrados
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dialog para gestionar usuarios */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {actionType === 'trial' ? 'Agregar Días de Trial' : 'Cambiar Plan de Suscripción'}
                </DialogTitle>
              </DialogHeader>
              
              {selectedPsychologist && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Usuario seleccionado:</p>
                    <p className="font-medium">{selectedPsychologist.first_name} {selectedPsychologist.last_name}</p>
                    <p className="text-sm text-slate-500">{selectedPsychologist.email}</p>
                  </div>

                  {actionType === 'trial' ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="additionalDays">Días adicionales de trial</Label>
                        <Input
                          id="additionalDays"
                          type="number"
                          value={additionalDays}
                          onChange={(e) => setAdditionalDays(e.target.value)}
                          placeholder="Ej: 7"
                        />
                      </div>
                      <Button 
                        onClick={handleUpdateTrialDays} 
                        disabled={!additionalDays || isProcessing}
                        className="w-full"
                      >
                        {isProcessing ? 'Procesando...' : 'Agregar Días'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newStatus">Nuevo estado</Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trial">Trial</SelectItem>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="expired">Expirado</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {newStatus === 'active' && (
                        <div>
                          <Label htmlFor="subscriptionDays">Días de suscripción</Label>
                          <Input
                            id="subscriptionDays"
                            type="number"
                            value={subscriptionDays}
                            onChange={(e) => setSubscriptionDays(e.target.value)}
                            placeholder="Ej: 30"
                          />
                        </div>
                      )}
                      
                      <Button 
                        onClick={handleUpdateSubscriptionStatus} 
                        disabled={!newStatus || isProcessing}
                        className="w-full"
                      >
                        {isProcessing ? 'Procesando...' : 'Actualizar Estado'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="affiliates">
          <AffiliateAdminPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
