
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AssessmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  psychologistId?: string;
}

export const AssessmentFormModal = ({ isOpen, onClose, psychologistId }: AssessmentFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    assessmentType: "",
    chiefComplaint: "",
    historyPresent: "",
    pastHistory: "",
    familyHistory: "",
    mentalStatusExam: "",
    cognitiveAssessment: "",
    riskAssessment: "",
    diagnosticImpression: "",
    recommendations: "",
    treatmentPlan: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!psychologistId) {
      toast({
        title: "Error",
        description: "No se pudo identificar al psicólogo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('patient_documents')
        .insert({
          psychologist_id: psychologistId,
          patient_id: formData.patientId,
          title: `Evaluación Psicológica - ${formData.patientName}`,
          type: 'assessment',
          content: formData,
          status: 'draft'
        });

      if (error) {
        console.error('Error creating assessment:', error);
        throw new Error('No se pudo crear la evaluación');
      }

      toast({
        title: "Evaluación creada",
        description: "La evaluación psicológica ha sido creada exitosamente",
      });

      onClose();
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la evaluación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluación Psicológica</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientName">Nombre del Paciente</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="patientId">ID del Paciente</Label>
              <Input
                id="patientId"
                value={formData.patientId}
                onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="assessmentType">Tipo de Evaluación</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, assessmentType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de evaluación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial">Evaluación Inicial</SelectItem>
                <SelectItem value="periodic">Evaluación Periódica</SelectItem>
                <SelectItem value="cognitive">Evaluación Cognitiva</SelectItem>
                <SelectItem value="personality">Evaluación de Personalidad</SelectItem>
                <SelectItem value="neuropsychological">Evaluación Neuropsicológica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="chiefComplaint">Motivo de Consulta</Label>
            <Textarea
              id="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
              placeholder="Describe el motivo principal de la consulta..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="historyPresent">Historia de la Enfermedad Actual</Label>
            <Textarea
              id="historyPresent"
              value={formData.historyPresent}
              onChange={(e) => setFormData(prev => ({ ...prev, historyPresent: e.target.value }))}
              placeholder="Describe la evolución de los síntomas actuales..."
              className="min-h-[120px]"
            />
          </div>

          <div>
            <Label htmlFor="pastHistory">Antecedentes Personales</Label>
            <Textarea
              id="pastHistory"
              value={formData.pastHistory}
              onChange={(e) => setFormData(prev => ({ ...prev, pastHistory: e.target.value }))}
              placeholder="Antecedentes médicos, psiquiátricos, educativos, laborales..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="familyHistory">Antecedentes Familiares</Label>
            <Textarea
              id="familyHistory"
              value={formData.familyHistory}
              onChange={(e) => setFormData(prev => ({ ...prev, familyHistory: e.target.value }))}
              placeholder="Antecedentes familiares relevantes..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="mentalStatusExam">Examen del Estado Mental</Label>
            <Textarea
              id="mentalStatusExam"
              value={formData.mentalStatusExam}
              onChange={(e) => setFormData(prev => ({ ...prev, mentalStatusExam: e.target.value }))}
              placeholder="Apariencia, conducta, humor, afecto, pensamiento, percepción, cognición..."
              className="min-h-[120px]"
            />
          </div>

          <div>
            <Label htmlFor="cognitiveAssessment">Evaluación Cognitiva</Label>
            <Textarea
              id="cognitiveAssessment"
              value={formData.cognitiveAssessment}
              onChange={(e) => setFormData(prev => ({ ...prev, cognitiveAssessment: e.target.value }))}
              placeholder="Orientación, memoria, atención, funciones ejecutivas..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="riskAssessment">Evaluación de Riesgo</Label>
            <Textarea
              id="riskAssessment"
              value={formData.riskAssessment}
              onChange={(e) => setFormData(prev => ({ ...prev, riskAssessment: e.target.value }))}
              placeholder="Riesgo suicida, auto/heteroagresión, otros riesgos..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="diagnosticImpression">Impresión Diagnóstica</Label>
            <Textarea
              id="diagnosticImpression"
              value={formData.diagnosticImpression}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosticImpression: e.target.value }))}
              placeholder="Diagnósticos principales y diferenciales..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="recommendations">Recomendaciones</Label>
            <Textarea
              id="recommendations"
              value={formData.recommendations}
              onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
              placeholder="Recomendaciones de tratamiento y seguimiento..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-emerald-500">
              {loading ? "Guardando..." : "Crear Evaluación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
