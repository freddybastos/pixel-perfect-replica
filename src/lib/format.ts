export const formatBRL = (value: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value ?? 0));

export const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date.includes("T") ? date : date + "T00:00:00") : date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDateShort = (date: string | Date | null | undefined) => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date.includes("T") ? date : date + "T00:00:00") : date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

export const statusLabel: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aceito: "Aceito",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
  pendente: "Pendente",
  pago: "Pago",
  vencido: "Vencido",
};

export const statusColor: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  enviado: "bg-accent text-accent-foreground",
  aceito: "bg-primary/10 text-primary",
  em_andamento: "bg-warning/15 text-warning-foreground",
  concluido: "bg-success/15 text-success",
  cancelado: "bg-destructive/15 text-destructive",
  pendente: "bg-warning/15 text-warning-foreground",
  pago: "bg-success/15 text-success",
  vencido: "bg-destructive/15 text-destructive",
};
