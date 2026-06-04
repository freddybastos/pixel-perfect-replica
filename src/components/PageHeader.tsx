import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean | string;
  right?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, back, right, className }: Props) {
  const navigate = useNavigate();
  return (
    <header
      className={cn(
        "sticky top-0 z-30 -mx-0 flex items-center gap-3 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-lg",
        className
      )}
    >
      {back && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 -ml-2"
          onClick={() => (typeof back === "string" ? navigate(back) : navigate(-1))}
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
