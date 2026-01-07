import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import toast from "react-hot-toast";

interface Package {
  id: string;
  name: string;
  finalPrice?: number;
  price?: number;
  packageItems?: Array<{
    id: string;
    servicePrice?: {
      service?: { name: string };
      category?: { name: string };
      price?: number;
    };
  }>;
}

interface ServiceItem {
  id: string;
  servicePrice?: {
    service?: { name: string };
    category?: { name: string };
    price?: number;
  };
}

interface RecordPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  defaultAmount: number;
  onPay: (amount: number, method: 'cash' | 'online') => void;
  selectedPackages?: Package[];
  selectedServices?: ServiceItem[];
  totalCalculated?: number;
  customTotal?: number | null;
  onTotalChange?: (total: number | null) => void;
  isEditingTotal?: boolean;
  onEditTotal?: (editing: boolean) => void;
  paying?: boolean;
  showLineThrough?: boolean;
  pendingAmount?: number; // Maximum amount that can be paid
}

export default function RecordPaymentDialog({ 
  open, 
  onClose, 
  defaultAmount, 
  onPay,
  selectedPackages = [],
  selectedServices = [],
  totalCalculated = 0,
  customTotal = null,
  onTotalChange,
  isEditingTotal = false,
  onEditTotal,
  paying = false,
  showLineThrough = false,
  pendingAmount
}: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [method, setMethod] = useState<'cash' | 'online'>('cash');

  useEffect(() => { 
    const total = customTotal !== null ? customTotal : totalCalculated;
    setAmount(total || defaultAmount); 
  }, [defaultAmount, customTotal, totalCalculated, open]);

  const displayTotal = customTotal !== null ? customTotal : totalCalculated;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-[801px] max-h-[90vh] overflow-y-auto px-[99px] pt-[29px] pb-[55px] rounded-lg">
        <h2 className="text-4xl text-center mb-6">
          Record <span className="text-[#1D5287] font-bold">Payments</span>
        </h2>
        
        <div className="space-y-4 mb-6">
          {/* Packages */}
          {selectedPackages.map(pkg => (
            <div key={pkg.id} className="bg-[#E3F0D9] rounded-lg p-4 border border-[#ABD28C]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#1D5287] flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-lg">{pkg.name}</span>
                </div>
                <span className="text-[#1D5287] font-bold text-xl">₹{Number(pkg.finalPrice || pkg.price)}/-</span>
              </div>
              {pkg.packageItems && pkg.packageItems.length > 0 && (
                <div className="bg-white rounded-full px-4 py-2 text-xs text-[#1D5287] text-center font-medium mb-2">
                  {pkg.packageItems.map(item => item.servicePrice?.service?.name).filter(Boolean).join(' / ')}
                </div>
              )}
            </div>
          ))}
          
          {/* Standalone selected services */}
          {selectedServices.map(item => (
            <div key={item.id} className="bg-[#F0F4FA] rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1D5287] flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-base">{item.servicePrice?.service?.name}</span>
              </div>
              <span className="text-[#1D5287] font-bold text-lg">₹{Number(item.servicePrice?.price) || 0}/-</span>
            </div>
          ))}
          
        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Payment Method</label>
          <div className="flex gap-3">
            <div
              className={`flex-1 text-center py-4 px-4 rounded-lg cursor-pointer border-2 transition-all ${
                method === 'cash' 
                  ? 'bg-[#E3F0DA] border-[#75B640] font-bold shadow-md' 
                  : 'bg-gray-50 border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setMethod('cash')}
            >
              <div className="text-lg font-semibold">Cash</div>
            </div>
            <div
              className={`flex-1 text-center py-4 px-4 rounded-lg cursor-pointer border-2 transition-all ${
                method === 'online' 
                  ? 'bg-[#E3F0DA] border-[#75B640] font-bold shadow-md' 
                  : 'bg-gray-50 border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setMethod('online')}
            >
              <div className="text-lg font-semibold">Online</div>
            </div>
          </div>
        </div>
                  {/* Total sum */}
        <div className="flex items-center justify-between py-2">
            <span className="font-semibold text-lg">Total Payment</span>
            {isEditingTotal && onTotalChange ? (
              <input
                type="number"
                min={0}
                className="text-xl font-bold border rounded px-2 py-1 w-32 focus:outline-none focus:ring"
                value={customTotal !== null ? String(customTotal).replace(/^0+/, '') : String(totalCalculated).replace(/^0+/, '')}
                onChange={e => {
                  const val = e.target.value.replace(/^0+/, '');
                  onTotalChange(val === '' ? 0 : Number(val));
                }}
                onBlur={() => onEditTotal?.(false)}
                onKeyDown={e => {
                  if (e.key === 'Enter') onEditTotal?.(false);
                }}
                autoFocus
              />
            ) : (
              customTotal !== null && customTotal !== 0 && customTotal !== totalCalculated ? (
                <span className="text-xl font-bold flex items-center gap-5" title="Click to edit total payment">
                  {showLineThrough && (
                    <span className="text-lg text-red-400 line-through decoration-2">₹{totalCalculated}/-</span>
                  )}
                  <span className="text-xl text-[#1D5287] cursor-pointer font-bold hover:underline" onClick={() => onEditTotal?.(true)}>₹{customTotal}/-</span>
                </span>
              ) : (
                <span className="text-xl font-bold cursor-pointer hover:underline" title="Click to edit total payment" onClick={() => onEditTotal?.(true)}>
                  ₹{totalCalculated}/-
                </span>
              )
            )}
          </div>
        </div>

        {/* Pay Button */}
        <Button 
          className="w-full bg-gradient-to-r from-[#75B640] to-[#52813C] text-white font-semibold py-[18px] text-lg" 
          onClick={() => {
            const paymentAmount = customTotal !== null ? customTotal : totalCalculated;
            
            // Validate that payment doesn't exceed pending amount
            if (pendingAmount !== undefined) {
              if (pendingAmount === 0 && paymentAmount > 0) {
                toast.error('No pending amount. Payment cannot be recorded.');
                return;
              }
              if (pendingAmount > 0 && paymentAmount > pendingAmount) {
                toast.error(`Payment amount (₹${paymentAmount.toLocaleString()}) cannot exceed pending amount (₹${pendingAmount.toLocaleString()})`);
                return;
              }
            }
            
            onPay(paymentAmount, method);
          }}
          disabled={paying}
        >
          <span className="text-base font-semibold">
            {paying ? 'Processing Payment...' : 'PAY NOW'}
          </span>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
