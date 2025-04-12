"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseISO, format } from "date-fns";

type AttendedEvent = {
  id: number;
  name: string;
  date: string;       // e.g., "2025-04-10"
  start_time: string; // e.g., "18:00:00"
  end_time: string;   // e.g., "20:00:00"
};

export default function AttendedEventsPage() {
  const { token } = useAuth();
  const [events, setEvents] = useState<AttendedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendedEvents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events/attended`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch attended events");
        }

        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendedEvents();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Attended Events</h1>
      {loading ? (
        <p>Loading...</p>
      ) : events.length === 0 ? (
        <p>No attended events found.</p>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => {
            // Combine date and time strings into full ISO datetime strings
            const startDateTime = `${event.date}T${event.start_time}`;
            const endDateTime = `${event.date}T${event.end_time}`;

            // Parse the combined datetime strings
            const startDate = parseISO(startDateTime);
            const endDate = parseISO(endDateTime);

            return (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Date:</strong> {format(startDate, "PPP")}
                  </p>
                  <p>
                    <strong>Start:</strong> {format(startDate, "p")}
                  </p>
                  <p>
                    <strong>End:</strong> {format(endDate, "p")}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
