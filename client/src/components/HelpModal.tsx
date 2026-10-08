import React from 'react';
import { X, Volume2, Phone, FileText, Mic, Eye, Users } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { speak, isSpeaking, stopSpeaking, t } = useAccessibility();

  if (!isOpen) return null;

  const handleReadGuide = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(`Barangay Bensican Help Guide. Step 1: To file a concern, click the big green Send a Report button. You can speak into your phone or take a photo. Step 2: Write down your reference number to check progress anytime. Step 3: For any difficulty, call our hotline at 0917-555-BENSI or ask a family member helper.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-slate-900 border-4 border-amber-500 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-guide-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 rounded-xl text-amber-800 dark:text-amber-400">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <h2 id="help-guide-title" className="text-2xl font-black text-slate-900 dark:text-white">
                How to Use This Website (Gabay sa Paggamit)
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Simple steps for our valued senior citizens and first-time users.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="Close help guide"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Read aloud button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleReadGuide}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow transition"
          >
            <Volume2 className="w-5 h-5" />
            <span>{isSpeaking ? 'Stop Audio' : 'Listen to this Guide (Read Aloud)'}</span>
          </button>
        </div>

        {/* Visual Steps */}
        <div className="space-y-4 text-base">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border-2 border-emerald-300 dark:border-emerald-800">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 font-black text-lg">
              1
            </div>
            <div>
              <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-300">
                Sending a Report or Concern
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mt-1">
                Tap <strong>"Send a Report"</strong>. You do NOT have to write long paragraphs. You can simply tap the microphone icon <Mic className="w-4 h-4 inline text-emerald-600" /> to talk, or upload photos/videos of the problem.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border-2 border-blue-300 dark:border-blue-800">
            <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 font-black text-lg">
              2
            </div>
            <div>
              <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300">
                Your Reference Number (e.g. BSN-2026-00042)
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mt-1">
                Every report gives you a clear number. Write it down or tap "Copy". Use it anytime under <strong>"Check My Reports"</strong> to see status updates and who is assigned to help you.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border-2 border-purple-300 dark:border-purple-800">
            <div className="p-2 bg-purple-600 text-white rounded-lg shrink-0 font-black text-lg">
              3
            </div>
            <div>
              <h3 className="font-bold text-lg text-purple-900 dark:text-purple-300">
                Bring a Helper (May Kasama)
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mt-1">
                A family member, child, or barangay volunteer can fill out forms for you. There is a field to enter their name so the barangay knows who assisted you.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border-2 border-amber-300 dark:border-amber-800">
            <div className="p-2 bg-amber-600 text-slate-950 rounded-lg shrink-0 font-black text-lg">
              4
            </div>
            <div>
              <h3 className="font-bold text-lg text-amber-900 dark:text-amber-300">
                Direct Hotline Assistance
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mt-1">
                If you get stuck or find anything confusing, tap the button below or call our Barangay Bensican Hall hotline.
              </p>
              <div className="mt-3">
                <a
                  href="tel:091755523674"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-lg text-sm hover:bg-emerald-700 transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Hotline: 0917-555-BENSI</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-base shadow transition min-h-[48px]"
          >
            I Understand (Naiintindihan Ko)
          </button>
        </div>
      </div>
    </div>
  );
};

