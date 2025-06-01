
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Eye, Calendar, Phone, Mail, ExternalLink } from "lucide-react";

interface ProfileData {
  selected_specialties?: string[];
  location?: string;
  languages?: string[];
  session_format?: string;
  session_duration?: number;
  pricing_info?: string;
  education?: string;
  certifications?: string;
  email?: string;
  website?: string;
  [key: string]: any;
}

interface PlusProfileTemplateProps {
  profile: {
    id: string;
    custom_url: string;
    profession_type: string;
    profile_data: ProfileData;
    about_description?: string;
    therapeutic_approach?: string;
    years_experience?: number;
    view_count: number;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    psychologist: {
      first_name: string;
      last_name: string;
      specialization?: string;
      phone?: string;
    };
  };
}

export const PlusProfileTemplate = ({ profile }: PlusProfileTemplateProps) => {
  const displayName = `${profile.psychologist.first_name} ${profile.psychologist.last_name}`;
  const profileData: ProfileData = profile.profile_data || {};
  
  const specialties = profileData.selected_specialties || [];
  const bio = profile.about_description || '';
  const location = profileData.location || '';
  const email = profileData.email || '';
  const website = profileData.website || '';
  const languages = profileData.languages || [];
  const sessionFormat = profileData.session_format || '';
  const sessionDuration = profileData.session_duration || 60;
  const pricingInfo = profileData.pricing_info || '';

  return (
    <>
      <Helmet>
        <title>{profile.seo_title || `${displayName} - ${profile.psychologist.specialization || 'Psicólogo'}`}</title>
        <meta name="description" content={profile.seo_description || bio} />
        {profile.seo_keywords && <meta name="keywords" content={profile.seo_keywords} />}
        <meta property="og:title" content={profile.seo_title || `${displayName} - ${profile.psychologist.specialization || 'Psicólogo'}`} />
        <meta property="og:description" content={profile.seo_description || bio} />
        <meta property="og:type" content="profile" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          
          {/* Header Section - PLUS VERSION */}
          <Card className="mb-6 border shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {displayName}
                    </h1>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Plus
                    </Badge>
                  </div>
                  
                  <p className="text-lg mb-3 text-blue-600 font-medium">
                    {profile.psychologist.specialization || 'Psicólogo'}
                  </p>
                  
                  <div className="space-y-2">
                    {location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{location}</span>
                      </div>
                    )}
                    
                    {profile.years_experience && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{profile.years_experience} años de experiencia</span>
                      </div>
                    )}

                    {profile.view_count > 0 && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Eye className="w-4 h-4" />
                        <span>{profile.view_count} visualizaciones</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Cita
                  </Button>
                  
                  {profile.psychologist.phone && (
                    <Button variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Contactar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio Section */}
          {bio && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  Sobre mí
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Specialties */}
          {specialties.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  Especialidades
                </h2>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-blue-200 text-blue-700"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session & Language Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Session Info */}
            {(sessionFormat || sessionDuration || pricingInfo) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 text-gray-900">
                    Información de Sesiones
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {sessionFormat && (
                      <p><span className="font-medium">Formato:</span> {sessionFormat}</p>
                    )}
                    {sessionDuration && (
                      <p><span className="font-medium">Duración:</span> {sessionDuration} minutos</p>
                    )}
                    {pricingInfo && (
                      <p><span className="font-medium">Precios:</span> {pricingInfo}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 text-gray-900">
                    Idiomas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((language: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Call to Action */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-3 text-gray-900">
                ¿Listo para comenzar?
              </h2>
              <p className="text-gray-600 mb-6">
                Agenda una cita y da el primer paso hacia tu bienestar emocional.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Primera Cita
                </Button>
                
                {website && (
                  <Button variant="outline" size="lg">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Sitio Web
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
