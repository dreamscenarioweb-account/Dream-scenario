import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchContactSubmissions, markContactRead, deleteContactSubmission, fetchQuoteRequests, markQuoteRead, deleteQuoteRequest } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Eye, Mail, Calendar, MapPin, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const Messages = () => {
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  // Queries
  const { data: contactResponse, isLoading: loadingContacts } = useQuery({
    queryKey: ["admin_contacts"],
    queryFn: async () => {
      const res = await fetchContactSubmissions();
      return res.data || [];
    },
  });

  const { data: quoteResponse, isLoading: loadingQuotes } = useQuery({
    queryKey: ["admin_quotes"],
    queryFn: async () => {
      const res = await fetchQuoteRequests();
      return res.data || [];
    },
  });

  const contacts = Array.isArray(contactResponse) ? contactResponse : [];
  const quotes = Array.isArray(quoteResponse) ? quoteResponse : [];

  // Mutations
  const markContactMutation = useMutation({
    mutationFn: (id: string) => markContactRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_contacts"] }),
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => deleteContactSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_contacts"] });
      toast.success("Message deleted");
      setSelectedContact(null);
    },
  });

  const markQuoteMutation = useMutation({
    mutationFn: (id: string) => markQuoteRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_quotes"] }),
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: (id: string) => deleteQuoteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_quotes"] });
      toast.success("Quote request deleted");
      setSelectedQuote(null);
    },
  });

  const handleViewContact = (msg: any) => {
    setSelectedContact(msg);
    if (!msg.is_read) markContactMutation.mutate(msg.id);
  };

  const handleViewQuote = (req: any) => {
    setSelectedQuote(req);
    if (!req.is_read) markQuoteMutation.mutate(req.id);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-black mb-2">Messages & Quotes</h1>
        <p className="font-body text-[15px] text-[hsl(215,15%,50%)]">Manage client inquiries and booking requests.</p>
      </div>

      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2 bg-gray-50 p-1 rounded-lg">
          <TabsTrigger value="contacts" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Contact Messages</TabsTrigger>
          <TabsTrigger value="quotes" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Quote Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contacts" className="mt-6">
          <div className="bg-white rounded-2xl border border-[hsl(215,20%,90%)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[hsl(0,0%,98%)] hover:bg-[hsl(0,0%,98%)] font-body text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">
                    <TableHead className="h-12">Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="font-body text-sm">
                  {loadingContacts ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-32 text-[hsl(215,15%,50%)]">Loading...</TableCell>
                    </TableRow>
                  ) : contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-32 text-[hsl(215,15%,50%)]">No messages found.</TableCell>
                    </TableRow>
                  ) : (
                    contacts.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((item: any) => (
                      <TableRow key={item.id} className={`${!item.is_read ? "bg-gray-50/80 font-medium" : ""} hover:bg-[hsl(0,0%,99%)]`}>
                        <TableCell className="whitespace-nowrap text-sm">{format(new Date(item.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-black">{item.name}</TableCell>
                        <TableCell className="text-[hsl(215,15%,50%)]">{item.email}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-[hsl(215,15%,50%)]">{item.subject}</TableCell>
                        <TableCell>
                          {!item.is_read ? (
                            <span className="px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider bg-black border-black text-white">New</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider bg-gray-50 border-gray-200 text-[hsl(215,15%,50%)]">Read</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewContact(item)} className="text-[hsl(215,15%,50%)] hover:text-black rounded-lg">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { if(confirm("Delete this message?")) deleteContactMutation.mutate(item.id); }} className="text-[hsl(215,15%,50%)] hover:text-red-600 rounded-lg">
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
        </TabsContent>

        <TabsContent value="quotes" className="mt-6">
          <div className="bg-white rounded-2xl border border-[hsl(215,20%,90%)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[hsl(0,0%,98%)] hover:bg-[hsl(0,0%,98%)] font-body text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)]">
                    <TableHead className="h-12">Date</TableHead>
                    <TableHead>Couple</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="font-body text-sm">
                  {loadingQuotes ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-32 text-[hsl(215,15%,50%)]">Loading...</TableCell>
                    </TableRow>
                  ) : quotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-32 text-[hsl(215,15%,50%)]">No quote requests found.</TableCell>
                    </TableRow>
                  ) : (
                    quotes.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((item: any) => (
                      <TableRow key={item.id} className={`${!item.is_read ? "bg-gray-50/80 font-medium" : ""} hover:bg-[hsl(0,0%,99%)]`}>
                        <TableCell className="whitespace-nowrap text-sm">{format(new Date(item.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-black">
                          {item.partner1_name} & {item.partner2_name}
                        </TableCell>
                        <TableCell className="text-[hsl(215,15%,50%)]">{item.event_date ? format(new Date(item.event_date), "MMM d, yyyy") : "N/A"}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-[hsl(215,15%,50%)]">
                          {Array.isArray(item.services_interested) ? item.services_interested.join(", ") : ""}
                        </TableCell>
                        <TableCell>
                          {!item.is_read ? (
                            <span className="px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider bg-black border-black text-white">New</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider bg-gray-50 border-gray-200 text-[hsl(215,15%,50%)]">Read</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewQuote(item)} className="text-[hsl(215,15%,50%)] hover:text-black rounded-lg">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { if(confirm("Delete this request?")) deleteQuoteMutation.mutate(item.id); }} className="text-[hsl(215,15%,50%)] hover:text-red-600 rounded-lg">
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
        </TabsContent>
      </Tabs>

      {/* View Contact Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display">Contact Message</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4 pt-4 font-body">
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-[hsl(215,20%,90%)]">
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] block mb-1">Name</span>
                  <span className="font-medium text-black">{selectedContact.name}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] block mb-1">Date</span>
                  <span className="font-medium text-black">{format(new Date(selectedContact.created_at), "PPp")}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] block mb-1">Email <a href={`mailto:${selectedContact.email}`} className="text-black underline lowercase font-normal">({selectedContact.email})</a></span>
                </div>
                {selectedContact.phone && (
                  <div className="col-span-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] block mb-1">Phone <a href={`tel:${selectedContact.phone}`} className="text-black underline lowercase font-normal">({selectedContact.phone})</a></span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-black mb-2">Subject: {selectedContact.subject}</h4>
                <div className="bg-white border border-[hsl(215,20%,90%)] rounded-lg p-4 text-[hsl(215,15%,50%)] whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedContact.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Quote Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Quote Request Details</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-6 pt-4 font-body">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-4 border border-[hsl(215,20%,90%)]">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] block mb-1 whitespace-nowrap">Partner 1</span>
                  <span className="font-medium text-base text-black">{selectedQuote.partner1_name}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-[hsl(215,20%,90%)]">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] block mb-1 whitespace-nowrap">Partner 2</span>
                  <span className="font-medium text-base text-black">{selectedQuote.partner2_name}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 col-span-2 border border-[hsl(215,20%,90%)]">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] block mb-1">Contact Info</span>
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="flex items-center gap-2 text-black"><Mail className="w-4 h-4 text-[hsl(215,15%,50%)]" /> <a href={`mailto:${selectedQuote.email}`} className="hover:underline">{selectedQuote.email}</a></span>
                    <span className="flex items-center gap-2 text-black"><MapPin className="w-4 h-4 text-[hsl(215,15%,50%)]" /> <a href={`tel:${selectedQuote.phone}`} className="hover:underline">{selectedQuote.phone}</a></span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm border-t border-[hsl(215,20%,90%)] pt-6">
                 <div>
                    <h4 className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-2"><Calendar className="w-4 h-4"/> Event Date</h4>
                    <p className="text-black font-medium">{selectedQuote.event_date ? format(new Date(selectedQuote.event_date), "PPP") : "TBD"}</p>
                 </div>
                 <div>
                    <h4 className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-2"><MapPin className="w-4 h-4"/> Venue / Location</h4>
                    <p className="text-black font-medium">{selectedQuote.venue_location || "Not specified"}</p>
                 </div>
                 <div>
                    <h4 className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-2">Guest Count</h4>
                    <p className="text-black font-medium">{selectedQuote.guest_count || "Not specified"}</p>
                 </div>
                 <div>
                    <h4 className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-2">Budget Range</h4>
                    <p className="text-black font-medium">{selectedQuote.budget_range || "Not specified"}</p>
                 </div>
              </div>

              <div className="border-t border-[hsl(215,20%,90%)] pt-6">
                <h4 className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-3"><CheckCircle className="w-4 h-4"/> Services Interested In</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedQuote.services_interested) && selectedQuote.services_interested.map((srv: string, i: number) => (
                    <span key={i} className="bg-gray-100 border border-[hsl(215,20%,90%)] text-black px-3 py-1 rounded-full text-xs font-medium">{srv}</span>
                  ))}
                </div>
              </div>

              {selectedQuote.additional_details && (
                <div className="border-t border-[hsl(215,20%,90%)] pt-6">
                  <h4 className="text-[11px] font-bold tracking-wider uppercase text-[hsl(215,15%,50%)] mb-2">Additional Details</h4>
                  <div className="bg-gray-50 border border-[hsl(215,20%,90%)] rounded-lg p-4 text-[hsl(215,15%,50%)] whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedQuote.additional_details}
                  </div>
                </div>
              )}
              
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;
