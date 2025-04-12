"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type Venue = {
  id: number;
  name: string;
  capacity: number;
  location: string;
};

export default function CreateEventPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    venue_id: "",
  });

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/venues/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch venues");
        const data = await res.json();
        setVenues(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load venues.",
          variant: "destructive",
        });
      }
    };

    if (token) fetchVenues();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        venue_id: parseInt(formData.venue_id),
      };

      const response = await fetch(`${BACKEND_URL}/api/events/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create event");
      }

      const data = await response.json();
      toast({
        title: "Event created",
        description: "Your event has been created successfully",
      });
      router.push(`/events/${data.id}`);
    } catch (error) {
      toast({
        title: "Error creating event",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
        <p className="text-muted-foreground">
          Fill in the details to create a new event
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Provide the basic information about your event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter event name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event"
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  name="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_id">Venue</Label>
              {venues.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Loading venues...
                </p>
              ) : (
                <select
                  id="venue_id"
                  name="venue_id"
                  value={formData.venue_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  required
                >
                  <option value="">Select a venue</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} - {venue.location} (Capacity:{" "}
                      {venue.capacity})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/events">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
