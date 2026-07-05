import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiErrorAlertProps {
  message: string | string[] | null | undefined;
  className?: string;
}

export function ApiErrorAlert({ message, className }: ApiErrorAlertProps) {
  if (!message) return null;

  const messages = Array.isArray(message) ? message : [message];

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3.5",
        className
      )}
    >
      <AlertCircle
        className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
        aria-hidden
      />
      <div className="space-y-1">
        {messages.map((msg, i) => (
          <p key={i} className="text-sm text-destructive">
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
}
