'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  platform: string;
  status: string;
  ticketsSold: number;
  totalRevenue: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();

      // Check if data is an array or an error response
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.error('API error:', data);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'ALL') return true;
    if (filter === 'UPCOMING') return event.status === 'UPCOMING';
    if (filter === 'COMPLETED') return event.status === 'COMPLETED';
    return event.platform === filter;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'revenue') {
      return b.totalRevenue - a.totalRevenue;
    }
    if (sortBy === 'tickets') {
      return b.ticketsSold - a.ticketsSold;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="apple-card">
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="container mx-auto p-8 animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Events
        </h1>
        <p className="text-white/60">
          Manage and track your event portfolio
        </p>
      </div>

      {/* Filters Bar */}
      <div className="mb-8">
        <Card className="apple-card border-white/5">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                    <SelectValue placeholder="Filter events" />
                  </SelectTrigger>
                  <SelectContent className="bg-system-gray-800 border-white/10">
                    <SelectItem value="ALL">All Events</SelectItem>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="HUMANITIX">Humanitix</SelectItem>
                    <SelectItem value="RESIDENT_ADVISOR">Resident Advisor</SelectItem>
                    <SelectItem value="MOSHTIX">Moshtix</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-system-gray-800 border-white/10">
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="tickets">Tickets Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-white">
                    {sortedEvents.length}
                  </p>
                  <p className="text-xs text-white/40 uppercase tracking-wider mt-1">
                    Total
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-system-blue">
                    {sortedEvents.filter(e => e.status === 'UPCOMING').length}
                  </p>
                  <p className="text-xs text-white/40 uppercase tracking-wider mt-1">
                    Upcoming
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      {sortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEvents.map((event, index) => {
            const isUpcoming = event.status === 'UPCOMING';

            return (
              <Card
                key={event.id}
                className="apple-card border-white/5 hover:bg-white/[0.02] transition-all duration-200 overflow-hidden group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Card Header with Status */}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      className={`border-0 ${
                        isUpcoming
                          ? 'bg-system-blue/10 text-system-blue'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {event.status}
                    </Badge>
                    <span className="text-xs text-white/40">
                      {formatDate(event.date)}
                    </span>
                  </div>

                  {/* Event Name */}
                  <h3 className="text-lg font-semibold text-white leading-tight line-clamp-2">
                    {event.name}
                  </h3>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Venue and Platform */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-white/60 truncate">{event.venue}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-white/20 text-white/60 bg-transparent text-xs"
                    >
                      {event.platform.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                    <div>
                      <p className="text-xs text-white/40 mb-1">
                        Revenue
                      </p>
                      <p className="text-base font-semibold text-white">
                        ${event.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">
                        Tickets
                      </p>
                      <p className="text-base font-semibold text-white">
                        {event.ticketsSold.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="apple-card border-white/5 p-12">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-white/20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              No Events Found
            </h3>
            <p className="text-sm text-white/40 mb-6">
              Upload event data to populate the dashboard
            </p>
            <Button
              onClick={() => window.location.href = '/upload'}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload CSV
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}