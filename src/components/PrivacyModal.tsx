import React from 'react';
import { X, Shield, Lock, Trash2, Mail, CheckCircle2 } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteAccount: () => void;
  isLoggedIn: boolean;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onDeleteAccount,
  isLoggedIn,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 overflow-y-auto max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Ochrana súkromia & Kontakt
            </h2>
            <p className="text-xs text-slate-500">Poznač – bezpečné študentské zadania</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-700" />
              <span>Ako chránime tvoje zadania</span>
            </div>
            <p className="text-xs text-slate-500">
              Každý študent má vlastný zabezpečený účet. Databáza Cloud Firestore používa bezpečnostné pravidlá (Firebase Security Rules), ktoré zabezpečujú, že žiadny iný študent ani tretia strana nemôže čítať ani upravovať tvoje úlohy.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-1">Zhromažďované údaje</h3>
            <ul className="space-y-1 list-disc list-inside text-xs text-slate-500">
              <li>Základný Google profil (ID, meno a e-mail pre autentifikáciu)</li>
              <li>Názvy úloh, kategórie, naplánovaný deň, odhadovaný čas a poznámky</li>
              <li>Žiadne údaje sa nepredávajú ani nepoužívajú na marketingové sledovanie</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-1">Právo na výmaz údajov (GDPR)</h3>
            <p className="text-xs text-slate-500">
              Kedykoľvek môžeš svoj účet a všetky zaznamenané úlohy a projekty natrvalo a nenávratne vymazať kliknutím na tlačidlo nižšie.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <Mail className="w-4 h-4 text-slate-700" />
              <span>Kontakt na prevádzkovateľa</span>
            </div>
            <p className="text-xs text-slate-600">
              Pre otázky, návrhy na zlepšenie aplikácie Poznač alebo uplatnenie práv nás kontaktujte na:
            </p>
            <div className="font-mono text-xs font-semibold text-slate-800 mt-1">
              podpora@poznacka.sk
            </div>
          </div>
        </div>

        {/* Delete account CTA */}
        {isLoggedIn && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onClose();
                onDeleteAccount();
              }}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vymazať môj účet a všetky údaje</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Zavrieť
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
