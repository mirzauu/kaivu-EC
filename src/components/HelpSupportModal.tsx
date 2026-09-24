import { HelpCircle, X, MessageCircle, ExternalLink, PhoneCall, Phone } from "lucide-react";

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpSupportModal({ isOpen, onClose }: HelpSupportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-sm rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-5 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/10 text-brand">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Help & Support</h3>
              <p className="text-xs text-muted-foreground">We're here to assist you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-accent text-muted-foreground hover:bg-accent/80 hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contact Options */}
        <div className="space-y-3">
          {/* WhatsApp Option */}
          <a
            href="https://wa.me/918129285383?text=Hi%20Kaivu%20Support,%20I%20need%20help%20with%20my%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-white shadow-xs">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-foreground">WhatsApp Chat</h4>
                  <span className="rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.2">
                    Fastest
                  </span>
                </div>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  +91 81292 85383
                </p>
              </div>
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 group-hover:translate-x-0.5 transition-transform">
              <ExternalLink className="h-4 w-4" />
            </div>
          </a>

          {/* Call Option */}
          <a
            href="tel:8129285383"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-brand/10 border border-brand/20 hover:bg-brand/15 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-brand-foreground shadow-xs">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-foreground">Call Helpline</h4>
                  <span className="rounded bg-brand/20 text-brand text-[9px] font-bold px-1.5 py-0.2">
                    Direct
                  </span>
                </div>
                <p className="text-xs font-semibold text-brand">
                  81292 85383
                </p>
              </div>
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand/20 text-brand group-hover:translate-x-0.5 transition-transform">
              <Phone className="h-4 w-4" />
            </div>
          </a>
        </div>

        {/* Note */}
        <p className="text-center text-[11px] text-muted-foreground">
          Order helpline & customer service active 7 days a week.
        </p>
      </div>
    </div>
  );
}
