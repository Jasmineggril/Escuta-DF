import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertReport } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCreateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertReport) => {
      const res = await fetch(api.reports.create.path, {
        method: api.reports.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // Handle validation errors specifically
        if (res.status === 400) {
          const error = api.reports.create.responses[400].parse(await res.json());
          throw new Error(error.message || "Erro de validação ao enviar manifesto.");
        }
        throw new Error("Falha ao enviar manifesto. Tente novamente.");
      }

      return api.reports.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Sua manifestação foi enviada para processamento.",
        className: "bg-green-600 text-white border-none",
      });
      // Invalidate if we had a list, but mostly we just care about the result here
    },
    onError: (error) => {
      toast({
        title: "Erro no envio",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useReportStatus(protocol: string) {
  return useQuery({
    queryKey: [api.reports.status.path, protocol],
    queryFn: async () => {
      if (!protocol) return null;
      const url = buildUrl(api.reports.status.path, { protocol });
      const res = await fetch(url);
      
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch status");
      }
      
      return api.reports.status.responses[200].parse(await res.json());
    },
    enabled: !!protocol && protocol.length > 5,
  });
}
