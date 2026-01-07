import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  customerId: string;
}

export default function PaymentHistoryDialog({ open, onClose, customerId }: PaymentHistoryDialogProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !customerId) return;
    setLoading(true);
    // Fetch all payments for this customer
    axiosInstance.get(`/payments?customerId=${customerId}`)
      .then(res => setPayments(res.data.data || []))
      .catch(err => {
        console.error("Error fetching payments:", err);
        setPayments([]);
      })
      .finally(() => setLoading(false));
  }, [open, customerId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <h2 className="text-2xl mb-4">Payment <span className="font-bold text-[#1D5287]">History</span></h2>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
          </div>
        ) : payments.length === 0 ? (
          <div>No payments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Mode</th>
                  <th className="text-left py-2">Items</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments
                  .sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                  })
                  .map((payment: any) => {
                    // Extract items from purchases
                    const items: string[] = [];
                    if (payment.purchases && payment.purchases.length > 0) {
                      payment.purchases.forEach((purchase: any) => {
                        if (purchase.details && purchase.details.length > 0) {
                          purchase.details.forEach((detail: any) => {
                            if (detail.itemName) {
                              items.push(detail.itemName);
                            }
                          });
                        }
                      });
                    }
                    
                    return (
                      <tr key={payment.id} className="border-b">
                        <td className="py-2">{new Date(payment.createdAt).toLocaleString()}</td>
                        <td className="py-2 font-semibold">₹{payment.amount?.toLocaleString() || 0}</td>
                        <td className="py-2">
                          <span className="capitalize">{payment.mode || 'N/A'}</span>
                        </td>
                        <td className="py-2">
                          {items.length > 0 ? (
                            <div className="space-y-1">
                              {items.map((item, idx) => (
                                <div key={idx} className="text-xs">
                                  {item}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">No items</span>
                          )}
                        </td>
                        <td className="py-2">
                          <span className={`capitalize ${
                            payment.status === 'completed' ? 'text-green-600' : 
                            payment.status === 'pending' ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {payment.status || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
        <Button onClick={onClose} className="mt-4 bg-gradient-to-r from-[#75B640] to-[#52813C] text-white">Close</Button>
      </DialogContent>
    </Dialog>
  );
}
