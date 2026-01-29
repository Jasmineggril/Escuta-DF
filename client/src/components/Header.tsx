import { Link } from "wouter";
import logoImg from "@assets/_Logo_Escuta_DF__1769708916694.jpg";

export function Header() {
  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded-lg p-1 transition-colors hover:bg-slate-50">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full border border-slate-100 shadow-sm">
             <img 
               src={logoImg} 
               alt="Logo Escuta DF" 
               className="h-full w-full object-cover"
             />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg sm:text-xl text-primary leading-tight">Escuta DF</span>
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground tracking-wide uppercase">Ouvidoria Digital</span>
          </div>
        </Link>
        
        <nav>
          <a 
            href="#main-content" 
            className="skip-link"
          >
            Pular para conteúdo
          </a>
        </nav>
      </div>
    </header>
  );
}
