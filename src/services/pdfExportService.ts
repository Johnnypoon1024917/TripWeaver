import { Platform } from 'react-native';
import { Trip, Destination } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { colors } from '../utils/theme';

// Helper function to ensure we have proper Date objects
const ensureDate = (date: Date | string): Date => {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
};

export const pdfExportService = {
  exportTripItinerary: async (trip: Trip, destinations: Destination[]) => {
    const doc = new jsPDF();
    
    // Ensure dates are proper Date objects
    const startDate = ensureDate(trip.startDate);
    const endDate = ensureDate(trip.endDate);
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(colors.primary);
    doc.text(trip.title, 20, 20);
    
    // Add trip details
    doc.setFontSize(12);
    doc.setTextColor('#000000');
    doc.text(`Destination: ${trip.destination}`, 20, 35);
    doc.text(`Duration: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 20, 45);
    
    // Add destinations table
    autoTable(doc, {
      startY: 55,
      head: [['Day', 'Place', 'Address', 'Time', 'Notes']],
      body: destinations.map(dest => [
        `Day ${dest.dayNumber}`,
        dest.name,
        dest.address,
        dest.startTime || '',
        dest.notes || ''
      ]),
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: colors.primary,
      },
    });
    
    // Save the PDF
    doc.save(`${trip.title}_Itinerary.pdf`);
  },
};
