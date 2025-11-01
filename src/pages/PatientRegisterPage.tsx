import { PatientAuthPage } from "@/components/PatientAuthPage";

export const PatientRegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Registro de Paciente
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            Crea tu cuenta para acceder a tu portal de paciente
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <PatientAuthPage registrationOnly={true} />
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Beneficios para Pacientes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Gestión de Citas</h3>
              <p className="text-slate-600 text-sm">Agenda y gestiona tus citas de forma fácil y rápida</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-pink-100">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Documentos</h3>
              <p className="text-slate-600 text-sm">Accede a tus documentos médicos de forma segura</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Pagos</h3>
              <p className="text-slate-600 text-sm">Realiza y gestiona tus pagos de forma sencilla</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

