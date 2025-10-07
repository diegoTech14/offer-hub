'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Timeline, TimelineEvent, Milestone } from '@/types/application-form.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  Target,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

interface TimelinePlannerProps {
  timeline: Partial<Timeline>;
  milestones?: Milestone[];
  onChange: (timeline: Timeline) => void;
  className?: string;
}

type EventType = 'milestone' | 'task' | 'review' | 'delivery';

const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'milestone', label: 'Milestone', color: 'bg-blue-500' },
  { value: 'task', label: 'Task', color: 'bg-green-500' },
  { value: 'review', label: 'Review', color: 'bg-yellow-500' },
  { value: 'delivery', label: 'Delivery', color: 'bg-purple-500' },
];

export function TimelinePlanner({
  timeline,
  milestones = [],
  onChange,
  className = '',
}: TimelinePlannerProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    timeline.startDate ? new Date(timeline.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    timeline.endDate ? new Date(timeline.endDate) : undefined
  );
  const [events, setEvents] = useState<TimelineEvent[]>(timeline.events || []);
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState(
    timeline.workingDaysPerWeek || 5
  );
  const [bufferTime, setBufferTime] = useState(timeline.bufferTime || 10);

  const totalDuration = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate);
  }, [startDate, endDate]);

  const updateTimeline = useCallback(() => {
    if (!startDate || !endDate) return;

    const newTimeline: Timeline = {
      startDate,
      endDate,
      totalDuration,
      events,
      workingDaysPerWeek,
      bufferTime,
      holidays: timeline.holidays || [],
    };

    onChange(newTimeline);
  }, [startDate, endDate, totalDuration, events, workingDaysPerWeek, bufferTime, timeline.holidays, onChange]);

  useEffect(() => {
    updateTimeline();
  }, [updateTimeline]);

  const addEvent = useCallback(() => {
    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      title: '',
      description: '',
      startDate: startDate || new Date(),
      endDate: addDays(startDate || new Date(), 7),
      type: 'task',
    };
    setEvents([...events, newEvent]);
  }, [events, startDate]);

  const updateEvent = useCallback(
    (index: number, updates: Partial<TimelineEvent>) => {
      const newEvents = [...events];
      newEvents[index] = { ...newEvents[index], ...updates };
      setEvents(newEvents);
    },
    [events]
  );

  const removeEvent = useCallback(
    (index: number) => {
      setEvents(events.filter((_, i) => i !== index));
    },
    [events]
  );

  const linkMilestone = useCallback(
    (eventIndex: number, milestoneId: string) => {
      const milestone = milestones.find((m) => m.id === milestoneId);
      if (!milestone) return;

      updateEvent(eventIndex, {
        milestoneId,
        title: milestone.title,
        description: milestone.description,
        type: 'milestone',
      });
    },
    [milestones, updateEvent]
  );

  const calculateEndDateFromDuration = useCallback(
    (start: Date, durationDays: number) => {
      // Calculate working days based on workingDaysPerWeek
      const workingDaysRatio = workingDaysPerWeek / 7;
      const calendarDays = Math.ceil(durationDays / workingDaysRatio);
      return addDays(start, calendarDays);
    },
    [workingDaysPerWeek]
  );

  const autoGenerateTimeline = useCallback(() => {
    if (!startDate || milestones.length === 0) return;

    const newEvents: TimelineEvent[] = [];
    let currentDate = startDate;

    milestones.forEach((milestone, index) => {
      const eventStartDate = currentDate;
      const eventEndDate = calculateEndDateFromDuration(currentDate, milestone.duration);

      newEvents.push({
        id: `event-milestone-${milestone.id}`,
        title: milestone.title,
        description: milestone.description,
        startDate: eventStartDate,
        endDate: eventEndDate,
        type: 'milestone',
        milestoneId: milestone.id,
      });

      // Add buffer time between milestones
      if (index < milestones.length - 1) {
        const bufferDays = Math.ceil(milestone.duration * (bufferTime / 100));
        currentDate = addDays(eventEndDate, bufferDays);
      } else {
        currentDate = eventEndDate;
      }
    });

    setEvents(newEvents);
    setEndDate(currentDate);
  }, [startDate, milestones, bufferTime, calculateEndDateFromDuration]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [events]);

  const getEventTypeStyle = (type: EventType) => {
    return EVENT_TYPES.find((t) => t.value === type)?.color || 'bg-gray-500';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Project Timeline</h2>
        <p className="text-muted-foreground">
          Define your project schedule and milestones
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className='hover:scale-100 hover:shadow-none border'>
          <CardHeader>
            <CardTitle className="text-base">Start Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:scale-100 hover:shadow-none text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <Card className='hover:scale-100 hover:shadow-none border'>
          <CardHeader>
            <CardTitle className="text-base">End Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:scale-100 hover:shadow-none text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => setEndDate(date)}
                  disabled={(date) => startDate ? date < startDate : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <Card className='hover:scale-100 hover:shadow-none border'>
          <CardHeader>
            <CardTitle className="text-base">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalDuration}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            {totalDuration > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                ~{Math.ceil(totalDuration / 7)} weeks
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className='hover:scale-100 hover:shadow-none border'>
        <CardHeader>
          <CardTitle className="text-base">Timeline Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="workingDays">Working Days per Week</Label>
              <Select
                value={workingDaysPerWeek.toString()}
                onValueChange={(v) => setWorkingDaysPerWeek(parseInt(v))}
              >
                <SelectTrigger id="workingDays">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 days (Mon-Fri)</SelectItem>
                  <SelectItem value="6">6 days</SelectItem>
                  <SelectItem value="7">7 days (Full week)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bufferTime">Buffer Time (%)</Label>
              <Input
                id="bufferTime"
                type="number"
                value={bufferTime}
                onChange={(e) => setBufferTime(parseInt(e.target.value) || 0)}
                min="0"
                max="50"
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                Extra time between milestones
              </p>
            </div>
          </div>

          {milestones.length > 0 && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={autoGenerateTimeline}
            >
              <Target className="mr-2 h-4 w-4" />
              Auto-Generate from Milestones
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className='hover:scale-100 hover:shadow-none border'>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Timeline Events</CardTitle>
              <CardDescription>
                Add tasks, reviews, and deliveries to your timeline
              </CardDescription>
            </div>
            <Button type="button" onClick={addEvent} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                No events added yet. Add events to visualize your project timeline.
              </p>
              {milestones.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Use "Auto-Generate from Milestones" to quickly create a timeline
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Timeline Visualization */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-4">
                  {sortedEvents.map((event, index) => {
                    const eventDuration = differenceInDays(
                      new Date(event.endDate),
                      new Date(event.startDate)
                    );

                    return (
                      <div key={event.id} className="relative pl-10">
                        <div
                          className={`absolute left-2 top-3 h-4 w-4 rounded-full ${getEventTypeStyle(
                            event.type
                          )} border-2 border-background`}
                        />
                        <Card>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{event.type}</Badge>
                                  {event.milestoneId && (
                                    <Badge variant="secondary">
                                      <Target className="mr-1 h-3 w-3" />
                                      Milestone
                                    </Badge>
                                  )}
                                </div>

                                <Input
                                  value={event.title}
                                  onChange={(e) =>
                                    updateEvent(index, { title: e.target.value })
                                  }
                                  placeholder="Event title"
                                  className="font-semibold"
                                />

                                <Textarea
                                  value={event.description}
                                  onChange={(e) =>
                                    updateEvent(index, { description: e.target.value })
                                  }
                                  placeholder="Event description"
                                  className="min-h-[60px]"
                                />

                                <div className="grid gap-2 md:grid-cols-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Type</Label>
                                    <Select
                                      value={event.type}
                                      onValueChange={(v) =>
                                        updateEvent(index, { type: v as EventType })
                                      }
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {EVENT_TYPES.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1">
                                    <Label className="text-xs">Start Date</Label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className="h-8 w-full justify-start text-left font-normal"
                                          size="sm"
                                        >
                                          <CalendarIcon className="mr-2 h-3 w-3" />
                                          {format(new Date(event.startDate), 'MMM dd')}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <Calendar
                                          mode="single"
                                          selected={new Date(event.startDate)}
                                          onSelect={(date) =>
                                            date && updateEvent(index, { startDate: date })
                                          }
                                          disabled={(date) =>
                                            startDate ? date < startDate : false
                                          }
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>

                                  <div className="space-y-1">
                                    <Label className="text-xs">End Date</Label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className="h-8 w-full justify-start text-left font-normal"
                                          size="sm"
                                        >
                                          <CalendarIcon className="mr-2 h-3 w-3" />
                                          {format(new Date(event.endDate), 'MMM dd')}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <Calendar
                                          mode="single"
                                          selected={new Date(event.endDate)}
                                          onSelect={(date) =>
                                            date && updateEvent(index, { endDate: date })
                                          }
                                          disabled={(date) =>
                                            date < new Date(event.startDate)
                                          }
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{eventDuration} days</span>
                                </div>

                                {milestones.length > 0 && (
                                  <div className="space-y-1">
                                    <Label className="text-xs">Link to Milestone</Label>
                                    <Select
                                      value={event.milestoneId || 'none'}
                                      onValueChange={(v) =>
                                        v !== 'none' && linkMilestone(index, v)
                                      }
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="None" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {milestones.map((milestone) => (
                                          <SelectItem key={milestone.id} value={milestone.id}>
                                            {milestone.title}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEvent(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline Summary */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm">Timeline Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Events:</span>
                    <span className="font-medium">{events.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Milestones:</span>
                    <span className="font-medium">
                      {events.filter((e) => e.type === 'milestone').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tasks:</span>
                    <span className="font-medium">
                      {events.filter((e) => e.type === 'task').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>

      {!startDate && (
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 hover:scale-100 hover:shadow-none border">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Start date required
                </p>
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  Please set a start date to begin planning your timeline
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

