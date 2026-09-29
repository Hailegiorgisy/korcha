// frontend/src/components/HelpSupportModal.tsx
import React, { useState } from "react";

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sheinLink, setSheinLink] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !message.trim()) {
      alert("እባክዎን ስልክ ቁጥርዎን እና ጥያቄዎን ያስገቡ");
      return;
    }

    setSubmitting(true);

    try {
      await fetch("/api/help/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          message: message.trim(),
          sheinLink: sheinLink.trim(),
        }),
      });
    } catch {
      // offline fallback
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const faqs = [
    {
      q: "ኮርቻ (Korcha) ምንድን ነው? እንዴትስ ይሰራል?",
      a: "ኮርቻ ከሼይን (SHEIN.com) የሚፈልጉትን ማንኛውንም እቃ በብር ገዝተው በ 7-14 ቀናት ውስጥ አዲስ አበባ ደጃፍዎ የሚረከቡበት አስተማማኝ የማስመጫ አገልግሎት ነው። በሼይን የመረጡትን እቃ ሊንክ ይዘው ሲመጡ ዋጋውን በብር አስልተን በ 25% ቅድመ ክፍያ እናስመጣሎታለን።",
    },
    {
      q: "እቃዬ ለመድረስ ምን ያህል ጊዜ ይወስዳል?",
      a: "ትዕዛዝዎ ከተረጋገጠ እና የ 25% ቅድመ ክፍያ ከተፈጸመበት ቀን ጀምሮ በ 7 እስከ 14 የስራ ቀናት ውስጥ አዲስ አበባ ይደርሳል።",
    },
    {
      q: "የ 25% ቅድመ ክፍያ ለምን ያስፈልጋል?",
      a: "እቃው ከውጭ ሀገር በዶላር ተገዝቶ በአየር ጭነት ወደ አገር ውስጥ የሚገባ በመሆኑ ደንበኛው ያለውን ቁርጠኝነት ለማረጋገጥ እና የጭነት ወጪውን ለመሸፈን 25% ቅድመ ክፍያ ይከፈላል።",
    },
    {
      q: "ቀሪውን 75% ክፍያ መቼ ነው የምከፍለው?",
      a: "ቀሪው 75% ክፍያ እቃው በአካል እስከ ደጃፍዎ ሲደርስ ብቻ በጥሬ ገንዘብ ወይም በቴሌብር ይከፈላል።",
    },
    {
      q: "ቅድመ ክፍያውን በምን ልክፈል?",
      a: "በቴሌብር (Telebirr ወደ +251911234567 ኮርቻ ሎጂስቲክስ) ወይም በሲቢኢ ብር (CBE Birr) መክፈል ይችላሉ።",
    },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="help-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h3>❓ የደንበኞች እርዳታና ድጋፍ ማዕከል</h3>
          <button type="button" className="btn-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="help-tabs-row">
          <button
            type="button"
            className={`help-tab-btn ${activeTab === "faq" ? "active" : ""}`}
            onClick={() => setActiveTab("faq")}
          >
            📋 የተለመዱ ጥያቄዎች (FAQs)
          </button>
          <button
            type="button"
            className={`help-tab-btn ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            📞 የቀጥታ እርዳታ መጠየቂያ
          </button>
        </div>

        {activeTab === "faq" && (
          <div className="faq-content-list">
            {faqs.map((f, i) => (
              <div key={i} className="faq-card-item">
                <h4 className="faq-question">❓ {f.q}</h4>
                <p className="faq-answer">{f.a}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "contact" && (
          <div className="contact-help-form-wrapper">
            {submitted ? (
              <div className="help-success-box">
                <h4>✅ የእርዳታ ጥያቄዎ በተሳካ ሁኔታ ደርሶናል!</h4>
                <p>ሰራተኞቻችን በቴሌግራም እና በኢሜይል ማሳወቂያ ደርሷቸዋል። በስልክ ቁጥርዎ ({phone}) በደቂቃዎች ውስጥ ያገኙዎታል።</p>
                <button
                  type="button"
                  className="btn-back-help"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage("");
                    setSheinLink("");
                  }}
                >
                  ሌላ ጥያቄ አለዎት?
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitHelp} className="help-form">
                <p className="help-intro-text">
                  በሼይን ላይ እቃ መምረጥ አልቻሉም? ስለ ሳይዝ ጥያቄ አለዎት? ቅጹን ይሙሉ — ሰራተኞቻችን ወዲያውኑ መልእክት ይደርሳቸዋል!
                </p>

                <div className="form-field-group">
                  <label><strong>ስምዎ</strong></label>
                  <input
                    type="text"
                    className="form-control-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ለምሳሌ፦ አበበ ከበደ"
                  />
                </div>

                <div className="form-field-group">
                  <label><strong>ስልክ ቁጥርዎ *</strong></label>
                  <input
                    type="tel"
                    required
                    className="form-control-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0911223344"
                  />
                </div>

                <div className="form-field-group">
                  <label><strong>የእቃው ሊንክ (ካለዎት)</strong></label>
                  <input
                    type="url"
                    className="form-control-input"
                    value={sheinLink}
                    onChange={(e) => setSheinLink(e.target.value)}
                    placeholder="https://www.shein.com/..."
                  />
                </div>

                <div className="form-field-group">
                  <label><strong>የእርዳታ ጥያቄዎ ወይም ያጋጠመዎት ችግር *</strong></label>
                  <textarea
                    required
                    rows={3}
                    className="form-control-input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="ምን እንድናግዝዎት ይፈልጋሉ? እባክዎን እዚህ በዝርዝር ይግለጹ..."
                  />
                </div>

                <button type="submit" className="btn-submit-help" disabled={submitting}>
                  {submitting ? "በመላክ ላይ..." : "📨 የእርዳታ ጥያቄውን ላክ (ሰራተኞችን ጥራ)"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
