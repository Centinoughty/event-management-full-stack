"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

type Event = {
  id: number
  name: string
  description: string
  date: string
  start_time: string
  end_time: string
  venue_id?: number
}

type Venue = {
  id: number
  name: string
  capacity: number
  location: string
}

export default function EditEventPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/events/details/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        setEvent(data)
      } catch (err) {
        toast({
          title: "Failed to fetch event",
          description: "Please try again later.",
          variant: "destructive",
        })
      }
    }

    const fetchVenues = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/venues/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch venues")
        const data = await res.json()
        setVenues(data)
      } catch (err) {
        toast({
          title: "Failed to load venues",
          description: "Please try again later.",
          variant: "destructive",
        })
      }
    }

    fetchEvent()
    fetchVenues()
  }, [id, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    setIsSaving(true)

    try {
      const res = await fetch(`${BACKEND_URL}/api/events/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(event),
      })

      if (!res.ok) throw new Error("Update failed")

      toast({
        title: "Event updated",
        description: "Changes saved successfully.",
      })

      router.push(`/events/${id}`)
    } catch (err) {
      toast({
        title: "Failed to update",
        description: "Please check your input.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!event) return <p>Loading...</p>

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Event Name</Label>
          <Input
            id="name"
            value={event.name}
            onChange={(e) => setEvent({ ...event, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={event.description}
            onChange={(e) => setEvent({ ...event, description: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={event.date.slice(0, 10)}
            onChange={(e) => setEvent({ ...event, date: e.target.value })}
            required
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              type="time"
              value={event.start_time.slice(0, 5)}
              onChange={(e) =>
                setEvent({ ...event, start_time: `${e.target.value}:00` })
              }
              required
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              type="time"
              value={event.end_time.slice(0, 5)}
              onChange={(e) =>
                setEvent({ ...event, end_time: `${e.target.value}:00` })
              }
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="venue">Venue</Label>
          <Select
            value={event.venue_id?.toString() || ""}
            onValueChange={(value) => setEvent({ ...event, venue_id: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select venue" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id.toString()}>
                  {venue.name} — {venue.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  )
}
