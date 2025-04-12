"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, MessageSquare, Search, Star } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type Event = {
  id: string
  title: string
  date: string
  time: string
  location: string
  hasFeedback: boolean
  isAttended: boolean
}

export default function FeedbackPage() {
  const { token, user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const isOrganizer = user?.role === "admin" || user?.role === "manager" || user?.role === "organizer"

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/event?attended=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch events")
        }

        const data = await response.json()
        setEvents(data)
        setFilteredEvents(data)
      } catch (error) {
        console.error("Error fetching events:", error)
        setError("Failed to load events. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [token])

  useEffect(() => {
    // Apply search filter
    if (searchQuery) {
      const filtered = events.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredEvents(filtered)
    } else {
      setFilteredEvents(events)
    }
  }, [events, searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
          <p className="text-muted-foreground">Provide feedback for events you've attended</p>
        </div>
        {isOrganizer && (
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/feedback/manage">
              <MessageSquare className="mr-2 h-4 w-4" /> View All Feedback
            </Link>
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search events..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(3)
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
            ))}
        </div>
      ) : error ? (
        <div>
          <p className="text-destructive">{error}</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No attended events found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? "Try adjusting your search criteria" : "You haven't attended any events yet"}
          </p>
          <Button asChild className="mt-4">
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  {formatDate(event.date)} • {event.time}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm mb-4">
                  <span className="line-clamp-1">{event.location}</span>
                </div>
                <div className="flex items-center mb-4">
                  {event.hasFeedback ? (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Feedback Submitted
                    </Badge>
                  ) : (
                    <Badge variant="outline">Feedback Needed</Badge>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button asChild variant={event.hasFeedback ? "outline" : "default"} size="sm">
                    <Link href={`/feedback/${event.id}`}>
                      {event.hasFeedback ? "View Feedback" : "Provide Feedback"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isOrganizer && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Organizer Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>As an organizer, you can view feedback for your events:</p>
            <Button asChild>
              <Link href="/feedback/manage">
                <MessageSquare className="mr-2 h-4 w-4" /> View All Feedback
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

