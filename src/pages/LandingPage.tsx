import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Users, MessageCircle, Calendar, Star, CheckCircle, Award, TrendingUp, Clock, Globe, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";
import { SeoHead } from "@/components/SeoHead";
import { getPageSeoConfig } from "@/utils/seoConfig";

// Importar los nuevos componentes optimizados para conversión
import { UrgencyBanner } from '@/components/landing/UrgencyBanner';
import { ImprovedCTAs } from '@/components/landing/ImprovedCTAs';
import { FeaturesSection } from '@/components/landing/FeatureCard';
import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { TestimonialsSection } from '@/components/landing/TestimonialCard';
import { PricingSection } from '@/components/landing/PricingSection';
import { ImprovedNavigation, ImprovedHero } from '@/components/landing/Navigation';

export const LandingPage = () => {
  const seoConfig = getPageSeoConfig('landing');

  return (
    <>
      <SeoHead config={seoConfig} canonical={`${window.location.origin}/`} />
      
      {/* Navegación mejorada */}
      <ImprovedNavigation />
      
      {/* Banner de urgencia/escasez */}
      <UrgencyBanner variant="A" />
      
      {/* Hero section optimizado */}
      <ImprovedHero />
      
      {/* CTAs mejorados */}
      <ImprovedCTAs />
      
      {/* Features con estructura dolor-solución */}
      <FeaturesSection />
      
      {/* Tabla comparativa Excel vs ProConnection */}
      <ComparisonTable />
      
      {/* Testimonios con métricas específicas */}
      <TestimonialsSection />
      
      {/* Pricing visible con 2 planes */}
      <PricingSection />

        {/* Footer */}
        <ScrollAnimationWrapper animation="fade-up">
          <footer className="bg-slate-800 text-white py-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
            
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="group">
                  <div className="flex items-center gap-3 mb-4 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <Heart className="w-5 h-5 text-white group-hover:animate-pulse" />
                    </div>
                    <h4 className="text-xl font-bold group-hover:text-blue-400 transition-colors duration-300">ProConnection</h4>
                  </div>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                    Conectando profesionales de la salud mental con sus pacientes.
                  </p>
                </div>

                <div className="group">
                  <h5 className="font-semibold mb-4 group-hover:text-blue-400 transition-colors duration-300">Producto</h5>
                  <ul className="space-y-2 text-slate-400">
                  <li><a href="#features" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Características</a></li>
                  <li><a href="#pricing" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Precios</a></li>
                  <li><a href="#testimonials" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Testimonios</a></li>
                  </ul>
                </div>

                <div className="group">
                  <h5 className="font-semibold mb-4 group-hover:text-emerald-400 transition-colors duration-300">Soporte</h5>
                  <ul className="space-y-2 text-slate-400">
                    <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Centro de Ayuda</a></li>
                    <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Contacto</a></li>
                    <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Estado del Sistema</a></li>
                  </ul>
                </div>

                <div className="group">
                  <h5 className="font-semibold mb-4 group-hover:text-purple-400 transition-colors duration-300">Legal</h5>
                  <ul className="space-y-2 text-slate-400">
                    <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Privacidad</a></li>
                    <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Términos</a></li>
                    <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Cookies</a></li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400 hover:text-slate-300 transition-colors duration-300">
                <p>&copy; 2025 ProConnection. Todos los derechos reservados.</p>
              </div>
            </div>
          </footer>
        </ScrollAnimationWrapper>
    </>
  );
};
