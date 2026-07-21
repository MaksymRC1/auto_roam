"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("App boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 text-slate-200">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-4 backdrop-blur-md">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Щось пішло не так!</h2>
        <p className="text-white/60">
          Виникла непередбачувана помилка. Ми вже знаємо про неї та працюємо над виправленням.
        </p>
        <div className="pt-4">
          <Button 
            onClick={() => reset()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Спробувати знову
          </Button>
        </div>
      </div>
    </div>
  );
}
