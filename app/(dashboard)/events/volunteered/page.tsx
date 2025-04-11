"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock } from "lucide-react";
import { format, parseISO } from "date-fns";

type VolunteeredEvent = {
  id: number;
  name: string;
  date: string;       // Expected format: 'YYYY-MM-DD'
  start_time: string; // Expected format: 'HH:mm:ss'
  end_time: string;   // Expected format: 'HH:mm:ss'
};

export default function VolunteeringEventsPage() {
  const { token } = useAuth();
  const [events, setEvents] = useState<VolunteeredEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const fetchVolunteeredEvents = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/events/volunteered`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch volunteering events");
        }

        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load volunteering events.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchVolunteeredEvents();
    }
  }, [token]);

  const parseEventDateTime = (date: string, time: string) => {
    const dateTimeString = `${date}T${time}`;
    return parseISO(dateTimeString);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Volunteering Events</h1>
        <p className="text-muted-foreground">Events where you're volunteering your time</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No volunteering events</h3>
          <p className="text-muted-foreground mt-1">You're not volunteering at any upcoming events.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const eventDate = parseISO(event.date);
            const startTime = parseEventDateTime(event.date, event.start_time);
            const endTime = parseEventDateTime(event.date, event.end_time);

            return (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{event.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center">
                    <CalendarClock className="w-4 h-4 mr-2" />
                    <span>
                      {format(eventDate, "PPP")} • {format(startTime, "p")} - {format(endTime, "p")}
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
