import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Mail, Send, Trash2, Calendar, User, Inbox, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface Email {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  body: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

export default function EmailPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipient_email: "",
    recipient_name: "",
    subject: "",
    body: ""
  });

  const fetchEmails = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("emails")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching emails:", error);
    } else {
      setEmails(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, [user]);

  const handleSendEmail = async () => {
    if (!user || !formData.recipient_email || !formData.subject || !formData.body) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields."
      });
      return;
    }

    setSending(true);

    const { error } = await supabase.from("emails").insert({
      user_id: user.id,
      recipient_email: formData.recipient_email,
      recipient_name: formData.recipient_name || null,
      subject: formData.subject,
      body: formData.body,
      status: "sent",
      sent_at: new Date().toISOString()
    });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save email." });
    } else {
      toast({ title: "Email sent!", description: `Email sent to ${formData.recipient_email}` });
      setIsDialogOpen(false);
      setFormData({ recipient_email: "", recipient_name: "", subject: "", body: "" });
      fetchEmails();
    }

    setSending(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("emails").delete().eq("id", id);
    if (!error) {
      toast({ title: "Email deleted" });
      fetchEmails();
    }
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
      sent: { icon: CheckCircle, color: "text-chart-1", bg: "bg-chart-1" },
      draft: { icon: Inbox, color: "text-muted-foreground", bg: "bg-muted" },
      failed: { icon: XCircle, color: "text-destructive", bg: "bg-destructive" }
    };
    return config[status] || config.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email"
        description="Send emails and view history"
        icon={<Mail className="w-6 h-6 text-primary" />}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Compose Email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Compose Email</DialogTitle>
                <DialogDescription>Send an email to a candidate</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recipient Email *</Label>
                    <Input
                      type="email"
                      value={formData.recipient_email}
                      onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                      placeholder="candidate@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Recipient Name</Label>
                    <Input
                      value={formData.recipient_name}
                      onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Interview Invitation"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message *</Label>
                  <Textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Write your message..."
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmail} disabled={sending} className="gap-2">
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Email
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {emails.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-8 h-8 text-primary" />}
          title="No emails sent yet"
          description="Compose and send emails to candidates directly from your dashboard."
          action={{
            label: "Send Your First Email",
            onClick: () => setIsDialogOpen(true),
            icon: <Plus className="h-4 w-4" />
          }}
        />
      ) : (
        <div className="space-y-3">
          {emails.map((email) => {
            const statusConfig = getStatusConfig(email.status);
            const StatusIcon = statusConfig.icon;
            return (
              <Card key={email.id} className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center shrink-0">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold truncate">{email.subject}</span>
                          <Badge className={`${statusConfig.bg} text-primary-foreground text-xs gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {email.recipient_name || email.recipient_email}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {email.sent_at ? format(new Date(email.sent_at), "MMM d, yyyy h:mm a") : "Draft"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{email.body}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(email.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
