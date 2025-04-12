"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";

type HostedEvent = {
  id: number;
  name: string;
  date: string;       // Expected format: 'YYYY-MM-DD'
  start_time: string; // Expected format: 'HH:mm:ss'
  end_time: string;   // Expected format: 'HH:mm:ss'
};

export default function HostedEventsPage() {
  const { token } = useAuth();
  const [hostedEvents, setHostedEvents] = useState<HostedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const fetchHostedEvents = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/events/hosted`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch hosted events");
        }

        const data = await res.json();
        setHostedEvents(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load hosted events.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchHostedEvents();
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hosted Events</h1>
        <p className="text-muted-foreground">All events you're hosting</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
        </div>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : hostedEvents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No hosted events found</h3>
          <p className="text-muted-foreground mt-1">You're not hosting any events.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hostedEvents.map((event) => {
            // Combine date and time to create valid datetime strings
            const startDateTime = new Date(`${event.date}T${event.start_time}`);
            const endDateTime = new Date(`${event.date}T${event.end_time}`);

            return (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{event.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center">
                    <CalendarClock className="w-4 h-4 mr-2" />
                    <span>
                      {format(startDateTime, "PPP")} •{" "}
                      {format(startDateTime, "p")} -{" "}
                      {format(endDateTime, "p")}
                    </span>
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
