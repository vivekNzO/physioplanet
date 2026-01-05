import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import PackageSkeleton from "@/skeletons/PackageSkeleton";
import { Check, Circle } from "lucide-react";
import toast from "react-hot-toast";

interface Service {
  id: string;
  name: string;
  servicePrices?: { id: string; price: number; category?: { name: string } }[];
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
  tenantId: string;
  customerId: string;
  appointmentId?: string | null;
  currency?: string;
}

export default function SellPlanDialog({ open, onClose, onSelect, tenantId, customerId, appointmentId, currency = "INR" }: SellPlanDialogProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [tab, setTab] = useState<"packages" | "services">("packages")
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [customTotal, setCustomTotal] = useState<number | null>(null);

  const selectedPackages = packages.filter(p => selectedPackageIds.includes(p.id));
  const packageServiceIds = selectedPackages.flatMap(pkg => (pkg.packageItems || []).map(item => item.id));
  const packageServicesTotal = packages
    .flatMap(pkg => pkg.packageItems || [])
    .filter(item => selectedServiceIds.includes(item.id) && !packageServiceIds.includes(item.id))
    .reduce((sum, item) => sum + (Number(item.servicePrice?.price) || 0), 0);

  const selectedStandaloneServiceObjs = [];
  services.forEach(service => {
    (service.servicePrices || []).forEach(price => {
      if (selectedServiceIds.includes(price.id)) {
        selectedStandaloneServiceObjs.push({
          id: price.id,
          servicePrice: { ...price, service: { name: service.name } },
        });
      }
    });
  });
  // Remove duplicates (in case a service is both in a package and selected standalone)
  const uniqueStandaloneServices = selectedStandaloneServiceObjs.filter(
    s => !packageServiceIds.includes(s.id)
  );
  const standaloneServicesTotal = uniqueStandaloneServices.reduce(
    (sum, item) => sum + (Number(item.servicePrice?.price) || 0), 0
  );

  const totalCalculated =
    selectedPackages.reduce((sum, pkg) => sum + Number(pkg.finalPrice || pkg.price || 0), 0) +
    packageServicesTotal +
    standaloneServicesTotal;
  useEffect(() => { setCustomTotal(null); setIsEditingTotal(false); }, [showPayment]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axiosInstance.get("/packages")
      .then(res => setPackages(res.data))
      .catch(err => {
        setPackages([]);
      })
      .finally(() => setLoading(false));
  }, [open]);

  // Fetch services when tab changes to 'services'
  useEffect(() => {
    if (tab !== 'services' || !open || servicesLoaded) return;
    setLoading(true);
    (async () => {
      try {
        const res = await axiosInstance.get('/services');
        if (res.data && res.data.success) {
          setServices(res.data.data);
          setServicesLoaded(true);
        } else {
          setServices([]);
        }
      } catch (error) {
        setServices([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [tab, open, servicesLoaded]);

  // Reset servicesLoaded when dialog closes
  useEffect(() => {
    if (!open) setServicesLoaded(false);
  }, [open]);


  // Toggle package selection
  const handlePackageToggle = (id: string) => {
    setSelectedPackageIds((prev) => {
      if (prev.includes(id)) {
        // Deselect package and all its services
        const pkg = packages.find(p => p.id === id);
        if (!pkg) return prev.filter((pid) => pid !== id);
        setSelectedServiceIds((sPrev) => sPrev.filter(sid => !(pkg.packageItems || []).some(item => item.id === sid)));
        return prev.filter((pid) => pid !== id);
      } else {
        const pkg = packages.find(p => p.id === id);
        if (!pkg) return [...prev, id];
        setSelectedServiceIds((sPrev) => [
          ...sPrev,
          ...((pkg.packageItems || []).map(item => item.id).filter(sid => !sPrev.includes(sid)))
        ]);
        return [...prev, id];
      }
    });
  };

  // Toggle service selection (independent)
  const handleServiceToggle = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleConfirmSelection = () => {
    setShowPayment(true);
  };

  const handlePaymentNow = async () => {
    // Collect selected items for purchase
    const items = [];
    // Add selected packages (only package IDs)
    selectedPackages.forEach(pkg => {
      items.push({ itemId: pkg.id, type: 'PACKAGE' });
    });
    // Add only standalone services (not part of selected packages)
    uniqueStandaloneServices.forEach(item => {
      items.push({ itemId: item.id, type: 'SERVICE' });
    });

    try {
      const res = await axiosInstance.post('/purchase', {
        tenantId,
        customerId,
        amount: customTotal !== null ? customTotal : totalCalculated,
        currency,
        appointmentId,
        items
      });
      if (res.data && res.data.success) {
        toast.success('Payment recorded successfully');
        if (typeof onClose === 'function') onClose();
      } else {
        // Optionally show error message
      }
    } catch (error) {
      // Optionally show error message
    }
  };

  // All selected packages (already declared above for summary logic)

  // For packages tab
  const leftColumn = packages.filter((_, index) => index % 2 === 0);
  const rightColumn = packages.filter((_, index) => index % 2 === 1);

  // For services tab: group fetched services by category
  let servicesByCategory: { [category: string]: any[] } = {};
  if (tab === "services") {
    services.forEach(service => {
      (service.servicePrices || []).forEach(price => {
        const category = price.category?.name || "Uncategorized";
        if (!servicesByCategory[category]) servicesByCategory[category] = [];
        servicesByCategory[category].push({
          id: price.id,
          servicePrice: { ...price, service: { name: service.name } },
        });
      });
    });
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        // Reset all dialog state when closed
        setShowPayment(false);
        setSelectedPackageIds([]);
        setSelectedServiceIds([]);
        setCustomTotal(null);
        setIsEditingTotal(false);
        setTab("packages");
      }
      onClose();
    }}>
      <DialogContent className="max-w-[801px] max-h-[90vh] overflow-y-auto px-[99px] pt-[29px] pb-[55px] rounded-lg">
        {!showPayment ? (
          <>
            <h2 className="text-4xl text-center mb-6">
              Package <span className="text-[#1D5287] font-bold">Details</span>
            </h2>
            <div className="flex justify-center gap-2 mb-6">
              {["packages", "services"].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t as any)}
                  className={`px-6 py-2 font-semibold border-b-2 ${
                    tab === t
                      ? "border-[#1D5287] text-[#1D5287]"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="text-center py-8"><PackageSkeleton /></div>
            ) : tab === "packages" ? (
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
                      className={`rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${selectedPackageIds.includes(pkg.id) ? 'bg-[#E3F0D9]' : 'bg-[#F8F8F8]'}`}
                    >
                      <div 
                        className="flex items-center justify-between p-4"
                        onClick={() => handlePackageToggle(pkg.id)}
                      >
                        <div className="flex items-center gap-3">
                          {selectedPackageIds.includes(pkg.id) ? (
                            <div className="w-6 h-6 rounded-full bg-[#1D5287] flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                          )}
                          <div>
                            <div className="text-base text-[#101111] font-medium">{index * 2 + 1}. {pkg.name}</div>
                          </div>
                        </div>
                        <div className="text-[#1D5287] text-nowrap font-bold text-base">₹{pkg.finalPrice || pkg.price}</div>
                      </div>
                      {pkg.packageItems && pkg.packageItems.length > 0 && (
                        <div className="bg-white space-y-2 pt-2 max-h-[240px] overflow-y-auto px-2 pb-2">
                          {pkg.packageItems.map(item => (
                            <div
                              key={item.id}
                              className={`border rounded-md p-2.5 text-sm flex items-center gap-2 cursor-pointer ${selectedServiceIds.includes(item.id) ? 'bg-[#E3F0D9] border-[#ABD28C]' : 'bg-gray-100 border-gray-300'}`}
                              onClick={e => { e.stopPropagation(); handleServiceToggle(item.id); }}
                            >
                              {selectedServiceIds.includes(item.id) ? (
                                <div className="w-4 h-4 rounded-full bg-[#1D5287] flex items-center justify-center flex-shrink-0 border border-[#ABD28C]">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              <div className="flex w-full justify-between">
                              <div className="flex flex-col">
                              <span className="font-medium text-gray-800">{item.servicePrice?.service?.name || '-'}</span>
                              {item.servicePrice?.category?.name && (
                                <span className="text-xs text-gray-500 ml-1">[{item.servicePrice.category.name}]</span>
                              )}
                              </div>
                              {item.servicePrice?.price && (
                                <span className="text-xs text-[#1D5287] font-semibold whitespace-nowrap flex-shrink-0">₹{item.servicePrice.price}</span>
                              )}
                              </div>        
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
                      className={`rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${selectedPackageIds.includes(pkg.id) ? 'bg-[#E3F0D9]' : 'bg-[#F8F8F8]'}`}
                    >
                      <div 
                        className="flex items-center justify-between p-4"
                        onClick={() => handlePackageToggle(pkg.id)}
                      >
                        <div className="flex items-center gap-3">
                          {selectedPackageIds.includes(pkg.id) ? (
                            <div className="w-6 h-6 rounded-full bg-[#1D5287] flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                          )}
                          <div>
                            <div className="text-base text-[#101111] font-medium">{index * 2 + 2}. {pkg.name}</div>
                          </div>
                        </div>
                        <div className="text-[#1D5287] font-bold text-base whitespace-nowrap">₹{pkg.finalPrice || pkg.price}</div>
                      </div>
                      {pkg.packageItems && pkg.packageItems.length > 0 && (
                        <div className="bg-white space-y-2 pt-2 max-h-[240px] overflow-y-auto px-2 pb-2">
                          {pkg.packageItems.map(item => (
                            <div
                              key={item.id}
                              className={`border rounded-md p-2.5 text-sm flex items-center gap-2 cursor-pointer ${selectedServiceIds.includes(item.id) ? 'bg-[#E3F0D9] border-[#ABD28C]' : 'bg-gray-100 border-gray-300'}`}
                              onClick={e => { e.stopPropagation(); handleServiceToggle(item.id); }}
                            >
                              {selectedServiceIds.includes(item.id) ? (
                                <div className="w-4 h-4 rounded-full bg-[#1D5287] flex items-center justify-center flex-shrink-0 border border-[#ABD28C]">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              <div className="flex w-full justify-between">
                              <div className="flex flex-col">
                              <span className="font-medium text-gray-800">{item.servicePrice?.service?.name || '-'}</span>
                              {item.servicePrice?.category?.name && (
                                <span className="text-xs text-gray-500 ml-1">[{item.servicePrice.category.name}]</span>
                              )}
                              </div>
                              {item.servicePrice?.price && (
                                <span className="text-xs text-[#1D5287] font-semibold whitespace-nowrap flex-shrink-0">₹{item.servicePrice.price}</span>
                              )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 mb-6" style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {Object.entries(servicesByCategory).map(([category, items]) => (
                  <div key={category}>
                    <div className="font-semibold text-[#1D5287] text-lg mb-2">{category}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map(item => (
                        <div
                          key={item.id}
                          className={`border rounded-md p-2.5 text-sm flex items-center gap-2 cursor-pointer ${selectedServiceIds.includes(item.id) ? 'bg-[#E3F0D9] border-[#ABD28C]' : 'bg-gray-100 border-gray-300'}`}
                          onClick={e => { e.stopPropagation(); handleServiceToggle(item.id); }}
                        >
                          {selectedServiceIds.includes(item.id) ? (
                            <div className="w-4 h-4 rounded-full bg-[#1D5287] flex items-center justify-center flex-shrink-0 border border-[#ABD28C]">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                          <div className="flex w-full justify-between">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">{item.servicePrice?.service?.name || '-'}</span>
                              {item.servicePrice?.category?.name && (
                                <span className="text-xs text-gray-500 ml-1">[{item.servicePrice.category.name}]</span>
                              )}
                            </div>
                            {item.servicePrice?.price && (
                              <span className="text-xs text-[#1D5287] font-semibold whitespace-nowrap flex-shrink-0">₹{item.servicePrice.price}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button disabled={selectedPackageIds.length === 0 && selectedServiceIds.length === 0} onClick={handleConfirmSelection} className="bg-[#1D5287] text-white">Select Plan</Button>
            </div>
          </>
      ) : (
        <>
          <h2 className="text-4xl text-center mb-6">
            Record <span className="text-[#1D5287] font-bold">Payments</span>
          </h2>
          <div className="space-y-4">
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
                <div className="text-center text-xs font-medium mt-2">ONE TIME PAYMENT</div>
              </div>
            ))}
            {/* Standalone selected services (not part of selected packages, from both packages and services tab) */}
            {[
              // Old logic: services from packages
              ...packages
                .flatMap(pkg => pkg.packageItems || [])
                .filter(item => selectedServiceIds.includes(item.id) && !packageServiceIds.includes(item.id)),
              // New logic: services from services tab (API)
              ...uniqueStandaloneServices
            ].map(item => (
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
            {/* Total sum */}
            <div className="flex items-center justify-between py-2">
              <span className="font-semibold text-lg">Total Payment</span>
              {isEditingTotal ? (
                <input
                  type="number"
                  min={0}
                  className="text-xl font-bold border rounded px-2 py-1 w-32 focus:outline-none focus:ring"
                  value={customTotal !== null ? String(customTotal).replace(/^0+/, '') : String(totalCalculated).replace(/^0+/, '')}
                  onChange={e => {
                    const val = e.target.value.replace(/^0+/, '');
                    setCustomTotal(val === '' ? 0 : Number(val));
                  }}
                  onBlur={() => setIsEditingTotal(false)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') setIsEditingTotal(false);
                  }}
                  autoFocus
                />
              ) : (
                customTotal !== null && customTotal !== totalCalculated ? (
                  <span className="text-xl font-bold flex items-center gap-5" title="Click to edit total payment" >
                    <span className="text-lg text-red-400 line-through decoration-2">₹{totalCalculated}/-</span>
                    <span className="text-xl text-[#1D5287] cursor-pointer font-bold hover:underline" onClick={() => setIsEditingTotal(true)}>₹{customTotal}/-</span>
                  </span>
                ) : (
                  <span className="text-xl font-bold cursor-pointer hover:underline" title="Click to edit total payment" onClick={() => setIsEditingTotal(true)}>
                    ₹{totalCalculated}/-
                  </span>
                )
              )}
            </div>
            <Button 
              onClick={handlePaymentNow}
              className="w-full bg-gradient-to-r from-[#75B640] to-[#52813C] text-white font-semibold py-6 text-lg"
            >
              PAYMENT NOW
            </Button>
          </div>
        </>
      )}
      </DialogContent>
    </Dialog>
  );
}
