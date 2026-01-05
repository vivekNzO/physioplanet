import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import axiosInstance from "@/lib/axios"
import PackageSkeleton from "@/skeletons/PackageSkeleton"
import { Check, Circle } from "lucide-react"

/* =======================
   Types
======================= */

interface Service {
  id: string
  name: string
  price: number
  category?: { name: string }
}

interface PackageItem {
  id: string
  servicePrice?: {
    service?: { name: string }
    category?: { name: string }
    price?: number
  }
}

interface Package {
  id: string
  name: string
  finalPrice?: number
  price?: number
  packageItems?: PackageItem[]
}

interface SellPlanDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (data: {
    packages: Package[]
    serviceIds: string[]
    total: number
  }) => void
}

/* =======================
   Services Tab
======================= */

function ServicesTabContent({
  services,
  selectedServiceIds,
  onToggle,
}: {
  services: Service[]
  selectedServiceIds: string[]
  onToggle: (id: string) => void
}) {
  if (!services.length) {
    return (
      <div className="col-span-2 text-center text-gray-400">
        No services found
      </div>
    )
  }

  const grouped = services.reduce<Record<string, Service[]>>((acc, svc) => {
    const cat = svc.category?.name || "Uncategorized"
    acc[cat] = acc[cat] || []
    acc[cat].push(svc)
    return acc
  }, {})

  const entries = Object.entries(grouped)
  const left = entries.filter((_, i) => i % 2 === 0)
  const right = entries.filter((_, i) => i % 2 === 1)

  const renderColumn = (col: typeof entries) => (
    <div className="flex flex-col gap-4">
      {col.map(([cat, svcs]) => (
        <div key={cat} className="rounded-lg bg-[#F8F8F8] overflow-hidden">
          <div className="p-4 font-semibold text-[#1D5287] bg-gray-100">
            {cat}
          </div>
          <div className="space-y-2 p-2 max-h-[240px] overflow-y-auto">
            {svcs.map(svc => (
              <div
                key={svc.id}
                onClick={() => onToggle(svc.id)}
                className={`border rounded-md p-2 flex justify-between items-center cursor-pointer ${
                  selectedServiceIds.includes(svc.id)
                    ? "bg-[#E3F0D9] border-[#ABD28C]"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedServiceIds.includes(svc.id) ? (
                    <div className="w-4 h-4 rounded-full bg-[#1D5287] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm">{svc.name}</span>
                </div>
                <span className="text-xs font-semibold text-[#1D5287]">
                  ₹{svc.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      {renderColumn(left)}
      {renderColumn(right)}
    </>
  )
}

/* =======================
   Main Dialog
======================= */

export default function SellPlanDialog({
  open,
  onClose,
  onSelect,
}: SellPlanDialogProps) {
  const [tab, setTab] = useState<"packages" | "services">("packages")
  const [packages, setPackages] = useState<Package[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [customTotal, setCustomTotal] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)

    Promise.all([
      axiosInstance.get("/packages"),
      axiosInstance.get("/services"),
    ])
      .then(([pkgRes, svcRes]) => {
        setPackages(pkgRes.data || [])
        setServices((svcRes.data && svcRes.data.data) ? svcRes.data.data : [])
      })
      .finally(() => setLoading(false))
  }, [open])

  const selectedPackages = packages.filter(p =>
    selectedPackageIds.includes(p.id)
  )

  const totalCalculated =
    selectedPackages.reduce(
      (sum, p) => sum + Number(p.finalPrice || p.price || 0),
      0
    ) +
    services
      .filter(s => selectedServiceIds.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0)

  const total = customTotal ?? totalCalculated

  const handlePackageToggle = (id: string) => {
    setSelectedPackageIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  const handleServiceToggle = (id: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[820px] max-h-[90vh] overflow-y-auto p-6">
        {!showPayment ? (
          <>
            <h2 className="text-3xl text-center mb-6">
              Package <span className="text-[#1D5287] font-bold">Details</span>
            </h2>

            {/* Tabs */}
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
              <PackageSkeleton />
            ) : tab === "packages" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[0, 1].map(col => (
                  <div key={col} className="flex flex-col gap-4">
                    {packages
                      .filter((_, i) => i % 2 === col)
                      .map((pkg, index) => (
                        <div
                          key={pkg.id}
                          onClick={() => handlePackageToggle(pkg.id)}
                          className={`rounded-lg cursor-pointer ${
                            selectedPackageIds.includes(pkg.id)
                              ? "bg-[#E3F0D9]"
                              : "bg-[#F8F8F8]"
                          }`}
                        >
                          <div className="flex justify-between p-4">
                            <div className="flex items-center gap-2">
                              {selectedPackageIds.includes(pkg.id) ? (
                                <Check className="w-5 h-5 text-[#1D5287]" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                              <span>{pkg.name}</span>
                            </div>
                            <span className="font-bold text-[#1D5287]">
                              ₹{pkg.finalPrice || pkg.price}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Group services by category, two columns, always expanded */}
                {(() => {
                  if (!services.length) return <div className="col-span-2 text-center text-gray-400">No services found</div>;
                  // Group by category name
                  const grouped = services.reduce((acc, svc) => {
                    const cat = svc.category?.name || 'Uncategorized';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(svc);
                    return acc;
                  }, {} as Record<string, Service[]>);
                  const groupedArr = Object.entries(grouped);
                  // Split into two columns
                  const left = groupedArr.filter((_, i) => i % 2 === 0);
                  const right = groupedArr.filter((_, i) => i % 2 === 1);
                  const renderColumn = (col: typeof groupedArr) => (
                    <div className="flex flex-col gap-4">
                      {col.map(([cat, svcs], catIdx) => (
                        <div key={cat} className="rounded-lg overflow-hidden bg-[#F8F8F8]">
                          <div className="p-4 font-semibold text-[#1D5287] bg-gray-100">{cat}</div>
                          <div className="bg-white space-y-2 pt-2 max-h-[240px] overflow-y-auto px-2 pb-2">
                            {svcs.map((svc, svcIdx) => (
                              <div
                                key={svc.id}
                                className={`border rounded-md p-2.5 text-sm flex items-center gap-2 cursor-pointer transition-all duration-200 ${selectedServiceIds.includes(svc.id) ? 'bg-[#E3F0D9] border-[#ABD28C]' : 'bg-gray-100 border-gray-300'}`}
                                onClick={() => handleServiceToggle(svc.id)}
                              >
                                {selectedServiceIds.includes(svc.id) ? (
                                  <div className="w-4 h-4 rounded-full bg-[#1D5287] flex items-center justify-center flex-shrink-0 border border-[#ABD28C]">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                                <div className="flex flex-col flex-1">
                                  <span className="font-medium text-gray-800">{svc.name}</span>
                                </div>
                                <span className="text-xs text-[#1D5287] font-semibold whitespace-nowrap flex-shrink-0">₹{svc.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                  return <>
                    {renderColumn(left)}
                    {renderColumn(right)}
                  </>;
                })()}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                disabled={
                  !selectedPackageIds.length && !selectedServiceIds.length
                }
                onClick={() => setShowPayment(true)}
                className="bg-[#1D5287] text-white"
              >
                Continue
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl text-center mb-6">
              Record <span className="text-[#1D5287] font-bold">Payment</span>
            </h2>

            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total</span>
              <input
                type="number"
                className="border px-2 py-1 w-32 text-right font-bold"
                value={total}
                onChange={e => setCustomTotal(Number(e.target.value))}
              />
            </div>

            <Button
              className="w-full bg-gradient-to-r from-[#75B640] to-[#52813C] text-white py-6 text-lg"
              onClick={() =>
                onSelect({
                  packages: selectedPackages,
                  serviceIds: selectedServiceIds,
                  total,
                })
              }
            >
              PAYMENT NOW
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
