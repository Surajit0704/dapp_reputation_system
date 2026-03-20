"use client";

import { useState, useCallback } from "react";
import {
  giveRep,
  getRep,
  getGivenRep,
  getVote,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "give" | "check" | "history";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("give");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Give Rep state
  const [giveTo, setGiveTo] = useState("");
  const [giveAmount, setGiveAmount] = useState("");
  const [isGiving, setIsGiving] = useState(false);

  // Check Rep state
  const [checkAddress, setCheckAddress] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [repData, setRepData] = useState<{ received: string; given: string } | null>(null);

  // History state
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [isHistory, setIsHistory] = useState(false);
  const [voteData, setVoteData] = useState<string | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleGiveRep = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!giveTo.trim()) return setError("Enter recipient address");
    if (!giveAmount.trim() || Number(giveAmount) <= 0) return setError("Enter a positive amount");
    setError(null);
    setIsGiving(true);
    setTxStatus("Awaiting signature...");
    try {
      await giveRep(walletAddress, giveTo.trim(), BigInt(giveAmount));
      setTxStatus("Reputation given!");
      setGiveTo("");
      setGiveAmount("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsGiving(false);
    }
  }, [walletAddress, giveTo, giveAmount]);

  const handleCheckRep = useCallback(async () => {
    if (!checkAddress.trim()) return setError("Enter an address");
    setError(null);
    setIsChecking(true);
    setRepData(null);
    try {
      const [received, given] = await Promise.all([
        getRep(checkAddress.trim(), walletAddress || undefined),
        getGivenRep(checkAddress.trim(), walletAddress || undefined),
      ]);
      setRepData({
        received: received?.toString() || "0",
        given: given?.toString() || "0",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsChecking(false);
    }
  }, [checkAddress, walletAddress]);

  const handleCheckHistory = useCallback(async () => {
    if (!historyFrom.trim() || !historyTo.trim()) return setError("Enter both addresses");
    setError(null);
    setIsHistory(true);
    setVoteData(null);
    try {
      const result = await getVote(historyFrom.trim(), historyTo.trim(), walletAddress || undefined);
      setVoteData(result?.toString() || "0");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsHistory(false);
    }
  }, [historyFrom, historyTo, walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "give", label: "Give Rep", icon: <HeartIcon />, color: "#f472b6" },
    { key: "check", label: "Check Rep", icon: <StarIcon />, color: "#fbbf24" },
    { key: "history", label: "History", icon: <SearchIcon />, color: "#4fc3f7" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") || txStatus.includes("given") || txStatus.includes("updated") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f472b6]/20 to-[#fbbf24]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f472b6]">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Reputation System</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setRepData(null); setVoteData(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Give Rep */}
            {activeTab === "give" && (
              <div className="space-y-5">
                <MethodSignature name="give_rep" params="(from: Addr, to: Addr, amount: i128)" color="#f472b6" />
                <Input 
                  label="Recipient Address" 
                  value={giveTo} 
                  onChange={(e) => setGiveTo(e.target.value)} 
                  placeholder="G..." 
                />
                <Input 
                  label="Amount" 
                  type="number"
                  min="1"
                  value={giveAmount} 
                  onChange={(e) => setGiveAmount(e.target.value)} 
                  placeholder="e.g. 1, 5, 10" 
                />
                
                {/* Quick amount buttons */}
                <div className="flex gap-2">
                  {[1, 5, 10, 100].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setGiveAmount(amt.toString())}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all active:scale-95",
                        giveAmount === amt.toString()
                          ? "border-[#f472b6]/30 bg-[#f472b6]/10 text-[#f472b6]"
                          : "border-white/[0.06] bg-white/[0.02] text-white/35 hover:text-white/55 hover:border-white/[0.1]"
                      )}
                    >
                      <StarIcon />
                      {amt}
                    </button>
                  ))}
                </div>

                {walletAddress ? (
                  <ShimmerButton onClick={handleGiveRep} disabled={isGiving} shimmerColor="#f472b6" className="w-full">
                    {isGiving ? <><SpinnerIcon /> Sending...</> : <><SendIcon /> Give Reputation</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#f472b6]/20 bg-[#f472b6]/[0.03] py-4 text-sm text-[#f472b6]/60 hover:border-[#f472b6]/30 hover:text-[#f472b6]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to give reputation
                  </button>
                )}

                <p className="text-[10px] text-white/20 text-center">
                  Fully permissionless • Anyone can give rep to anyone
                </p>
              </div>
            )}

            {/* Check Rep */}
            {activeTab === "check" && (
              <div className="space-y-5">
                <MethodSignature name="get_rep" params="(address: Addr)" returns="-> i128" color="#fbbf24" />
                <Input 
                  label="Address to Check" 
                  value={checkAddress} 
                  onChange={(e) => setCheckAddress(e.target.value)} 
                  placeholder="G..." 
                />
                <ShimmerButton onClick={handleCheckRep} disabled={isChecking} shimmerColor="#fbbf24" className="w-full">
                  {isChecking ? <><SpinnerIcon /> Checking...</> : <><StarIcon /> Check Reputation</>}
                </ShimmerButton>

                {repData && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Reputation Details</span>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35 flex items-center gap-2">
                          <HeartIcon /> Received
                        </span>
                        <span className="font-mono text-xl text-[#f472b6]">{repData.received}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35 flex items-center gap-2">
                          <SendIcon /> Given
                        </span>
                        <span className="font-mono text-xl text-[#4fc3f7]">{repData.given}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History */}
            {activeTab === "history" && (
              <div className="space-y-5">
                <MethodSignature name="get_vote" params="(from: Addr, to: Addr)" returns="-> i128" color="#4fc3f7" />
                <Input 
                  label="From Address" 
                  value={historyFrom} 
                  onChange={(e) => setHistoryFrom(e.target.value)} 
                  placeholder="G... (who gave)" 
                />
                <Input 
                  label="To Address" 
                  value={historyTo} 
                  onChange={(e) => setHistoryTo(e.target.value)} 
                  placeholder="G... (who received)" 
                />
                <ShimmerButton onClick={handleCheckHistory} disabled={isHistory} shimmerColor="#4fc3f7" className="w-full">
                  {isHistory ? <><SpinnerIcon /> Querying...</> : <><SearchIcon /> Check History</>}
                </ShimmerButton>

                {voteData !== null && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Total Given</span>
                        <span className="font-mono text-2xl text-[#4fc3f7]">{voteData}</span>
                      </div>
                      <p className="text-[10px] text-white/20 mt-2">
                        {truncate(historyFrom)} → {truncate(historyTo)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Reputation System &middot; Soroban</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#f472b6]" />
                <span className="font-mono text-[9px] text-white/15">Received</span>
              </span>
              <span className="text-white/10 text-[8px]">&rarr;</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#4fc3f7]" />
                <span className="font-mono text-[9px] text-white/15">Given</span>
              </span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
