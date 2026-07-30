"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, variant, action, ...props }) {
        const Icon =
          variant === "success"
            ? CheckCircle2
            : variant === "destructive"
              ? AlertCircle
              : Info;

        const iconColor =
          variant === "success"
            ? "text-emerald-400"
            : variant === "destructive"
              ? "text-red-400"
              : "text-blue-400";

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3">
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
              <div className="grid gap-0.5">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
