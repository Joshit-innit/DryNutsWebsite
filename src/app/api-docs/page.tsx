"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Terminal, Play, Copy, Check, ExternalLink, ArrowLeft, Code2 } from "lucide-react";
import { toast } from "sonner";

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  category: string;
  sampleBody?: string;
}

export default function ApiDocsPage() {
  const [activeEndpoint, setActiveEndpoint] = useState<number>(0);
  const [requestBody, setRequestBody] = useState<string>("");
  const [responseOutput, setResponseOutput] = useState<string>("");
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const endpoints: Endpoint[] = [
    {
      method: "GET",
      path: "/api/v1/products",
      description: "List all dry fruits with optional query filters (category, search, minPrice, maxPrice, rating, inStockOnly, sortBy).",
      category: "Catalog",
    },
    {
      method: "GET",
      path: "/api/v1/products/royal-jumbo-cashews-w180",
      description: "Retrieve complete specifications, nutrition facts, and weight variants for a single product slug.",
      category: "Catalog",
    },
    {
      method: "GET",
      path: "/api/v1/categories",
      description: "Retrieve all 9 core harvest categories and curated gift collections.",
      category: "Taxonomy",
    },
    {
      method: "POST",
      path: "/api/v1/coupons",
      description: "Validate a promotional coupon code against an active basket subtotal.",
      category: "Checkout",
      sampleBody: JSON.stringify({ code: "FIRSTBUY", subtotal: 1500 }, null, 2),
    },
    {
      method: "GET",
      path: "/api/v1/orders",
      description: "List all customer fulfillment orders and tracking timeline milestones.",
      category: "Orders",
    },
    {
      method: "GET",
      path: "/api/v1/health",
      description: "Get real-time cluster health, latency telemetry, and subservice probes.",
      category: "DevOps Telemetry",
    },
  ];

  const handleSelectEndpoint = (index: number) => {
    setActiveEndpoint(index);
    setRequestBody(endpoints[index].sampleBody || "");
    setResponseOutput("");
    setResponseStatus(null);
  };

  const handleExecuteRequest = async () => {
    const ep = endpoints[activeEndpoint];
    setLoading(true);
    try {
      const options: RequestInit = {
        method: ep.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: ep.method !== "GET" && requestBody ? requestBody : undefined,
      };

      const res = await fetch(ep.path, options);
      const json = await res.json();
      setResponseStatus(res.status);
      setResponseOutput(JSON.stringify(json, null, 2));
      toast.success(`HTTP ${res.status} Response received`);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseOutput(JSON.stringify({ error: err.message }, null, 2));
      toast.error("API Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCurl = () => {
    const ep = endpoints[activeEndpoint];
    let curl = `curl -X ${ep.method} "http://localhost:3000${ep.path}"`;
    if (ep.method !== "GET" && requestBody) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.replace(/\n/g, "")}'`;
    }
    navigator.clipboard.writeText(curl);
    toast.success("cURL command copied to clipboard!");
  };

  const ep = endpoints[activeEndpoint];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 sm:p-10 space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/" className="text-xs text-brand-green font-bold hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-saffron">
              REST API OPENAPI EXPLORER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Code2 className="w-7 h-7 text-brand-green" />
            <span>NutriNation REST API Documentation & Tester</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Base URL: <code className="text-brand-green font-mono">/api/v1</code> • Schema: JSON REST 1.0 • Auth: Bearer JWT
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCurl}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy cURL</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Endpoint Navigator + Request/Response Console */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Endpoints list */}
        <div className="lg:col-span-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 p-4 space-y-2">
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider px-2 mb-2">
            Available Endpoints
          </h3>
          <div className="space-y-1">
            {endpoints.map((e, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectEndpoint(idx)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-2.5 ${
                  activeEndpoint === idx
                    ? "bg-slate-700 text-white border border-brand-green/40 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    e.method === "GET"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {e.method}
                </span>
                <span className="font-mono text-xs truncate flex-1">{e.path}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Area: Interactive Tester Console */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 space-y-6">
            {/* Active Endpoint Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono font-black px-2.5 py-1 rounded-md ${
                    ep.method === "GET"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-white">{ep.path}</span>
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={loading}
                className="bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{loading ? "Sending..." : "Send Request"}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{ep.description}</p>

            {/* Request Body Editor (for POST/PUT) */}
            {ep.method !== "GET" && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Request Payload (JSON Body)
                </label>
                <textarea
                  rows={4}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:border-brand-green"
                />
              </div>
            )}

            {/* Response Console */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Response Payload</span>
                {responseStatus && (
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      responseStatus < 300
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    HTTP {responseStatus}
                  </span>
                )}
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs min-h-[180px] max-h-[360px] overflow-y-auto">
                {responseOutput ? (
                  <pre className="text-emerald-400 whitespace-pre-wrap">{responseOutput}</pre>
                ) : (
                  <span className="text-slate-600">Click &ldquo;Send Request&rdquo; to execute this endpoint live.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
