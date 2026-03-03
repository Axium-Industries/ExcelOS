import { code } from "@streamdown/code";
import { Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { getSelectedRangeData } from "../../../lib/excel/api";
import { useChat } from "./chat-context";

function buildPrompt(address: string, formula: string): string {
  return `You are an Excel expert. Explain the following formula concisely for a non-technical user in 3-4 sentences. Then add a section titled "## Suggestions" with 1-3 bullet points on how to improve or simplify it — or write "No improvements needed." if it's already well-written.

Cell: ${address}
Formula: ${formula}`;
}

export function FormulaPanel() {
  const { state, streamCompletion } = useChat();

  const [formula, setFormula] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const lastAddressRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runExplanation = useCallback(
    async (addr: string, formulaStr: string) => {
      // Abort any previous call
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setExplanation("");
      setLoading(true);

      try {
        await streamCompletion(
          buildPrompt(addr, formulaStr),
          (chunk) => setExplanation((prev) => prev + chunk),
          controller.signal,
        );
      } catch (_err) {
        if (!controller.signal.aborted) {
          setExplanation(
            "Error generating explanation. Check your API key in Settings.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [streamCompletion],
  );

  // Poll for selection changes
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      try {
        const data = await getSelectedRangeData();
        if (!data || cancelled) return;

        const addr = data.address;
        const cellFormula = data.formulas?.[0]?.[0];
        const hasFormula =
          typeof cellFormula === "string" && cellFormula.startsWith("=");

        if (addr === lastAddressRef.current) return;
        lastAddressRef.current = addr;

        if (hasFormula) {
          setAddress(addr);
          setFormula(cellFormula);
          runExplanation(addr, cellFormula);
        } else {
          // Abort in-flight call if we navigated away from a formula cell
          abortRef.current?.abort();
          abortRef.current = null;
          setAddress(null);
          setFormula(null);
          setExplanation("");
          setLoading(false);
        }
      } catch {
        // ignore
      }
    };

    poll();
    const id = setInterval(poll, 400);
    return () => {
      cancelled = true;
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [runExplanation]);

  const handleCopy = () => {
    if (formula) {
      navigator.clipboard.writeText(formula).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  };

  if (!state.providerConfig) {
    return (
      <div className="flex-1 px-3 py-3">
        <p className="text-xs text-(--chat-text-muted)">
          Configure your API key in Settings to use Formula explanations.
        </p>
      </div>
    );
  }

  if (!formula) {
    return (
      <div className="flex-1 px-3 py-3">
        <div className="text-[10px] uppercase tracking-widest text-(--chat-text-muted) mb-3">
          formula
        </div>
        <p className="text-xs text-(--chat-text-muted) leading-relaxed">
          Select a cell with a formula to see an explanation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
      {/* Formula */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] uppercase tracking-widest text-(--chat-text-muted)">
            formula
            {address && (
              <span className="ml-1.5 normal-case text-(--chat-text-muted)">
                · {address}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-(--chat-text-muted) hover:text-(--chat-text-primary) transition-colors"
            title="Copy formula"
          >
            {copied ? (
              <span className="text-[10px] text-(--chat-accent)">Copied</span>
            ) : (
              <Copy size={11} />
            )}
          </button>
        </div>
        <div
          className="text-xs font-mono bg-(--chat-input-bg) border border-(--chat-border)
                     px-2.5 py-2 text-(--chat-text-primary) break-all"
          style={{ borderRadius: "var(--chat-radius)" }}
        >
          {formula}
        </div>
      </div>

      {/* Explanation */}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-(--chat-text-muted) mb-1.5">
          explanation
          {loading && (
            <span className="ml-1.5 normal-case animate-pulse">···</span>
          )}
        </div>
        {explanation ? (
          <div className="text-xs text-(--chat-text-primary) leading-relaxed markdown-content">
            <Streamdown plugins={{ code }} isAnimating={loading}>
              {explanation}
            </Streamdown>
          </div>
        ) : (
          <div className="text-xs text-(--chat-text-muted) animate-pulse">
            Analyzing formula…
          </div>
        )}
      </div>
    </div>
  );
}
