import { Link } from "wouter";
import { ArrowRight, MessageSquarePlus, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]" id="main-content">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-900 text-white py-16 lg:py-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-white drop-shadow-sm">
                Sua voz constrói um DF melhor para todos
              </h1>
              <p className="text-blue-100 text-lg sm:text-xl md:text-2xl mb-8 leading-relaxed max-w-2xl font-light">
                A Ouvidoria Digital que te escuta do seu jeito. Fale, escreva, ou mostre o que precisa ser melhorado na nossa cidade.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/nova-manifestacao">
                  <Button 
                    size="lg" 
                    className="bg-accent text-accent-foreground hover:bg-yellow-400 border-2 border-transparent text-lg h-14 px-8 rounded-full shadow-xl shadow-black/10 font-bold w-full sm:w-auto group"
                  >
                    Nova Manifestação
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/consultar">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white text-lg h-14 px-8 rounded-full w-full sm:w-auto"
                  >
                    Consultar Protocolo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Como funciona?</h2>
            <p className="text-slate-600 text-lg">
              Simplificamos o processo para que qualquer pessoa possa participar da gestão pública.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card 
              icon={<MessageSquarePlus className="w-8 h-8 text-primary" />}
              title="Múltiplos Canais"
              description="Não gosta de escrever? Sem problemas. Envie áudios, vídeos ou fotos para relatar sua demanda."
            />
            <Card 
              icon={<ShieldCheck className="w-8 h-8 text-secondary" />}
              title="Segurança e Anonimato"
              description="Se preferir, sua identidade será preservada. Garantimos sigilo absoluto dos seus dados."
            />
            <Card 
              icon={<Users className="w-8 h-8 text-orange-500" />}
              title="Acessibilidade Total"
              description="Plataforma desenhada para ser usada por todos, seguindo padrões internacionais de inclusão."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:border-primary/20 transition-colors"
    >
      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
