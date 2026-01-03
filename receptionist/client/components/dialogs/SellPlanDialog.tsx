import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import PackageSkeleton from "@/skeletons/PackageSkeleton";
import { Check, Circle } from "lucide-react";

interface Service {
  id: string;
  name: string;
  servicePrices?: { price: number; category?: { name: string } }[];
}

interface PackageItem {
  id: string;
  servicePrice?: { service?: { name: string }; category?: { name: string }; price?: number };
}

interface Package {
  id: string;
  name: string;
  finalPrice?: number;
  price?: number;
  packageItems?: PackageItem[];
}

interface SellPlanDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (pkg: Package) => void;
}

export default function SellPlanDialog({ open, onClose, onSelect }: SellPlanDialogProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axiosInstance.get("/packages")
      .then(res => setPackages(res.data))
      .catch(err => {
        console.error("Failed to fetch packages:", err);
        setPackages([]);
      })
      .finally(() => setLoading(false));
  }, [open]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleConfirmSelection = () => {
    setShowPayment(true);
  };

  const handlePaymentNow = () => {
    const pkg = packages.find(p => p.id === selectedId);
    if (pkg) onSelect(pkg);
    onClose();
  };

  const selectedPackage = packages.find(p => p.id === selectedId);

  const leftColumn = packages.filter((_, index) => index % 2 === 0);
  const rightColumn = packages.filter((_, index) => index % 2 === 1);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        // Reset state when dialog closes
        setShowPayment(false);
        setSelectedId(null);
      }
      onClose();
    }}>
      <DialogContent className="max-w-[801px] max-h-[90vh] overflow-y-auto px-[99px] pt-[29px] pb-[55px] rounded-lg">
        {!showPayment ? (
          <>
            <h2 className="text-4xl text-center mb-6">
              Package <span className="text-[#1D5287] font-bold">Details</span>
            </h2>
            {loading ? (
              <div className="text-center py-8"><PackageSkeleton /></div>
            ) : (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 [&::-webkit-scrollbar]:hidden"
                style={{
                  maxHeight: '500px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-4">
              {leftColumn.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedId === pkg.id ? 'bg-[#E3F0D9]' : 'bg-[#F8F8F8]'
                  }`}
                  onClick={() => handleSelect(pkg.id)}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {selectedId === pkg.id ? (
                        <div className="w-6 h-6 rounded-full bg-[#1D5287] flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="text-base  text-[#101111] font-medium">{index * 2 + 1}. {pkg.name}</div>
                      </div>
                    </div>
                    <div className="text-[#1D5287] text-nowrap font-bold text-base">₹{pkg.finalPrice || pkg.price}</div>
                  </div>
                  {pkg.packageItems && pkg.packageItems.length > 0 && (
                    <div className="bg-white space-y-2 pt-2 max-h-[240px] overflow-y-auto px-2 pb-2">
                      {pkg.packageItems.map(item => (
                        <div
                          key={item.id}
                          className={`border rounded-md p-2.5 text-sm ${
                            selectedId === pkg.id 
                              ? 'bg-[#E3F0D9] border-[#ABD28C]' 
                              : 'bg-gray-100 border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-800">
                              {item.servicePrice?.service?.name || '-'}
                            </span>
                            {item.servicePrice?.price && (
                              <span className="text-xs text-[#1D5287] font-semibold whitespace-nowrap flex-shrink-0">
                                ₹{item.servicePrice.price}
                              </span>
                            )}
                          </div>
                          {item.servicePrice?.category?.name && (
                            <span className="text-xs text-gray-500 mt-0.5 block">
                              [{item.servicePrice.category.name}]
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-4">
              {rightColumn.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedId === pkg.id ? 'bg-[#E3F0D9]' : 'bg-[#F8F8F8]'
                  }`}
                  onClick={() => handleSelect(pkg.id)}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {selectedId === pkg.id ? (
                        <div className="w-6 h-6 rounded-full bg-[#1D5287] flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="text-base  text-[#101111] font-medium">{index * 2 + 2}. {pkg.name}</div>
                      </div>
                    </div>
                    <div className="text-[#1D5287] font-bold text-base whitespace-nowrap">₹{pkg.finalPrice || pkg.price}</div>
                  </div>
                  {pkg.packageItems && pkg.packageItems.length > 0 && (
                    <div className="bg-white space-y-2 pt-2 max-h-[240px] overflow-y-auto px-2 pb-2">
                      {pkg.packageItems.map(item => (
                        <div
                          key={item.id}
                          className={`border rounded-md p-2.5 text-sm ${
                            selectedId === pkg.id 
                              ? 'bg-[#E3F0D9] border-[#ABD28C]' 
                              : 'bg-gray-100 border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-800">
                              {item.servicePrice?.service?.name || '-'}
                            </span>
                            {item.servicePrice?.price && (
                              <span className="text-xs text-[#1D5287] font-semibold whitespace-nowrap flex-shrink-0">
                                ₹{item.servicePrice.price}
                              </span>
                            )}
                          </div>
                          {item.servicePrice?.category?.name && (
                            <span className="text-xs text-gray-500 mt-0.5 block">
                              [{item.servicePrice.category.name}]
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!selectedId} onClick={handleConfirmSelection} className="bg-[#1D5287] text-white">Select Plan</Button>
        </div>
          </>
        ) : (
          <>
            <h2 className="text-4xl text-center mb-6">
              Record <span className="text-[#1D5287] font-bold">Payments</span>
            </h2>
            {selectedPackage && (
              <div className="space-y-4">
                <div className="bg-[#E3F0D9] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#1D5287] flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-base">{selectedPackage.name}</span>
                    </div>
                    <span className="text-[#1D5287] font-bold text-lg">₹{selectedPackage.finalPrice || selectedPackage.price}/-</span>
                  </div>
                  
                  {selectedPackage.packageItems && selectedPackage.packageItems.length > 0 && (
                    <div className="bg-white rounded-2xl p-0 text-[10px]">
                      <div className="text-[#1D5287] text-center mb-1">
                        {selectedPackage.packageItems.map(item => item.servicePrice?.service?.name).filter(Boolean).join(' / ')}
                      </div>
                    </div>
                  )}
                  <div className="text-center text-xs font-medium mt-[14px]">ONE TIME PAYMENT</div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="font-semibold text-lg">Total Payment</span>
                  <span className="text-xl font-bold">₹{selectedPackage.finalPrice || selectedPackage.price}/-</span>
                </div>

                <Button 
                  onClick={handlePaymentNow} 
                  className="w-full bg-gradient-to-r from-[#75B640] to-[#52813C] text-white font-semibold py-6 text-lg"
                >
                  PAYMENT NOW
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
