import React from "react";

export default function WebsiteEmbed({ url, open, onClose }) {
  React.useEffect(() => {
    if (!open) return;
    const keyHandler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [open, onClose]);

  if (!open || !url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-sm font-medium">Provider website</div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900 text-sm">Close</button>
        </div>
        {/* Note: many sites block embedding with X-Frame-Options — if it fails, the user can click View profile to open the page externally. */}
        <iframe
          src={url}
          title="Provider website"
          className="w-full h-full"
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
}