import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";

interface Feedback {
  id: string;
  text: string;
  createdAt: string;
}

interface ClientLastFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any;
  onSave: () => void;
}

export default function ClientLastFeedbackDialog({
  open,
  onOpenChange,
  customer,
  onSave,
}: ClientLastFeedbackDialogProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newFeedback, setNewFeedback] = useState("");

  // Reset feedback state when customer or dialog open changes
  useEffect(() => {
    setNewFeedback("");
    setIsAdding(false);
  }, [customer.id, open]);

  const latestFeedback = feedbacks.length > 0 ? feedbacks[0] : null;

  // Fetch feedbacks when dialog opens
  useEffect(() => {
    if (open && customer.id) {
      fetchFeedbacks();
    }
  }, [open, customer.id]);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/feedbacks?customerId=${customer.id}`);
      if (response.data.success) {
        setFeedbacks(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFeedback = async () => {
    if (!newFeedback.trim()) {
      toast.error("Please enter feedback text");
      return;
    }

    setIsSaving(true);
    try {
      const response = await axiosInstance.post("/feedbacks", {
        customerId: customer.id,
        text: newFeedback.trim(),
      });

      if (response.data.success) {
        toast.success("Feedback added successfully");
        setNewFeedback("");
        setIsAdding(false);
        await fetchFeedbacks();
        onSave?.();
      }
    } catch (error) {
      console.error("Error adding feedback:", error);
      toast.error("Failed to add feedback");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNewFeedback("");
    setIsAdding(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[548px] bg-gradient-to-b from-[#0557A8] to-[#1BB7E9] border-none py-[27.5px] px-[52px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">
              Client Last <span className="font-bold">Feedback</span>
            </DialogTitle>
            {!isAdding && latestFeedback && (
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-white/20 text-white hover:bg-white/30 border-white/30 h-8 w-8 p-0"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <DialogDescription className="sr-only">
            View and add customer feedback
          </DialogDescription>
        </DialogHeader>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-4 space-y-3">
            <div className="h-4 bg-white/20 rounded animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-white/20 rounded animate-pulse w-4/6"></div>
          </div>
        ) : /* Show placeholder if no feedback exists */
        !isAdding && !latestFeedback ? (
          <div className="py-8 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">No Feedback Yet</h3>
            <p className="text-sm text-white/80 mb-6 max-w-xs mx-auto">
              No feedback has been recorded for this customer yet.
            </p>
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-white text-[#0557A8] hover:bg-white/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Feedback
            </Button>
          </div>
        ) : isAdding ? (
          <div className="space-y-4 py-4">
            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Feedback
              </label>
              <textarea
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                placeholder="I had a wonderful experience at Physio Planet – Advanced Physiotherapy and Sports Injury Clinic. The therapist was highly professional and took the time to explain every step of my treatment..."
                className="w-full min-h-[120px] px-4 py-3 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-md text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddFeedback}
                disabled={isSaving}
                className="bg-white text-[#0557A8] hover:bg-white/90"
              >
                {isSaving ? "Saving..." : "Save Feedback"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4">
            {/* Latest Feedback Display */}
            <div className="text-white leading-relaxed">
              <p className="text-sm">
                {latestFeedback?.text}
              </p>
            </div>

            {/* Show total feedback count if more than 1 */}
            {feedbacks.length > 1 && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm text-white/80 text-center">
                  Total Feedbacks: {feedbacks.length}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
