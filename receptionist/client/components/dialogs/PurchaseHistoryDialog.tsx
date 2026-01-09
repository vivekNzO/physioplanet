import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PurchaseHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  customerId: string;
}

export default function PurchaseHistoryDialog({ open, onClose, customerId }: PurchaseHistoryDialogProps) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !customerId) return;
    setLoading(true);
    axiosInstance.get(`/purchase?customerId=${customerId}`)
      .then(res => setPurchases(res.data.data || []))
      .finally(() => setLoading(false));
  }, [open, customerId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-[1023px]:max-w-[672px]">
        <h2 className="text-2xl mb-4">Purchase <span className="font-bold text-[#1D5287]">History</span></h2>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
          </div>
        ) : purchases.length === 0 ? (
          <div>No purchases found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Items</th>
                </tr>
              </thead>
              <tbody>
                {purchases
                  .sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                  })
                  .map(purchase => (
                  <tr key={purchase.id}>
                    <td className="py-2">{new Date(purchase.createdAt).toLocaleString()}</td>
                    <td className="py-2 font-semibold">₹{purchase.amount}</td>
                    <td className="py-2">
                      {purchase.details?.map((item: any) => (
                        <div key={item.id} style={{ marginBottom: 4 }}>
                          {item.type === "PACKAGE" ? "Package" : "Service"}: {item.itemName}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Button onClick={onClose} className="mt-4 bg-gradient-to-r from-[#75B640] to-[#52813C] text-white">Close</Button>
      </DialogContent>
    </Dialog>
  );
}
