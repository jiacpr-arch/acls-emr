import { useState, useEffect, useRef, useCallback } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';

// Voice Command — hands-free during CPR
// Uses Web Speech API (works offline on some browsers)
const COMMANDS = {
  'epinephrine': { action: 'drug', type: '💉 Epinephrine 1mg IV (voice command)' },
  'epi': { action: 'drug', type: '💉 Epinephrine 1mg IV (voice command)' },
  'amiodarone': { action: 'drug', type: '💉 Amiodarone 300mg IV (voice command)' },
  'atropine': { action: 'drug', type: '💉 Atropine 1mg IV (voice command)' },
  'shock': { action: 'shock', type: '⚡ Shock delivered (voice command)' },
  'defibrillate': { action: 'shock', type: '⚡ Defibrillation (voice command)' },
  'check rhythm': { action: 'rhythm', type: '🔍 Check Rhythm (voice command)' },
  'check pulse': { action: 'pulse', type: '🫀 Check Pulse (voice command)' },
  'rosc': { action: 'rosc', type: '💚 ROSC (voice command)' },
  'resume': { action: 'resume', type: '▶️ Resume CPR (voice command)' },
  'pause': { action: 'pause', type: '⏸ Pause CPR (voice command)' },
  'airway': { action: 'event', type: '🫁 Airway (voice command)' },
  'intubation': { action: 'event', type: '🫁 Intubation (voice command)' },
  'flush': { action: 'event', type: '💉 Flush 20ml NS (voice command)' },
};

export default function VoiceCommand({ onCommand }) {
  const [listening, setListening] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [showLastCommand, setShowLastCommand] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);

  useEffect(() => {
    if (!lastCommand) return;
    setShowLastCommand(true);
    const id = setTimeout(() => setShowLastCommand(false), 3000);
    return () => clearTimeout(id);
  }, [lastCommand]);

  const processCommand = useCallback((transcript) => {
    for (const [keyword, cmd] of Object.entries(COMMANDS)) {
      if (transcript.includes(keyword)) {
        setLastCommand({ keyword, time: Date.now() });
        addEvent({ elapsed, category: cmd.action === 'drug' ? 'drug' : 'other', type: cmd.type, details: { voice: true } });
        if (onCommand) onCommand(cmd.action, keyword);
        return;
      }
    }
    setLastCommand({ keyword: `"${transcript}" — not recognized`, time: Date.now() });
  }, [addEvent, elapsed, onCommand]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const last = event.results[event.results.length - 1];
        if (last.isFinal) {
          const transcript = last[0].transcript.toLowerCase().trim();
          processCommand(transcript);
        }
      };

      recognition.onerror = () => { setListening(false); };
      recognition.onend = () => {
        if (listening) {
          try { recognition.start(); } catch { setListening(false); }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_e) { /* ignore */ }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processCommand]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch { setListening(false); }
    }
  };

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      <button onClick={toggleListening}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
          listening
            ? 'bg-danger text-white animate-pulse shadow-lg'
            : 'bg-bg-primary border border-bg-tertiary text-text-muted'
        }`} style={{ minHeight: '32px', minWidth: '32px' }}>
        {listening ? '🎤 Listening...' : '🎤'}
      </button>
      {lastCommand && showLastCommand && (
        <span className="text-[9px] text-info font-semibold animate-slide-up">{lastCommand.keyword}</span>
      )}
    </div>
  );
}
