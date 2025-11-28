// Helper function to ensure we have proper Date objects
const ensureDate = (date) => {
    if (date instanceof Date) {
        return date;
    }
    return new Date(date);
};
export class CalendarService {
    /**
     * Check if calendar permissions are granted
     */
    static async checkPermissions() {
        // This would be implemented differently for web vs mobile
        if (typeof window !== 'undefined' && 'Notification' in window) {
            // Web implementation
            return Notification.permission === 'granted';
        }
        // Mobile implementation would use platform-specific APIs
        console.log('Calendar permissions check not implemented for this platform');
        return false;
    }
    /**
     * Request calendar permissions
     */
    static async requestPermissions() {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            // Web implementation
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        // Mobile implementation would use platform-specific APIs
        console.log('Calendar permissions request not implemented for this platform');
        return false;
    }
    /**
     * Create calendar events for trip itinerary
     */
    static async createTripEvents(trip, itinerary) {
        try {
            // Check permissions first
            const hasPermission = await this.checkPermissions();
            if (!hasPermission) {
                const granted = await this.requestPermissions();
                if (!granted) {
                    throw new Error('Calendar permissions not granted');
                }
            }
            // Create events for each destination
            for (const day of itinerary) {
                for (const destination of day.destinations) {
                    await this.createEvent({
                        title: `${trip.title} - ${destination.name}`,
                        startDate: new Date(destination.startTime || day.date),
                        endDate: new Date(destination.endTime || day.date),
                        location: destination.address,
                        notes: destination.notes || `Trip to ${destination.name}`,
                    });
                }
            }
            return true;
        }
        catch (error) {
            console.error('Error creating trip events:', error);
            return false;
        }
    }
    /**
     * Create a single calendar event
     */
    static async createEvent(eventData) {
        try {
            if (typeof window !== 'undefined') {
                // Web implementation using Calendar API (if available)
                if ('calendar' in window) {
                    // @ts-ignore - Calendar API not fully typed
                    await window.calendar.createEvent({
                        title: eventData.title,
                        start: eventData.startDate,
                        end: eventData.endDate,
                        location: eventData.location,
                        description: eventData.notes,
                    });
                    return true;
                }
                else {
                    // Fallback: Show notification or alert
                    console.log('Calendar API not available, showing notification instead');
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Trip Event', {
                            body: `${eventData.title} on ${ensureDate(eventData.startDate).toLocaleDateString()}`,
                            icon: '/favicon.ico',
                        });
                    }
                    return true;
                }
            }
            // Mobile implementation would use platform-specific APIs
            console.log('Calendar event creation not implemented for this platform');
            return false;
        }
        catch (error) {
            console.error('Error creating calendar event:', error);
            return false;
        }
    }
    /**
     * Sync trip with Google Calendar
     */
    static async syncWithGoogleCalendar(trip, itinerary) {
        try {
            // This would require Google Calendar API integration
            // For now, we'll just log the intent
            console.log('Syncing trip with Google Calendar:', trip.title);
            // In a real implementation, this would:
            // 1. Authenticate with Google
            // 2. Create/update calendar events
            // 3. Handle conflicts and updates
            return true;
        }
        catch (error) {
            console.error('Error syncing with Google Calendar:', error);
            return false;
        }
    }
    /**
     * Export trip as iCalendar file
     */
    static async exportAsICalendar(trip, itinerary) {
        try {
            // Generate iCalendar content
            let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TripWeaver//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${trip.title}
X-WR-TIMEZONE:${Intl.DateTimeFormat().resolvedOptions().timeZone}
`;
            // Add events for each destination
            for (const day of itinerary) {
                for (const destination of day.destinations) {
                    const startDate = new Date(destination.startTime || day.date);
                    const endDate = new Date(destination.endTime || day.date);
                    // Format dates for iCalendar (YYYYMMDDTHHMMSS)
                    const formatDateTime = (date) => {
                        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
                    };
                    icsContent += `BEGIN:VEVENT
UID:${destination.id}@tripweaver
DTSTART:${formatDateTime(startDate)}
DTEND:${formatDateTime(endDate)}
SUMMARY:${trip.title} - ${destination.name}
LOCATION:${destination.address}
DESCRIPTION:${destination.notes || `Trip to ${destination.name}`}
END:VEVENT
`;
                }
            }
            icsContent += `END:VCALENDAR`;
            // Create and download file
            if (typeof window !== 'undefined') {
                const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${trip.title.replace(/\s+/g, '_')}_Itinerary.ics`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
            return true;
        }
        catch (error) {
            console.error('Error exporting as iCalendar:', error);
            return false;
        }
    }
}
export default CalendarService;
