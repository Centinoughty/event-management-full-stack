"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"

type Event = {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  organizer: string
  attendees: number
}

export default function DashboardPage() {
  // const { token, user } = useAuth()
  const token = "mock-token"; // Remove auth dependency
  const user = { name: "Guest", role: "admin" }; // Mock user

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Simulated delay to mimic API fetching
    setTimeout(() => {
      setUpcomingEvents([
        {
          id: "1",
          title: "Mock Event 1",
          description: "This is a test event",
          date: "2025-04-01",
          time: "10:00 AM",
          location: "Virtual",
          organizer: "Admin",
          attendees: 100,
        },
        {
          id: "2",
          title: "Mock Event 2",
          description: "Another test event",
          date: "2025-04-02",
          time: "2:00 PM",
          location: "Conference Hall A",
          organizer: "Manager",
          attendees: 50,
        },
      ]);
      setIsLoading(false);
    }, 1000); // Simulate network delay
  }, []);
  

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>
        {(user?.role === "admin" || user?.role === "manager" || user?.role === "organizer") && (
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/events/create">Create New Event</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeletons
          Array(3)
            .fill(0)
            .map((_, i) => (
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
          <div className="col-span-full">
            <p className="text-destructive">{error}</p>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="col-span-full">
            <p>No upcoming events found.</p>
          </div>
        ) : (
          upcomingEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-1 h-4 w-4" />
                    {formatDate(event.date)}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground mb-4">{event.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 opacity-70" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 opacity-70" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 opacity-70" />
                    <span>{event.attendees} attendees</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/events/${event.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Upcoming Events</CardTitle>
            <CardDescription>Events you're registered for</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.date)} • {event.time}
                        </p>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/events/${event.id}`}>View</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">You haven't registered for any upcoming events.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Venues</CardTitle>
            <CardDescription>Recently added or updated venues</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-muted-foreground">Loading venue data...</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/venues">View All Venues</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

