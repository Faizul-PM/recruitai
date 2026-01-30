import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Loader2, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatSupport() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your RecruitAI assistant. How can I help you today? I can answer questions about CV screening, job management, interviews, and more.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const responses: Record<string, string> = {
        default: "I'm here to help! You can ask me about:\n\n• Uploading and managing CVs\n• Screening candidates with AI\n• Creating job roles\n• Scheduling interviews\n• Sending emails to candidates\n\nWhat would you like to know more about?"
      };

      const keywords = input.toLowerCase();
      let response = responses.default;

      if (keywords.includes("cv") || keywords.includes("upload") || keywords.includes("resume")) {
        response = "To upload CVs, go to the CV Screening section and use the upload area. You can upload multiple PDF or Word documents at once. After uploading, select the CVs you want to screen and enter a job description for AI-powered candidate matching.";
      } else if (keywords.includes("screen") || keywords.includes("ai") || keywords.includes("match")) {
        response = "Our AI screening analyzes CVs against your job description and provides:\n\n• ATS compatibility score (0-100)\n• Missing keywords analysis\n• Selection/rejection reasons\n\nSimply upload CVs, select them, and paste your job description to get instant insights.";
      } else if (keywords.includes("job") || keywords.includes("role") || keywords.includes("position")) {
        response = "In the Job Roles section, you can create and manage open positions. Add job titles, descriptions, and requirements. Then use these job descriptions to screen candidates efficiently.";
      } else if (keywords.includes("calendar") || keywords.includes("interview") || keywords.includes("schedule")) {
        response = "The Calendar section helps you schedule interviews, set reminders, and track deadlines. Create events with candidate names, times, and descriptions to stay organized throughout your hiring process.";
      } else if (keywords.includes("email") || keywords.includes("contact") || keywords.includes("message")) {
        response = "Use the Email section to communicate with candidates. You can compose and send emails directly, and view your complete email history for reference.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold font-serif">Chat Support</h1>
        <p className="text-muted-foreground">Get help with using RecruitAI</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-primary" />
            RecruitAI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === "user" ? "bg-primary" : "bg-muted"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-foreground" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
