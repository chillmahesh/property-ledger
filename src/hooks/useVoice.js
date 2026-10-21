import { useState, useRef, useCallback, useEffect } from 'react';

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const sttSupported = typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const startListening = useCallback((lang, onResult) => {
    if (!sttSupported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      onResult(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [sttSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const speak = useCallback((text, lang) => {
    if (!ttsSupported || !text) return;
    // Strip markdown for cleaner speech
    const cleanText = text.replace(/[#*_`~\[\]()]/g, '').replace(/\n+/g, '. ');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [ttsSupported]);

  const stopSpeaking = useCallback(() => {
    if (ttsSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [ttsSupported]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (ttsSupported) window.speechSynthesis.cancel();
    };
  }, [ttsSupported]);

  return {
    isListening, isSpeaking,
    startListening, stopListening,
    speak, stopSpeaking,
    sttSupported, ttsSupported,
  };
}