import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 py-8 px-4 border-t-4 border-accent">
      <div className="container mx-auto max-w-4xl text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
           <span className="h-px w-12 bg-slate-700"></span>
           <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">Sobre</span>
           <span className="h-px w-12 bg-slate-700"></span>
        </div>
        
        <p className="text-sm leading-relaxed max-w-2xl mx-auto">
          O <strong>Escuta DF</strong> é uma iniciativa para tornar a ouvidoria pública acessível a todos os cidadãos, independente de suas limitações.
        </p>
        
        <div className="pt-6 mt-6 border-t border-slate-800 flex flex-col items-center gap-2">
          <p className="text-xs text-slate-500 font-medium">
            Desenvolvido por Jasmine de Sá Araújo
          </p>
          <p className="text-[10px] text-slate-600 flex items-center gap-1">
            Estudante de Engenharia de Software (4º semestre) da UNDF <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
