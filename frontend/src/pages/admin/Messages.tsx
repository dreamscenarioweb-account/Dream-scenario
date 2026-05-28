import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchQuoteRequests, markQuoteRead, deleteQuoteRequest } from "@/lib/adminApi";
import type { QuoteRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Eye, Mail, Phone, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isValid } from "date-fns";

const safeDate = (val: string | null | undefined): string => {
  if (!val) return "—";
  try {
    const d = typeof val === "string" ? parseISO(val) : new Date(val);
    return isValid(d) ? format(d, "MMM d, yyyy") : "—";
  } catch {
    return "—";
  }
};

const safeDateFull = (val: string | null | undefined): string => {
  if (!val) return "—";
  try {
    const d = typeof val === "string" ? parseISO(val) : new Date(val);
    return isValid(d) ? format(d, "PPP") : "—";
  } catch {
    return "—";
  }
};

const Messages = () => {
  const queryClient = useQueryClient();
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

  const { data: quoteResponse, isLoading } = useQuery({
    queryKey: ["admin_quotes"],
    queryFn: async () => {
      const res = await fetchQuoteRequests();
      return res.data || [];
    },
  });
  const quotes = Array.isArray(quoteResponse) ? quoteResponse : [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markQuoteRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_quotes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuoteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_quotes"] });
      toast.success("Quote request deleted");
      setSelectedQuote(null);
    },
    onError: () => toast.error("Failed to delete quote request"),
  });

  const handleView = (item: QuoteRequest) => {
    setSelectedQuote(item);
    if (!item.is_read) markReadMutation.mutate(item.id);
  };

  const sorted = [...quotes].sort((a, b) => {
    const ta = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
    const tb = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
    return tb - ta;
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2">Quote Requests</h1>
        <p className="font-body text-[15px] text-[hsl(215,15%,50%)]">Incoming booking enquiries from clients.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[hsl(215,20%,90%)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[hsl(0,0%,98%)] hover:bg-[hsl(0,0%,98%)] font-body text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">
                <TableHead className="h-12">Received</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Event Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-body text-sm">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-[hsl(215,15%,50%)]">Loading...</TableCell>
                </TableRow>
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-[hsl(215,15%,50%)]">No quote requests yet.</TableCell>
                </TableRow>
              ) : (
                sorted.map((item: QuoteRequest) => (
                  <TableRow key={item.id} className={`${!item.is_read ? "bg-gray-50/80" : ""} hover:bg-[hsl(0,0%,99%)]`}>
                    <TableCell className="whitespace-nowrap text-sm text-[hsl(215,15%,50%)]">
                      {safeDate(item.submitted_at)}
                    </TableCell>
                    <TableCell className="font-medium text-black">{item.names || "—"}</TableCell>
                    <TableCell className="text-[hsl(215,15%,50%)]">{item.email || "—"}</TableCell>
                    <TableCell className="text-[hsl(215,15%,50%)] capitalize">{item.event_type || "—"}</TableCell>
                    <TableCell className="text-[hsl(215,15%,50%)]">{safeDateFull(item.event_date)}</TableCell>
                    <TableCell>
                      {!item.is_read ? (
                        <span className="px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider bg-black border-black text-white">New</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider bg-gray-50 border-gray-200 text-[hsl(215,15%,50%)]">Read</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(item)} className="text-[hsl(215,15%,50%)] hover:text-black rounded-lg">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this quote request?")) deleteMutation.mutate(item.id); }} className="text-[hsl(215,15%,50%)] hover:text-red-600 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Quote Request</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-5 pt-2 font-body text-sm">

              {/* Client info */}
              <div className="bg-gray-50 rounded-xl border border-[hsl(215,20%,90%)] p-5 space-y-3">
                <p className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">Client</p>
                <p className="font-semibold text-black text-base">{selectedQuote.names || "—"}</p>
                <div className="flex flex-col gap-2 pt-1">
                  <a href={`mailto:${selectedQuote.email}`} className="flex items-center gap-2 text-[hsl(215,15%,50%)] hover:text-black transition-colors">
                    <Mail className="w-4 h-4 shrink-0" />{selectedQuote.email}
                  </a>
                  {selectedQuote.phone && (
                    <a href={`tel:${selectedQuote.phone}`} className="flex items-center gap-2 text-[hsl(215,15%,50%)] hover:text-black transition-colors">
                      <Phone className="w-4 h-4 shrink-0" />{selectedQuote.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Event details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl border border-[hsl(215,20%,90%)] p-4">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Event Date
                  </p>
                  <p className="font-medium text-black">{safeDateFull(selectedQuote.event_date)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl border border-[hsl(215,20%,90%)] p-4">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-1.5">Event Type</p>
                  <p className="font-medium text-black capitalize">{selectedQuote.event_type || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl border border-[hsl(215,20%,90%)] p-4">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Venue
                  </p>
                  <p className="font-medium text-black">{selectedQuote.event_venue || "Not specified"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl border border-[hsl(215,20%,90%)] p-4">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-1.5">Budget</p>
                  <p className="font-medium text-black">{selectedQuote.budget || "Not specified"}</p>
                </div>
              </div>

              {/* Message */}
              {selectedQuote.message && (
                <div>
                  <p className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-2">Message</p>
                  <div className="bg-white border border-[hsl(215,20%,90%)] rounded-xl p-4 text-[hsl(215,15%,50%)] whitespace-pre-wrap leading-relaxed">
                    {selectedQuote.message}
                  </div>
                </div>
              )}

              {/* Received */}
              <p className="text-[11px] text-[hsl(215,15%,50%)]">
                Received: {safeDate(selectedQuote.submitted_at)}
              </p>

              {/* Delete */}
              <div className="pt-2 border-t border-[hsl(215,20%,90%)]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { if (confirm("Delete this quote request?")) deleteMutation.mutate(selectedQuote.id); }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;
