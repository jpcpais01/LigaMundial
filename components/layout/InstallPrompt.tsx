'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share } from 'lucide-react';

const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 h
const LS_KEY = 'install_prompt_at';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BeforeInstallPromptEvent = Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> };

export default function InstallPrompt() {
  const [show, setShow]                   = useState(false);
  const [isIOS, setIsIOS]                 = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Already running as installed PWA — never show
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Respect cooldown
    const ts = localStorage.getItem(LS_KEY);
    if (ts && Date.now() - parseInt(ts) < COOLDOWN_MS) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !('MSStream' in window);
    setIsIOS(ios);

    if (ios) {
      // iOS has no beforeinstallprompt — show after short delay
      const t = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(t);
    }

    // Android / Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const t = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(t);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    localStorage.setItem(LS_KEY, Date.now().toString());
    setShow(false);
  }

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      dismiss();
      setDeferredPrompt(null);
    } else {
      // iOS — just dismiss; user reads the instructions
      dismiss();
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-28 inset-x-4 z-50 max-w-sm mx-auto"
          >
            <div
              className="relative rounded-3xl border border-white/10 overflow-hidden p-6"
              style={{ background: 'linear-gradient(135deg, #0f1e3e 0%, #080d1e 100%)' }}
            >
              {/* Subtle top glow */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

              {/* Dismiss */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-white/25 hover:text-white/50 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Logo */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border border-white/8"
                  style={{ background: 'linear-gradient(135deg, #050714 0%, #0d1b3e 100%)' }}
                >
                  <span className="text-2xl leading-none">⚽</span>
                  <span className="text-[10px] font-black text-gold leading-none tracking-tight mt-0.5">Mundial</span>
                  <span className="text-[8px] font-semibold text-white/40 leading-none tracking-wider">2026</span>
                </div>
                <div>
                  <p className="text-white font-bold text-base leading-tight">Instalar App</p>
                  <p className="text-white/40 text-xs mt-1 leading-relaxed">
                    {isIOS
                      ? 'Adiciona ao ecrã inicial para uma experiência melhor.'
                      : 'Adiciona ao ecrã inicial para acesso rápido.'}
                  </p>
                </div>
              </div>

              {/* iOS instructions */}
              {isIOS && (
                <div className="mb-4 bg-white/4 rounded-2xl px-4 py-3 border border-white/6 flex items-center gap-3">
                  <Share size={15} className="text-white/40 flex-shrink-0" />
                  <p className="text-white/50 text-xs leading-relaxed">
                    Toca em <span className="text-white/70 font-semibold">Partilhar</span> e depois em{' '}
                    <span className="text-white/70 font-semibold">Adicionar ao ecrã inicial</span>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={dismiss}
                  className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/8 text-white/40 text-sm font-medium"
                >
                  Agora não
                </button>
                <motion.button
                  onClick={handleInstall}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-3 rounded-2xl bg-gold text-black text-sm font-bold"
                >
                  Instalar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
