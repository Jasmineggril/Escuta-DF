import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateReport } from "@/hooks/use-reports";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mic, Type, Image as ImageIcon, Video, User, Ghost, ArrowLeft, Send, X, AlertCircle } from "lucide-react";
import { AudioRecorder } from "@/components/AudioRecorder";
import { useToast } from "@/hooks/use-toast";
import type { InsertReport } from "@shared/schema";

// Steps definition
const STEPS = [
  { id: 1, title: "Identificação" },
  { id: 2, title: "Formato" },
  { id: 3, title: "Conteúdo" },
  { id: 4, title: "Revisão" },
];

export default function CreateReport() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<InsertReport>>({
    isAnonymous: false,
    type: "text",
    content: "",
    mediaUrl: "",
  });
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createReport = useCreateReport();

  const handleNext = () => {
    // Basic validation per step
    if (currentStep === 3) {
      if (formData.type === "text" && !formData.content) {
        toast({ title: "Atenção", description: "Por favor, escreva sua manifestação.", variant: "destructive" });
        return;
      }
      if (formData.type !== "text" && !formData.mediaUrl) {
        toast({ title: "Atenção", description: "Por favor, grave ou anexe o arquivo necessário.", variant: "destructive" });
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      // In a real app, formData is validated by InsertReport schema
      // Here we cast it because we built it step-by-step
      const result = await createReport.mutateAsync(formData as InsertReport);
      setLocation(`/sucesso?protocol=${result.protocol}`);
    } catch (error) {
      // Handled by hook
    }
  };

  // Mock File Upload for Image/Video
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create fake URL for simulation
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, mediaUrl: url }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl min-h-[calc(100vh-80px)] flex flex-col justify-center" id="main-content">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map((step) => (
            <span 
              key={step.id} 
              className={`text-xs sm:text-sm font-semibold transition-colors ${
                step.id <= currentStep ? 'text-primary' : 'text-slate-300'
              }`}
            >
              {step.title}
            </span>
          ))}
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6 sm:p-8 shadow-xl border-slate-100 rounded-2xl bg-white">
            {/* Step 1: Identification */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold font-display text-slate-900">Como você prefere se identificar?</h2>
                  <p className="text-slate-500 mt-2">Escolha se deseja informar seus dados ou manter o anonimato.</p>
                </div>
                
                <RadioGroup 
                  value={formData.isAnonymous ? "anonymous" : "identified"}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, isAnonymous: val === "anonymous" }))}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <Label 
                    htmlFor="identified"
                    className={`
                      cursor-pointer flex flex-col items-center p-6 border-2 rounded-xl transition-all hover:bg-slate-50
                      ${!formData.isAnonymous ? 'border-primary bg-blue-50/50 ring-2 ring-primary/20' : 'border-slate-200'}
                    `}
                  >
                    <RadioGroupItem value="identified" id="identified" className="sr-only" />
                    <User className={`w-12 h-12 mb-3 ${!formData.isAnonymous ? 'text-primary' : 'text-slate-400'}`} />
                    <span className="text-lg font-bold text-slate-900">Identificado</span>
                    <span className="text-sm text-center text-slate-500 mt-1">Seus dados serão visíveis para o órgão.</span>
                  </Label>

                  <Label 
                    htmlFor="anonymous"
                    className={`
                      cursor-pointer flex flex-col items-center p-6 border-2 rounded-xl transition-all hover:bg-slate-50
                      ${formData.isAnonymous ? 'border-primary bg-blue-50/50 ring-2 ring-primary/20' : 'border-slate-200'}
                    `}
                  >
                    <RadioGroupItem value="anonymous" id="anonymous" className="sr-only" />
                    <Ghost className={`w-12 h-12 mb-3 ${formData.isAnonymous ? 'text-primary' : 'text-slate-400'}`} />
                    <span className="text-lg font-bold text-slate-900">Anônimo</span>
                    <span className="text-sm text-center text-slate-500 mt-1">Sua identidade será preservada.</span>
                  </Label>
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Format Type */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold font-display text-slate-900">Qual o formato da manifestação?</h2>
                  <p className="text-slate-500 mt-2">Escolha a forma mais fácil para você se expressar.</p>
                </div>

                <RadioGroup 
                  value={formData.type}
                  onValueChange={(val: any) => setFormData(prev => ({ ...prev, type: val, content: "", mediaUrl: "" }))}
                  className="grid grid-cols-2 gap-4"
                >
                  <FormatOption 
                    id="text" 
                    icon={<Type />} 
                    label="Texto" 
                    selected={formData.type === "text"} 
                  />
                  <FormatOption 
                    id="audio" 
                    icon={<Mic />} 
                    label="Áudio" 
                    selected={formData.type === "audio"} 
                  />
                  <FormatOption 
                    id="image" 
                    icon={<ImageIcon />} 
                    label="Imagem" 
                    selected={formData.type === "image"} 
                  />
                  <FormatOption 
                    id="video" 
                    icon={<Video />} 
                    label="Vídeo" 
                    selected={formData.type === "video"} 
                  />
                </RadioGroup>
              </div>
            )}

            {/* Step 3: Content */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold font-display text-slate-900">
                    {formData.type === "text" && "Descreva sua manifestação"}
                    {formData.type === "audio" && "Grave seu áudio"}
                    {formData.type === "image" && "Envie sua imagem"}
                    {formData.type === "video" && "Envie seu vídeo"}
                  </h2>
                </div>

                {formData.type === "text" && (
                  <div className="space-y-2">
                    <Label htmlFor="content" className="sr-only">Conteúdo do texto</Label>
                    <Textarea 
                      id="content"
                      placeholder="Escreva aqui os detalhes da sua solicitação, reclamação ou elogio..." 
                      className="min-h-[200px] text-lg p-4 resize-none focus-visible:ring-primary"
                      value={formData.content || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      autoFocus
                    />
                    <div className="text-right text-xs text-slate-400">
                      {(formData.content?.length || 0)} caracteres
                    </div>
                  </div>
                )}

                {formData.type === "audio" && (
                  <AudioRecorder 
                    hasRecording={!!formData.mediaUrl}
                    onRecordingComplete={(url) => setFormData(prev => ({ ...prev, mediaUrl: url }))}
                    onDelete={() => setFormData(prev => ({ ...prev, mediaUrl: "" }))}
                  />
                )}

                {(formData.type === "image" || formData.type === "video") && (
                  <div className="space-y-4">
                    {!formData.mediaUrl ? (
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors">
                        <input 
                          type="file" 
                          accept={formData.type === "image" ? "image/*" : "video/*"}
                          onChange={handleFileUpload}
                          className="hidden" 
                          id="file-upload"
                        />
                        <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                          <div className="h-14 w-14 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
                            {formData.type === "image" ? <ImageIcon className="w-8 h-8"/> : <Video className="w-8 h-8"/>}
                          </div>
                          <span className="text-lg font-bold text-slate-700">Clique para selecionar</span>
                          <span className="text-sm text-slate-500 mt-1">ou arraste o arquivo aqui</span>
                        </Label>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200">
                        {formData.type === "image" ? (
                          <img src={formData.mediaUrl} alt="Preview" className="w-full h-64 object-cover" />
                        ) : (
                          <video src={formData.mediaUrl} controls className="w-full h-64 object-cover bg-black" />
                        )}
                        <Button 
                          size="icon" 
                          variant="destructive" 
                          className="absolute top-2 right-2 rounded-full shadow-md"
                          onClick={() => setFormData(prev => ({ ...prev, mediaUrl: "" }))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                       <Label htmlFor="media-desc" className="text-sm font-medium">Adicionar descrição (opcional)</Label>
                       <Textarea 
                         id="media-desc"
                         placeholder="Ajude-nos a entender o que está no arquivo..."
                         value={formData.content || ""}
                         onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                       />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold font-display text-slate-900">Revise seus dados</h2>
                  <p className="text-slate-500">Confira se está tudo correto antes de enviar.</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl space-y-4 border border-slate-100">
                  <ReviewItem 
                    label="Identificação" 
                    value={formData.isAnonymous ? "Anônimo" : "Identificado"} 
                    icon={formData.isAnonymous ? <Ghost className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  />
                  
                  <ReviewItem 
                    label="Formato" 
                    value={
                      formData.type === 'text' ? 'Texto' : 
                      formData.type === 'audio' ? 'Áudio' : 
                      formData.type === 'image' ? 'Imagem' : 'Vídeo'
                    }
                    icon={<Type className="w-4 h-4" />}
                  />
                  
                  <div className="pt-4 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Conteúdo</span>
                    {formData.type === 'text' ? (
                      <p className="mt-2 text-slate-800 italic">"{formData.content}"</p>
                    ) : (
                       <div className="mt-2 flex items-center gap-2 text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                         {formData.type === 'audio' && <Mic className="w-4 h-4 text-primary" />}
                         {formData.type === 'image' && <ImageIcon className="w-4 h-4 text-primary" />}
                         {formData.type === 'video' && <Video className="w-4 h-4 text-primary" />}
                         <span className="text-sm font-medium">Arquivo anexado</span>
                         {formData.content && <span className="text-xs text-slate-400 ml-2">({formData.content.substring(0, 20)}...)</span>}
                       </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Ao enviar, você receberá um número de protocolo para acompanhar o andamento da sua solicitação.</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="flex-1 border-slate-200"
                  disabled={createReport.isPending}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
              
              <Button 
                onClick={currentStep === 4 ? handleSubmit : handleNext}
                className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
                disabled={createReport.isPending}
              >
                {createReport.isPending ? "Enviando..." : currentStep === 4 ? (
                  <>Enviar Manifestação <Send className="w-4 h-4 ml-2" /></>
                ) : (
                  <>Continuar <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Helpers
function FormatOption({ id, icon, label, selected }: { id: string, icon: React.ReactNode, label: string, selected: boolean }) {
  return (
    <Label 
      htmlFor={id}
      className={`
        cursor-pointer flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all aspect-square
        ${selected ? 'border-primary bg-blue-50/50 text-primary ring-2 ring-primary/20' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}
      `}
    >
      <RadioGroupItem value={id} id={id} className="sr-only" />
      <div className={`mb-3 ${selected ? 'scale-110' : ''} transition-transform`}>
        {icon}
      </div>
      <span className="font-bold">{label}</span>
    </Label>
  );
}

function ReviewItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <div className="flex items-center gap-2 font-bold text-slate-900">
        {icon}
        {value}
      </div>
    </div>
  );
}
