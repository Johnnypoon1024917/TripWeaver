import { Platform  from 'react-native';
import { Trip  from '../types';

// Helper function to ensure we have proper Date objects
const ensureDate = (date: Date | string): Date => {
  if (date instanceof Date) {
    return date;
  
  return new Date(date);
;

export class PrintService {
  static async printItinerary(trip: Trip, htmlContent: string) {
    if (Platform.OS === 'web') {
      // Web implementation
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Ensure dates are proper Date objects
        const startDate = ensureDate(trip.startDate);
        const endDate = ensureDate(trip.endDate);
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${trip.title - Itinerary</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; 
              .header { text-align: center; margin-bottom: 30px; 
              .trip-info { margin-bottom: 20px; 
              .section { margin-bottom: 20px; 
              .day-header { background-color: #f0f0f0; padding: 10px; margin: 10px 0; 
              table { width: 100%; border-collapse: collapse; margin: 10px 0; 
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; 
              th { background-color: #f2f2f2; 
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${trip.title</h1>
              <p class="trip-info"><strong>Destination:</strong> ${trip.destination</p>
              <p class="trip-info"><strong>Dates:</strong> ${startDate.toLocaleDateString() - ${endDate.toLocaleDateString()</p>
            </div>
            ${htmlContent
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      
    
      // Mobile implementation would use a native printing library
      console.log('Print functionality not implemented for mobile');
    
  
