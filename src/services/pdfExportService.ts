import { Platform } from 'react-native';
import { Trip, Destination, DayItinerary } from '../types';

// Web implementation using jsPDF
const exportToPDFWeb = async (trip: Trip, itinerary: DayItinerary[]) => {
  try {
    // Dynamically import jsPDF only on web
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Add trip title
    doc.setFontSize(22);
    doc.text(trip.title, 20, 20);
    
    // Add trip details
    doc.setFontSize(12);
    doc.text(`Destination: ${trip.destination}`, 20, 35);
    doc.text(`Duration: ${trip.startDate.toLocaleDateString()} - ${trip.endDate.toLocaleDateString()}`, 20, 45);
    
    // Add itinerary
    let yOffset = 60;
    itinerary.forEach((day, dayIndex) => {
      if (yOffset > 250) {
        doc.addPage();
        yOffset = 20;
      }
      
      doc.setFontSize(16);
      doc.text(`Day ${day.dayNumber}`, 20, yOffset);
      yOffset += 10;
      
      day.destinations.forEach((dest, destIndex) => {
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`${destIndex + 1}. ${dest.name}`, 30, yOffset);
        yOffset += 7;
        
        doc.setFontSize(10);
        doc.text(dest.address, 35, yOffset);
        yOffset += 10;
      });
      
      yOffset += 10;
    });
    
    // Save the PDF
    doc.save(`${trip.title}_Itinerary.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Failed to export PDF');
  }
};

// Mobile implementation using react-native-pdf-lib
const exportToPDFMobile = async (trip: Trip, itinerary: DayItinerary[]) => {
  // This would use react-native-pdf-lib on mobile
  console.log('PDF export for mobile not implemented yet');
  // Implementation would go here
};

export class PDFExportService {
  static async exportTripItinerary(trip: Trip, itinerary: DayItinerary[]) {
    if (Platform.OS === 'web') {
      return exportToPDFWeb(trip, itinerary);
    } else {
      return exportToPDFMobile(trip, itinerary);
    }
  }
  
  static async exportTravelJournal(trip: Trip, memories: any[]) {
    if (Platform.OS === 'web') {
      try {
        // Dynamically import jsPDF only on web
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(22);
        doc.text(`${trip.title} - Travel Journal`, 20, 20);
        
        // Add memories
        let yOffset = 40;
        memories.forEach((memory, index) => {
          if (yOffset > 250) {
            doc.addPage();
            yOffset = 20;
          }
          
          doc.setFontSize(16);
          doc.text(`Memory ${index + 1}`, 20, yOffset);
          yOffset += 10;
          
          doc.setFontSize(12);
          doc.text(memory.caption || '', 20, yOffset);
          yOffset += 10;
          
          // Add more memory details here
          yOffset += 15;
        });
        
        // Save the PDF
        doc.save(`${trip.title}_Journal.pdf`);
      } catch (error) {
        console.error('Error exporting journal PDF:', error);
        throw new Error('Failed to export journal PDF');
      }
    } else {
      console.log('PDF export for mobile not implemented yet');
    }
  }
}

export default PDFExportService;