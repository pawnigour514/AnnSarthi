import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Check, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useDemoStore } from '../../store/demoStore';

export function AssistantWidget({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const { addToast } = useDemoStore();
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello ${user?.name || 'Partner'}! I am AnnSarthi's AI Operations Assistant. How can I assist with your surplus food redistribution today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingAction]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput('');
    const newMsg = {
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setIsSending(true);

    try {
      const { data } = await api.post('/assistant/chat', { message: userText });
      const assistantReply = {
        sender: 'assistant',
        text: data.data.reply,
        mode: data.data.mode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantReply]);

      if (data.data.requiresConfirmation && data.data.proposedAction) {
        setPendingAction(data.data.proposedAction);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Apologies, I encountered an issue processing your request. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setIsSending(true);
    try {
      await api.post('/assistant/execute-tool', {
        action: pendingAction.action,
        payload: pendingAction.data,
      });

      addToast({
        title: 'Action Executed',
        message: 'Draft record confirmed and posted successfully!',
        type: 'success',
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: '✅ Action confirmed and successfully submitted to the AnnSarthi ecosystem! Check your dashboard for live tracking.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setPendingAction(null);
    } catch (err) {
      addToast({
        title: 'Execution Failed',
        message: err.response?.data?.error?.message || 'Could not complete tool action',
        type: 'error',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white border border-surface-border rounded-2xl shadow-elevated flex flex-col h-[520px] overflow-hidden text-left">
      {/* Header */}
      <div className="p-3.5 bg-brand-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-800 text-brand-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-heading">AnnSarthi Assistant</h4>
            <span className="text-[10px] text-brand-300 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Role-Gated Tools Active
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-brand-300 hover:text-white hover:bg-brand-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-surface-subtle/40">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none shadow-soft'
                  : 'bg-white border border-surface-border text-content-primary rounded-bl-none shadow-soft whitespace-pre-line'
              }`}
            >
              {m.text}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[9px] text-content-light px-1">
              <span>{m.timestamp}</span>
              {m.mode && <span>• {m.mode}</span>}
            </div>
          </div>
        ))}

        {/* Confirmation Barrier Card */}
        {pendingAction && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Confirmation Required</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-snug">
              AnnSarthi enforces human confirmation before any write operation. Would you like to post this draft?
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="px-2.5 py-1 text-[11px] font-semibold text-content-secondary bg-white border border-surface-border rounded-lg hover:bg-surface-subtle"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isSending}
                className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
              >
                <Check className="w-3 h-3" />
                <span>Confirm & Submit</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-surface-border flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask as ${user?.role || 'user'}...`}
          className="flex-1 text-xs px-3 py-2 border border-surface-border rounded-xl focus:outline-none focus:border-brand-600"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white shadow-soft transition-all"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
