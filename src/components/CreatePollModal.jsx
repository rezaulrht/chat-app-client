"use client";

import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/app/api/Axios";

export default function CreatePollModal({
  conversation,
  onClose,
  onPollCreated,
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    { id: "opt-1", value: "" },
    { id: "opt-2", value: "" },
  ]);

  const [allowMultiple, setAllowMultiple] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);

  // ──────────────────────────────────────────────────────────
  // Add new option
  // ──────────────────────────────────────────────────────────

  const handleAddOption = () => {
    if (options.length >= 10) {
      toast.error("Maximum 10 options allowed");
      return;
    }
    // ✅ Generate unique ID for new option
    setOptions([...options, { id: `opt-${Date.now()}`, value: "" }]);
  };

  // ──────────────────────────────────────────────────────────
  // Remove option
  // ──────────────────────────────────────────────────────────

  const handleRemoveOption = (optionId) => {
    if (options.length <= 2) {
      toast.error("At least 2 options are required");
      return;
    }
    // ✅ Remove by ID instead of index
    setOptions(options.filter((opt) => opt.id !== optionId));
  };

  // ──────────────────────────────────────────────────────────
  // Update option text
  // ──────────────────────────────────────────────────────────

  const handleOptionChange = (optionId, value) => {
    // ✅ Update by ID instead of index
    setOptions(
      options.map((opt) => (opt.id === optionId ? { ...opt, value } : opt)),
    );
  };

  // ──────────────────────────────────────────────────────────
  // Create poll
  // ──────────────────────────────────────────────────────────

  const handleCreatePoll = async () => {
    // Validation
    if (!question.trim()) {
      toast.error("Please enter a poll question");
      return;
    }
    const validOptions = options
      .filter((opt) => opt.value.trim())
      .map((opt) => opt.value.trim());

    if (validOptions.length < 2) {
      toast.error("Please provide at least 2 options");
      return;
    }

    if (hasExpiry && !expiresAt) {
      toast.error("Please select expiry date and time");
      return;
    }

    if (hasExpiry) {
      const expiryDate = new Date(expiresAt);
      if (expiryDate <= new Date()) {
        toast.error("Expiry time must be in the future");
        return;
      }
    }

    setCreating(true);

    try {
      const res = await api.post(
        `/api/chat/conversations/${conversation._id}/polls`,
        {
          question: question.trim(),
          options: validOptions,
          allowMultiple,
          expiresAt: hasExpiry ? expiresAt : null,
        },
      );

      toast.success("📊 Poll created!");
      onPollCreated?.(res.data);
      onClose();
    } catch (err) {
      console.error("Create poll error:", err);
      toast.error(err.response?.data?.message || "Failed to create poll");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-deep border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* ──────────────────────────────────────────────── */}
        {/* Header */}
        {/* ──────────────────────────────────────────────── */}

        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h2 className="font-bold text-ivory text-base">Create Poll</h2>
              <p className="text-xs text-ivory/40">
                Ask a question with multiple options
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-ivory/40 hover:text-ivory transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* ──────────────────────────────────────────────── */}
        {/* Body */}
        {/* ──────────────────────────────────────────────── */}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {/* Question Input */}
          <div>
            <label className="block text-xs font-bold text-ivory/60 mb-2">
              Poll Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              maxLength={500}
              className="w-full px-4 py-3 bg-slate-surface border border-white/10 rounded-xl text-ivory text-sm placeholder:text-ivory/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            />
            <p className="text-[10px] text-ivory/20 mt-1">
              {question.length}/500 characters
            </p>
          </div>

          {/* Options */}
          <div>
            <label className="block text-xs font-bold text-ivory/60 mb-2">
              Options
            </label>
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) =>
                      handleOptionChange(option.id, e.target.value)
                    }
                    placeholder={`Option ${options.indexOf(option) + 1}`}
                    maxLength={200}
                    className="flex-1 px-4 py-2.5 bg-slate-surface border border-white/10 rounded-xl text-ivory text-sm placeholder:text-ivory/20 focus:outline-none focus:border-accent/50 transition-all"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(option.id)}
                      className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 transition-all"
                      title="Remove option"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Option Button */}
            {options.length < 10 && (
              <button
                onClick={handleAddOption}
                className="mt-2 w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-ivory/60 hover:text-ivory text-sm font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={16} />
                Add Option
              </button>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-3 pt-2">
            {/* Allow Multiple Votes */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-white/20 bg-transparent checked:bg-accent checked:border-accent cursor-pointer transition-all"
              />
              <div>
                <p className="text-sm font-medium text-ivory group-hover:text-accent transition-colors">
                  Allow multiple votes
                </p>
                <p className="text-[10px] text-ivory/30">
                  Members can select more than one option
                </p>
              </div>
            </label>

            {/* Set Expiry */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={hasExpiry}
                onChange={(e) => setHasExpiry(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-white/20 bg-transparent checked:bg-accent checked:border-accent cursor-pointer transition-all"
              />
              <div>
                <p className="text-sm font-medium text-ivory group-hover:text-accent transition-colors">
                  Set expiry time
                </p>
                <p className="text-[10px] text-ivory/30">
                  Poll will close after this time
                </p>
              </div>
            </label>

            {/* Expiry Date Picker */}
            {hasExpiry && (
              <div className="ml-7 mt-2">
                <input
                  type="datetime-local"
                  value={expiresAt}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-surface border border-white/10 rounded-xl text-ivory text-sm focus:outline-none focus:border-accent/50 transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* ──────────────────────────────────────────────── */}
        {/* Footer */}
        {/* ──────────────────────────────────────────────── */}

        <div className="p-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-ivory/60 hover:text-ivory font-bold text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreatePoll}
            disabled={creating}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-lg ${
              creating
                ? "bg-slate-600 text-ivory/40 cursor-not-allowed"
                : "bg-accent hover:bg-accent/90 text-black shadow-accent/20 active:scale-95"
            }`}
          >
            {creating ? "Creating..." : "Create Poll"}
          </button>
        </div>
      </div>
    </div>
  );
}
