"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Search, Plus, Filter, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Event = {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  organizer: string;
};

export default function EventsPage() {
  const { token, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterDate, setFilterDate] = useState("all");

  const router = useRouter();
  const eventTypes = [...new Set(events.map((event) => event.type))];
  const eventLocations = [...new Set(events.map((event) => event.location))];

  const handleMarkAttendance = (eventId: string) => {
    if (user?.id) {
      router.push(`/events/markattendance?eventId=${eventId}&userId=${user.id}`);
    }
  };

  useEffect(() => {
    if (!token) return;

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/events/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Fetch failed: ${res.status} - ${text}`);
        }

        const data = await res.json();
        console.log(data)
        setEvents(data);
        setFilteredEvents(data);
      } catch (err) {
        setError("Failed to load events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [token]);

  useEffect(() => {
    let result = events;

    if (searchQuery) {
      result = result.filter(
        (event) =>
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== "all") {
      result = result.filter((event) => event.type === filterType);
    }

    if (filterLocation !== "all") {
      result = result.filter((event) => event.location === filterLocation);
    }

    if (filterDate !== "all") {
      result = result.filter((event) => {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filterDate) {
          case "upcoming":
            return eventDate >= today;
          case "past":
            return eventDate < today;
          case "today":
            return (
              eventDate.getDate() === today.getDate() &&
              eventDate.getMonth() === today.getMonth() &&
              eventDate.getFullYear() === today.getFullYear()
            );
          case "week": {
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            return eventDate >= today && eventDate <= nextWeek;
          }
          case "month": {
            const nextMonth = new Date(today);
            nextMonth.setMonth(today.getMonth() + 1);
            return eventDate >= today && eventDate <= nextMonth;
          }
          default:
            return true;
        }
      });
    }

    const sorted = [...result].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setFilteredEvents(sorted);
  }, [events, searchQuery, filterType, filterLocation, filterDate]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterLocation("all");
    setFilterDate("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground mb-4">Browse and manage all events</p>

          {/* ✅ Navigation Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="secondary" asChild>
              <Link href="/events/pending">Pending Events</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/events/hosted">Hosted Events</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/events/volunteered">Volunteered Events</Link>
            </Button>
          </div>
        </div>
        {(user?.role === "admin" ||
          user?.role === "manager" ||
          user?.role === "organizer") && (
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/events/create">
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-4/5" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium">No events found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{event.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  {formatDate(event.date)} • {event.time}
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                  {event.description}
                </p>
                {/* <div className="flex items-center text-sm">
                  <MapPin className="mr-1 h-4 w-4 opacity-70" />
                  <span className="line-clamp-1">{event.venue_id}</span>
                </div> */}
                <div className="mt-4 flex justify-between items-center">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/events/${event.id}`}>View Details</Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleMarkAttendance(event.id)}>
                        Mark Attendance
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
