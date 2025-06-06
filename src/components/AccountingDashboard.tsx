
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Settings
} from "lucide-react";
import { useAccountingReports } from "@/hooks/useAccountingReports";
import { usePaymentReceipts } from "@/hooks/usePaymentReceipts";
import { ReceiptValidationPanel } from "./ReceiptValidationPanel";
import { MonthlyReportGenerator } from "./MonthlyReportGenerator";
import { MonotaxCategorySelector } from "./MonotaxCategorySelector";

interface AccountingDashboardProps {
  psychologistId: string;
}

export const AccountingDashboard = ({ psychologistId }: AccountingDashboardProps) => {
  const { reports, categories, currentCategory, checkLimitAlerts } = useAccountingReports(psychologistId);
  const { receipts } = usePaymentReceipts(psychologistId);

  const currentYear = new Date().getFullYear();
  const currentYearReports = reports.filter(r => r.report_year === currentYear);
  const annualAccumulated = currentYearReports.reduce((sum, report) => sum + report.total_amount, 0);
  
  const pendingReceipts = receipts.filter(r => r.validation_status === 'pending').length;
  const approvedReceipts = receipts.filter(r => r.validation_status === 'approved').length;
  
  const limitAlert = checkLimitAlerts(annualAccumulated);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Sistema Contable</h1>
        <MonotaxCategorySelector 
          currentCategory={currentCategory}
          categories={categories}
          onCategoryChange={(code) => {}}
        />
      </div>

      {/* Alert de límites */}
      {limitAlert && (
        <Card className={`border-l-4 ${limitAlert.level === 'critical' ? 'border-red-500' : 'border-yellow-500'}`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${limitAlert.level === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
              <p className="font-medium">{limitAlert.message}</p>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Restante: ${limitAlert.remaining.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Comprobantes Pendientes</p>
                <p className="text-3xl font-bold text-orange-600">{pendingReceipts}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Comprobantes Aprobados</p>
                <p className="text-3xl font-bold text-green-600">{approvedReceipts}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Acumulado Anual</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${annualAccumulated.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Reportes {currentYear}</p>
                <p className="text-3xl font-bold text-purple-600">{currentYearReports.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de validación de comprobantes */}
      <ReceiptValidationPanel psychologistId={psychologistId} />

      {/* Generador de reportes mensuales */}
      <MonthlyReportGenerator psychologistId={psychologistId} />

      {/* Reportes recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Reportes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">
                    {new Date(0, report.report_month - 1).toLocaleDateString('es-ES', { month: 'long' })} {report.report_year}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {report.total_receipts} comprobantes • ${report.total_amount.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(report.status)}
                  {report.report_file_url && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {reports.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay reportes generados aún</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
