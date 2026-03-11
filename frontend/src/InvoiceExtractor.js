import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function InvoiceExtractor() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Please upload a valid invoice image.");
      setFile(null);
      setPreview(null);
      setData(null);
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const objectUrl = URL.createObjectURL(selected);

    setError("");
    setFile(selected);
    setData(null);
    setPreview(objectUrl);
  };

  const extract = async () => {
    if (!file) {
      setError("Please upload an invoice image first.");
      return;
    }

    setLoading(true);
    setError("");

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      try {
        const base64Image = reader.result;

        if (!base64Image) {
          throw new Error("Could not read the selected image.");
        }

        const res = await fetch("http://localhost:5000/extract-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result?.details || result?.error || "Extraction failed");
        }

        setData({
          metadata: result.metadata || {},
          detected_columns: Array.isArray(result.detected_columns) ? result.detected_columns : [],
          items: Array.isArray(result.items) ? result.items : [],
          summary_rows: Array.isArray(result.summary_rows) ? result.summary_rows : [],
          grand_total: result.grand_total || "",
          raw_text: result.raw_text || "",
        });
      } catch (err) {
        setError(err?.message || "Backend Error");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setLoading(false);
      setError("Failed to read the image file.");
    };
  };

  const tableHeaders = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data.detected_columns) && data.detected_columns.length > 0) {
      return data.detected_columns;
    }
    if (Array.isArray(data.items) && data.items.length > 0) {
      return Object.keys(data.items[0]);
    }
    return [];
  }, [data]);

  const downloadJSON = () => {
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    saveAs(blob, "invoice-data.json");
  };

  const downloadTable = () => {
    if (!data || !data.items || data.items.length === 0) return;

    const wb = XLSX.utils.book_new();

    const tableSheet = XLSX.utils.json_to_sheet(data.items);
    XLSX.utils.book_append_sheet(wb, tableSheet, "Invoice Table");

    if (data.summary_rows?.length) {
      const summarySheet = XLSX.utils.json_to_sheet(data.summary_rows);
      XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    }

    const metadataSheet = XLSX.utils.json_to_sheet([
      {
        vendor: data.metadata?.vendor || "",
        customer: data.metadata?.customer || "",
        invoice_no: data.metadata?.invoice_no || "",
        date: data.metadata?.date || "",
        grand_total: data.grand_total || "",
      },
    ]);
    XLSX.utils.book_append_sheet(wb, metadataSheet, "Metadata");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, "invoice-table.xlsx");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <div className="backdrop-blur-xl min-h-screen">
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-[0.25em] text-white">
                SMARTY<span className="text-indigo-400"></span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Smart invoice extraction with clean mirrored output
              </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="file"
                id="upload"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />

              <label
                htmlFor="upload"
                className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10 transition"
              >
                Upload Invoice
              </label>

              <button
                onClick={extract}
                disabled={loading || !file}
                className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-400 transition disabled:opacity-40"
              >
                {loading ? "Analyzing..." : "Run Extraction"}
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="max-w-7xl mx-auto px-6 md:px-10 pt-5">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
              {error}
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-6 md:px-10 py-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
                Source Image
              </h2>
            </div>

            <div className="h-[500px] flex items-center justify-center p-6 bg-black/20">
              {preview ? (
                <img
                  src={preview}
                  alt="Invoice Preview"
                  className="max-w-full max-h-full object-contain rounded-2xl border border-white/10 shadow-2xl"
                />
              ) : (
                <div className="text-slate-600 text-3xl font-black tracking-widest">
                  NO IMAGE
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/95 text-slate-900 overflow-hidden shadow-2xl xl:col-span-2">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Extracted Output
              </h2>

              {data && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={downloadTable}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition"
                  >
                    Download Table
                  </button>
                  <button
                    onClick={downloadJSON}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
                  >
                    Download JSON
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 max-h-[700px] overflow-auto">
              {data ? (
                <div className="space-y-6">
                  <div className="rounded-3xl bg-gradient-to-r from-slate-50 to-indigo-50 border border-slate-200 p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <h3 className="text-2xl font-black tracking-tight text-slate-900">
                          {data.metadata?.vendor || "Vendor not found"}
                        </h3>
                        <p className="mt-3 text-sm text-slate-500">
                          Customer:{" "}
                          <span className="font-semibold text-slate-800">
                            {data.metadata?.customer || "-"}
                          </span>
                        </p>
                      </div>

                      <div className="space-y-2 text-sm md:text-right text-slate-600">
                        <p>
                          <span className="font-bold text-slate-800">Invoice No:</span>{" "}
                          {data.metadata?.invoice_no || "-"}
                        </p>
                        <p>
                          <span className="font-bold text-slate-800">Date:</span>{" "}
                          {data.metadata?.date || "-"}
                        </p>
                        <p>
                          <span className="font-bold text-slate-800">Grand Total:</span>{" "}
                          {data.grand_total || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    {tableHeaders.length > 0 && data.items?.length > 0 ? (
                      <div className="overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-100">
                            <tr>
                              {tableHeaders.map((header, index) => (
                                <th
                                  key={index}
                                  className="px-6 py-4 text-left font-black uppercase tracking-wide text-slate-600 whitespace-nowrap"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100 bg-white">
                            {data.items.map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-slate-50 transition">
                                {tableHeaders.map((header, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="px-6 py-4 whitespace-nowrap text-slate-800"
                                  >
                                    {row?.[header] ?? ""}
                                  </td>
                                ))}
                              </tr>
                            ))}

                            {data.summary_rows?.map((s, i) => (
                              <tr key={`summary-${i}`} className="bg-slate-50">
                                <td
                                  colSpan={Math.max(tableHeaders.length - 1, 1)}
                                  className="px-6 py-3 text-right font-bold uppercase text-slate-500"
                                >
                                  {s.label}
                                </td>
                                <td className="px-6 py-3 font-bold text-slate-900">
                                  {s.value}
                                </td>
                              </tr>
                            ))}

                            {data.grand_total && (
                              <tr className="bg-indigo-700 text-white">
                                <td
                                  colSpan={Math.max(tableHeaders.length - 1, 1)}
                                  className="px-6 py-5 text-right font-black uppercase tracking-[0.15em]"
                                >
                                  Total Amount Due
                                </td>
                                <td className="px-6 py-5 text-lg md:text-2xl font-black">
                                  {data.grand_total}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-10 text-center text-slate-400 font-semibold">
                        No table detected in the invoice.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[500px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-black text-slate-200">⌁</div>
                    <p className="mt-4 text-slate-400 font-semibold tracking-wide">
                      Upload an invoice and run extraction
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        {data && (
          <div className="max-w-7xl mx-auto px-6 md:px-10 pb-10">
            <section className="rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                  JSON Output
                </h2>
              </div>
              <div className="p-6 overflow-auto">
                <pre className="whitespace-pre-wrap text-sm text-emerald-400 font-mono">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceExtractor;