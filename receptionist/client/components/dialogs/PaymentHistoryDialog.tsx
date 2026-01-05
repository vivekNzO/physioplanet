import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";

export default function PaymentHistoryDialog({ open, onClose, customerId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !customerId) return;
    setLoading(true);
    axiosInstance.get(`/purchase?customerId=${customerId}`)
      .then(res => setPayments(res.data.data || []))
      .finally(() => setLoading(false));
  }, [open, customerId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Payment History</h2>
        {loading ? (
          <div>Loading...</div>
        ) : payments.length === 0 ? (
          <div>No payments found.</div>
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
                {payments
                  .sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                  })
                  .map(payment => (
                  <tr key={payment.id}>
                    <td className="py-2">{new Date(payment.createdAt).toLocaleString()}</td>
                    <td className="py-2 font-semibold">₹{payment.amount}</td>
                    <td className="py-2">
                      {payment.details?.map(item =>
                        <span key={item.id} className="inline-block mr-2">
                          {item.type === "PACKAGE" ? "Package" : "Service"}: {item.itemName}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Button onClick={onClose} className="mt-4">Close</Button>
      </DialogContent>
    </Dialog>
  );
}
