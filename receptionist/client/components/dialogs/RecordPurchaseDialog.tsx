import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

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

interface RecordPurchaseDialogProps {
  open: boolean;
  onClose: () => void;
  defaultAmount: number;
  onPay: (amount: number, method: 'cash' | 'online', isPartial?: boolean) => void;
  selectedPackages?: Package[];
  selectedServices?: ServiceItem[];
  totalCalculated?: number;
  customTotal?: number | null;
  onTotalChange?: (total: number | null) => void;
  isEditingTotal?: boolean;
  onEditTotal?: (editing: boolean) => void;
  paying?: boolean;
  showLineThrough?: boolean;
  onRemovePackage?: (packageId: string) => void;
  onRemoveService?: (serviceId: string) => void;
}

export default function RecordPurchaseDialog({ 
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
  onRemovePackage,
  onRemoveService
}: RecordPurchaseDialogProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [method, setMethod] = useState<'cash' | 'online'>('cash');
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => { 
    const total = customTotal !== null ? customTotal : totalCalculated;
    setAmount(total || defaultAmount);
    // Reset payment input state when dialog opens
    if (open) {
      setShowPaymentInput(false);
      setPaymentAmount(null);
      setIsEditingPayment(false);
      setShowConfirmDialog(false);
    }
  }, [defaultAmount, customTotal, totalCalculated, open]);

  // Close dialog and return to sell plan dialog when all items are removed
  useEffect(() => {
    if (open && selectedPackages.length === 0 && selectedServices.length === 0) {
      onClose();
    }
  }, [selectedPackages.length, selectedServices.length, open, onClose]);

  // Close confirmation dialog when main dialog closes
  useEffect(() => {
    if (!open) {
      setShowConfirmDialog(false);
    }
  }, [open]);

  const displayTotal = customTotal !== null ? customTotal : totalCalculated;

  const totalToUse = displayTotal || defaultAmount;

  const handlePayNow = () => {
    // Show payment input field with default value as total
    setShowPaymentInput(true);
    setPaymentAmount(totalToUse);
    setIsEditingPayment(false);
  };

  const handlePay = () => {
    const finalPaymentAmount = paymentAmount ?? totalToUse;
    const isPartial = finalPaymentAmount < totalToUse;

    if (
      !finalPaymentAmount ||
      Number.isNaN(finalPaymentAmount) ||
      finalPaymentAmount <= 0 ||
      finalPaymentAmount > totalToUse
    ) {
      alert('Payment amount must be greater than 0 and not exceed the total amount.');
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmPayment = () => {
    const finalPaymentAmount = paymentAmount ?? totalToUse;
    const isPartial = finalPaymentAmount < totalToUse;
    
    // Close confirmation dialog immediately
    setShowConfirmDialog(false);
    
    // Process payment - parent will handle closing the main dialog on success
    onPay(finalPaymentAmount, method, isPartial);
  };

  const handleCancelConfirmation = () => {
    // Just close confirmation dialog, stay on payment screen
    setShowConfirmDialog(false);
  };

  const finalPaymentAmount = paymentAmount ?? totalToUse;

  return (
    <>
      <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
        <DialogContent className="max-w-[801px] max-h-[90vh] overflow-y-auto px-[99px] pt-[29px] pb-[55px] rounded-lg">
        <h2 className="text-4xl text-center mb-6">
          Record <span className="text-[#1D5287] font-bold">Payments</span>
        </h2>
        
        <div className="space-y-4 mb-6">
          {/* Packages */}
          {selectedPackages.map(pkg => (
            <div key={pkg.id} className="bg-[#E3F0D9] rounded-lg p-4 border border-[#ABD28C] relative">
              {onRemovePackage && (
                <button
                  onClick={() => onRemovePackage(pkg.id)}
                  className="absolute top-[-5px] right-[-5px] w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                  disabled={paying}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
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
              {/* <div className="text-center text-xs font-medium mt-2">ONE TIME PAYMENT</div> */}
            </div>
          ))}
          
          {/* Standalone selected services */}
          {selectedServices.map(item => (
            <div key={item.id} className="bg-[#F0F4FA] rounded-lg p-4 flex items-center justify-between relative">
              {onRemoveService && (
                <button
                  onClick={() => onRemoveService(item.id)}
                  className="absolute top-[-5px] right-[-5px] w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                  disabled={paying}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
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

        {/* Payment Actions */}
        {!showPaymentInput ? (
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 font-semibold py-[18px] text-lg"
              onClick={onClose}
              disabled={paying}
            >
              <span className="text-base font-semibold">Back</span>
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-[#75B640] to-[#52813C] text-white font-semibold py-[18px] text-lg" 
              onClick={handlePayNow}
              disabled={paying}
            >
              <span className="text-base font-semibold">
                {paying ? 'Processing Payment...' : 'PAY NOW'}
              </span>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-2 mt-[-20px]">
              <span className="font-semibold text-lg">Record Payment</span>
              {isEditingPayment ? (
                <input
                  type="number"
                  min={0}
                  max={totalToUse}
                  className="text-xl font-bold border rounded px-2 py-1 w-32 focus:outline-none focus:ring"
                  value={paymentAmount !== null ? String(paymentAmount).replace(/^0+/, '') : String(totalToUse).replace(/^0+/, '')}
                  onChange={e => {
                    const val = e.target.value.replace(/^0+/, '');
                    setPaymentAmount(val === '' ? 0 : Number(val));
                  }}
                  onBlur={() => setIsEditingPayment(false)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') setIsEditingPayment(false);
                  }}
                  autoFocus
                />
              ) : (
                <span
                  className="text-xl font-bold cursor-pointer hover:underline"
                  title="Click to edit payment amount"
                  onClick={() => setIsEditingPayment(true)}
                >
                  ₹{paymentAmount ?? totalToUse}/-
                </span>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 font-semibold py-[18px] text-lg"
                onClick={() => {
                  setShowPaymentInput(false);
                  setPaymentAmount(null);
                }}
                disabled={paying}
              >
                <span className="text-base font-semibold">Back</span>
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#75B640] to-[#52813C] text-white font-semibold py-[18px] text-lg"
                onClick={handlePay}
                disabled={paying}
              >
                <span className="text-base font-semibold">
                  {paying ? 'Processing...' : 'PAY'}
                </span>
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>

    {/* Confirmation Dialog */}
    <Dialog 
      open={showConfirmDialog && open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setShowConfirmDialog(false);
        }
      }}
    >
      <DialogContent className="max-w-[500px] px-8 pt-8 pb-8 rounded-lg">
        <h3 className="text-2xl font-semibold text-center mb-4">
          Confirm Payment
        </h3>
        <p className="text-center text-gray-700 mb-6">
          Are you sure you want to record a payment of{" "}
          <span className="font-bold text-[#1D5287]">
            ₹{finalPaymentAmount.toLocaleString('en-IN')}
          </span>
          ?
        </p>
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 font-semibold py-3"
            onClick={handleCancelConfirmation}
            disabled={paying}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-[#75B640] to-[#52813C] text-white font-semibold py-3"
            onClick={handleConfirmPayment}
            disabled={paying}
          >
            {paying ? 'Processing...' : 'Yes, Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

