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

  // Function to convert payments to CSV format
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';

    // CSV Headers
    const headers = ['Date', 'Amount', 'Mode', 'Items', 'Status'];
    
    // CSV Rows
    const rows = data.map((payment) => {
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
      
      // Format date in a way Excel can recognize (MM/DD/YYYY HH:MM:SS AM/PM)
      const formatDateForCSV = (dateString: string) => {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        const hours24 = date.getHours();
        const hours12 = hours24 % 12 || 12;
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours24 >= 12 ? 'PM' : 'AM';
        return `${month}/${day}/${year} ${hours12}:${minutes}:${seconds} ${ampm}`;
      };
      const date = payment.createdAt ? formatDateForCSV(payment.createdAt) : 'N/A';
      const amountValue = payment.amount ? (typeof payment.amount === 'string' ? parseFloat(payment.amount) : Number(payment.amount)) : 0;
      const amount = amountValue.toFixed(2); // Format to 2 decimal places
      const mode = payment.mode || 'N/A';
      const itemsStr = items.length > 0 ? items.join('; ') : 'No items';
      const status = payment.status || 'N/A';
      
      // Escape commas and quotes in CSV
      const escapeCSV = (str: string, alwaysQuote: boolean = false) => {
        const strValue = String(str);
        if (alwaysQuote || strValue.includes(',') || strValue.includes('"') || strValue.includes('\n') || strValue.includes(' ')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      };
      
      return [
        escapeCSV(date, true), 
        escapeCSV(amount),
        escapeCSV(mode),
        escapeCSV(itemsStr, true),
        escapeCSV(status)
      ].join(',');
    });
    
    // Combine headers and rows
    return [headers.join(','), ...rows].join('\n');
  };

  // Function to download CSV
  const handleExportCSV = () => {
    if (payments.length === 0) {
      return;
    }
    
    const csvContent = convertToCSV(payments);
    // Add UTF-8 BOM for better Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `payment_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="flex gap-3 mt-4">
          <Button 
            onClick={handleExportCSV} 
            disabled={payments.length === 0 || loading}
            variant="outline"
            className="flex-1 border-[#75B640] text-[#75B640] hover:bg-[#75B640] hover:text-white"
          >
            Export CSV
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
