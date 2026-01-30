import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Calendar as CalendarIcon, Clock, User, Trash2 } from "lucide-react";
import { format, isSameDay, startOfDay } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string | null;
  candidate_name: string | null;
  is_completed: boolean;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "task",
    start_time: "",
    end_time: "",
    candidate_name: ""
  });

  const fetchEvents = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleCreateEvent = async () => {
    if (!user || !formData.title || !formData.start_time) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in the required fields."
      });
      return;
    }

    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: formData.title,
      description: formData.description || null,
      event_type: formData.event_type,
      start_time: formData.start_time,
      end_time: formData.end_time || null,
      candidate_name: formData.candidate_name || null
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event."
      });
    } else {
      toast({ title: "Event created!" });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        event_type: "task",
        start_time: "",
        end_time: "",
        candidate_name: ""
      });
      fetchEvents();
    }
  };

  const handleToggleComplete = async (event: CalendarEvent) => {
    const { error } = await supabase
      .from("calendar_events")
      .update({ is_completed: !event.is_completed })
      .eq("id", event.id);

    if (!error) {
      fetchEvents();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (!error) {
      toast({ title: "Event deleted" });
      fetchEvents();
    }
  };

  const eventsForSelectedDate = events.filter(event =>
    isSameDay(new Date(event.start_time), selectedDate)
  );

  const eventDates = events.map(e => startOfDay(new Date(e.start_time)));

  const getEventTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      interview: "bg-chart-1 text-white",
      task: "bg-chart-2 text-white",
      reminder: "bg-chart-4 text-white",
      deadline: "bg-destructive text-destructive-foreground"
    };
    return (
      <Badge className={colors[type] || "bg-muted"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif">Calendar</h1>
          <p className="text-muted-foreground">Manage interviews, tasks, and reminders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
              <DialogDescription>Add a new event to your calendar</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title"
                />
              </div>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>
              {formData.event_type === "interview" && (
                <div className="space-y-2">
                  <Label>Candidate Name</Label>
                  <Input
                    value={formData.candidate_name}
                    onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                    placeholder="Candidate name"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent}>Create Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={{
                hasEvent: eventDates
              }}
              modifiersStyles={{
                hasEvent: { fontWeight: "bold", textDecoration: "underline" }
              }}
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </CardTitle>
            <CardDescription>
              {eventsForSelectedDate.length} event(s) scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsForSelectedDate.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No events scheduled for this day
              </p>
            ) : (
              <div className="space-y-3">
                {eventsForSelectedDate.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border ${event.is_completed ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={event.is_completed}
                          onCheckedChange={() => handleToggleComplete(event)}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${event.is_completed ? "line-through" : ""}`}>
                              {event.title}
                            </span>
                            {getEventTypeBadge(event.event_type)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(event.start_time), "h:mm a")}
                              {event.end_time && ` - ${format(new Date(event.end_time), "h:mm a")}`}
                            </span>
                            {event.candidate_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {event.candidate_name}
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
