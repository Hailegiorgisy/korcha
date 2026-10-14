import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, Smartphone, Building2 } from 'lucide-react';

interface PaymentQRCodeProps {
  amountEtb: number;
  orderNumber: string;
  defaultMethod?: 'telebirr' | 'cbe_birr';
}

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  amountEtb,
  orderNumber,
  defaultMethod = 'telebirr',
}) => {
  const [method, setMethod] = useState<'telebirr' | 'cbe_birr'>(defaultMethod);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const telebirrPhone = '+251911234567';
  const cbeAccount = '1000123456789';
  const receiverName = 'Korcha Logistics (ኮርቻ ሎጂስቲክስ)';

  useEffect(() => {
    generateQR();
  }, [method, amountEtb, orderNumber]);

  const generateQR = async () => {
    try {
      // Telebirr / CBE payment payload
      const payload =
        method === 'telebirr'
          ? `telebirr://pay?phone=${telebirrPhone}&amount=${amountEtb}&order=${orderNumber}&receiver=${encodeURIComponent(receiverName)}`
          : `cbebirr://pay?account=${cbeAccount}&amount=${amountEtb}&order=${orderNumber}&receiver=${encodeURIComponent(receiverName)}`;

      const url = await QRCode.toDataURL(payload, {
        width: 260,
        margin: 2,
        color: {
          dark: method === 'telebirr' ? '#047857' : '#6b21a8', // emerald for telebirr, purple for CBE
          light: '#ffffff',
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `Korcha-${method}-${orderNumber}.png`;
    link.click();
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center space-y-4">
      {/* Method Tabs */}
      <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 w-full max-w-xs">
        <button
          type="button"
          onClick={() => setMethod('telebirr')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            method === 'telebirr'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>ቴሌብር (Telebirr)</span>
        </button>

        <button
          type="button"
          onClick={() => setMethod('cbe_birr')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            method === 'cbe_birr'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>CBE Birr</span>
        </button>
      </div>

      {/* QR Code Canvas */}
      <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-slate-800 relative group">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`${method} QR Code`}
            className="w-48 h-48 object-contain"
          />
        ) : (
          <div className="w-48 h-48 bg-slate-200 animate-pulse rounded-lg" />
        )}

        <div className="mt-1 text-[11px] font-bold text-slate-800 tracking-wide uppercase">
          {method === 'telebirr' ? '📱 Scan with Telebirr App' : '🏛️ Scan with CBE Mobile'}
        </div>
      </div>

      {/* Amount and Account Details */}
      <div className="w-full space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">የሚከፈል ቅድመ ክፍያ:</span>
          <span className="font-black text-amber-400 text-sm">
            {amountEtb.toLocaleString()} ብር
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {method === 'telebirr' ? 'የቴሌብር ስልክ ቁጥር:' : 'የንግድ ባንክ ሂሳብ ቁጥር:'}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white">
              {method === 'telebirr' ? telebirrPhone : cbeAccount}
            </span>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  method === 'telebirr' ? telebirrPhone : cbeAccount,
                  'account'
                )
              }
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copy"
            >
              {copiedText === 'account' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          ተቀባይ: <b className="text-slate-200">{receiverName}</b>
        </div>
      </div>

      {/* Download QR Button */}
      <button
        type="button"
        onClick={downloadQR}
        className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>የ QR ኮዱን አስቀምጥ (Save QR)</span>
      </button>
    </div>
  );
};
