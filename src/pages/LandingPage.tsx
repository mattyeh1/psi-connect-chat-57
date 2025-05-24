
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Users, MessageCircle, Calendar, Star } from "lucide-react";
import { Link } from "react-router-dom";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              PsiConnect
            </h1>
          </div>
          <div className="flex gap-4">
            <Link to="/app">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link to="/app">
              <Button className="bg-gradient-to-r from-blue-500 to-emerald-500">
                Comenzar Ahora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-slate-800 mb-6">
            Conecta con la
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              {" "}salud mental{" "}
            </span>
            del futuro
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            PsiConnect es la plataforma integral que une a psicólogos y pacientes 
            en un entorno seguro, profesional y tecnológicamente avanzado.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/app">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-emerald-500 px-8 py-3 text-lg">
                Empezar Gratis
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-slate-800 mb-4">
            ¿Por qué elegir PsiConnect?
          </h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ofrecemos las herramientas más avanzadas para facilitar la conexión 
            entre profesionales de la salud mental y sus pacientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Seguridad Garantizada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Cumplimos con los más altos estándares de seguridad y privacidad 
                para proteger la información sensible de pacientes y profesionales.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Gestión de Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Sistema completo para administrar historiales, citas y seguimiento 
                de pacientes de manera eficiente y organizada.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Comunicación Segura</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Mensajería cifrada y llamadas seguras para mantener la confidencialidad 
                en todas las comunicaciones profesionales.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Agenda Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Programación automática de citas, recordatorios y gestión 
                optimizada del tiempo para maximizar la productividad.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Interfaz Intuitiva</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Diseño moderno y fácil de usar que permite enfocarse en lo importante: 
                el bienestar de los pacientes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Soporte 24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Equipo de soporte especializado disponible en todo momento 
                para resolver cualquier duda o inconveniente.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-emerald-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-4xl font-bold text-white mb-6">
            ¿Listo para revolucionar tu práctica?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Únete a cientos de profesionales que ya confían en PsiConnect 
            para brindar la mejor atención a sus pacientes.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/app">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                Comenzar Prueba Gratuita
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold">PsiConnect</h4>
              </div>
              <p className="text-slate-400">
                Conectando profesionales de la salud mental con sus pacientes.
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Producto</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seguridad</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Soporte</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estado del Sistema</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 PsiConnect. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
