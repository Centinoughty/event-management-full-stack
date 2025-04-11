"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  Calendar,
  Clock,
  MapPin,
  User2,
  Users,
  Circle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/auth-context";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type Event = {
  id: number;
  name: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: {
    name: string;
    capacity: number;
    location: string;
  };
  host: {
    id: number;
    name: string;
    email: string;
  };
  participants: any[];
  volunteers: any[];
};

export default function PendingEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [availability, setAvailability] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to view this page.",
        variant: "destructive",
      });
      return;
    }

    const fetchPendingEvents = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/events/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        console.log(data);
        setEvents(data);

        const availabilityData: { [key: number]: boolean } = {};
        await Promise.all(
          data.map(async (event: Event) => {
            const res = await fetch(
              `${BACKEND_URL}/api/events/availability/${event.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const status = await res.text();
            availabilityData[event.id] = status === "Available";
          })
        );
        setAvailability(availabilityData);
      } catch (err) {
        toast({
          title: "Error",
          description: "Could not load pending events.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingEvents();
  }, [token]);

  const updateEventStatus = async (
    id: number,
    status: "Confirmed" | "Rejected"
  ) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/approve/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update event status");
      setEvents((prev) => prev.filter((event) => event.id !== id));
      toast({ title: `Event ${status}` });
    } catch {
      toast({
        title: "Error",
        description: `Could not ${status.toLowerCase()} the event.`,
        variant: "destructive",
      });
    }
  };

  const handleApprove = (id: number) => updateEventStatus(id, "Confirmed");
  const handleReject = (id: number) => updateEventStatus(id, "Rejected");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (events.length === 0) {
    return <p>No pending events found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Pending Events</h1>
      {events.map((event: any) => (
        <Card key={event.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              {/* <div>
                <CardTitle>{event.name}</CardTitle>
                <p className="text-muted-foreground">{event.description}</p>
              </div> */}
              <div title={availability[event.id] ? "Available" : "Unavailable"}>
                <Circle
                  className={`w-4 h-4 ${
                    availability[event.id] ? "text-green-500" : "text-red-500"
                  }`}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {format(new Date(event.date), "PPP")}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {format(
                new Date(`${event.date}T${event.start_time}`),
                "p"
              )} - {format(new Date(`${event.date}T${event.end_time}`), "p")}
            </div>
            {/* <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {event.venue.name} ({event.venue.location}, Capacity:{" "}
              {event.venue.capacity})
            </div> */}
            {/* <div className="flex items-center gap-2 text-muted-foreground">
              <User2 className="w-4 h-4" />
              Hosted by {event.host.name} ({event.host.email})
            </div> */}
            {/* <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              {event.participants.length} participants,{" "}
              {event.volunteers.length} volunteers
            </div> */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleApprove(event.id)} title="Approve">
                <CheckCircle className="text-green-600 hover:text-green-800 w-5 h-5" />
              </button>
              <button onClick={() => handleReject(event.id)} title="Reject">
                <XCircle className="text-red-600 hover:text-red-800 w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
