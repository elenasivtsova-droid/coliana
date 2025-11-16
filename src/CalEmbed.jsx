import React from "react";

export default function CalEmbed({ calUrl, open, onClose }) {
  React.useEffect(() => {
    if (!open) return;
    const keyHandler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [open, onClose]);

  if (!open || !calUrl) return null;

  // We use an iframe fallback for cal.com to keep the integration simple and reliable.
  // Later you can switch to cal.com embed script if you prefer a native embedded widget.
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-sm font-medium">Schedule with Provider</div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900 text-sm">Close</button>
        </div>
        <iframe
          src={calUrl}
          title="Scheduler"
          className="w-full h-full"
          style={{ border: 0 }}
          allow="camera; microphone; geolocation;" // allow if cal.com needs these features
        />
      </div>
    </div>
  );
}
