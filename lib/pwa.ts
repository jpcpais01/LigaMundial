'use client';

// Captura global do evento beforeinstallprompt.
// Este módulo é importado pelo InstallPrompt (montado no layout), por isso o
// listener regista-se logo no carregamento inicial em todas as páginas — assim
// o evento não se perde mesmo que o utilizador só abra o Perfil mais tarde.

export type BeforeInstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: string }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach(fn => fn());
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach(fn => fn());
  });
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export function clearInstallPrompt(): void {
  deferredPrompt = null;
  listeners.forEach(fn => fn());
}

// Notifica quando o prompt fica disponível (ou é consumido)
export function subscribeInstallPrompt(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

// App já instalada / a correr em modo standalone
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari iOS antigo
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !('MSStream' in window);
}
