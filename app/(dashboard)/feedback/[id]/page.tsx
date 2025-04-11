"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Star } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type Event = {
  id: string
  title: string
  date: string
  time: string
  location: string
  hasFeedback: boolean
}

type Feedback = {
  id: string
  rating: number
  comment: string
  createdAt: string
}

export default function FeedbackPage() {
  const { token } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [rating, setRating] = useState<string>("5")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const eventId = params.id as string

  useEffect(() => {
    const fetchEventAndFeedback = async () => {
      try {
        // Fetch event details
        const eventResponse = await fetch(`/api/event/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!eventResponse.ok) {
          throw new Error("Failed to fetch event details")
        }

        const eventData = await eventResponse.json()
        setEvent(eventData)

        // If user has already submitted feedback, fetch it
        if (eventData.hasFeedback) {
          const feedbackResponse = await fetch(`/api/feedback/${eventId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (feedbackResponse.ok) {
            const feedbackData = await feedbackResponse.json()
            setFeedback(feedbackData)
            setRating(feedbackData.rating.toString())
            setComment(feedbackData.comment)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventAndFeedback()
  }, [eventId, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/feedback/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number.parseInt(rating),
          comment,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit feedback")
      }

      const data = await response.json()
      setFeedback(data)

      // Update the event data to reflect feedback submission
      setEvent((prev) => {
        if (!prev) return null
        return {
          ...prev,
          hasFeedback: true,
        }
      })

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      })
    } catch (error) {
      toast({
        title: "Failed to submit feedback",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button asChild>
          <Link href="/feedback">Back to Feedback</Link>
        </Button>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-xl font-medium mb-4">Event not found</p>
        <Button asChild>
          <Link href="/feedback">Back to Feedback</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-4">{feedback ? "Your Feedback" : "Provide Feedback"}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>
            {feedback ? "Your feedback has been recorded" : "Share your thoughts about this event"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              <span>Date: {formatDate(event.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 opacity-70" />
              <span>Time: {event.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 opacity-70" />
              <span>Location: {event.location}</span>
            </div>
          </div>

          {feedback ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Your Rating</h3>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= feedback.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Your Comment</h3>
                <p className="text-muted-foreground">{feedback.comment}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <RadioGroup value={rating} onValueChange={setRating} className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex items-center space-x-1">
                        <RadioGroupItem value={value.toString()} id={`rating-${value}`} className="sr-only" />
                        <Label htmlFor={`rating-${value}`} className="cursor-pointer rounded-md p-2 hover:bg-muted">
                          <Star
                            className={`h-5 w-5 ${
                              Number.parseInt(rating) >= value
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this event"
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/feedback">Back to Feedback</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

