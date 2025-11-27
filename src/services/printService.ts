import { Platform } from 'react-native';

export class PrintService {
  static async printDocument(htmlContent: string, title: string = 'Document') {
    if (Platform.OS === 'web') {
      // Create a hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-1000px';
      iframe.style.left = '-1000px';
      
      // Write content to iframe
      document.body.appendChild(iframe);
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
          </html>
        `);
        iframeDoc.close();
        
        // Wait for content to load then print
        iframe.onload = () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          // Clean up
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        };
      }
    } else {
      // For mobile, we would use a native printing solution
      console.log('Print service not implemented for mobile');
    }
  }
  
  static async printTripItinerary(trip: any, itinerary: any[]) {
    if (Platform.OS === 'web') {
      // Generate HTML content for trip itinerary
      let htmlContent = `
        <h1>${trip.title}</h1>
        <p><strong>Destination:</strong> ${trip.destination}</p>
        <p><strong>Dates:</strong> ${trip.startDate.toLocaleDateString()} - ${trip.endDate.toLocaleDateString()}</p>
        <hr>
        <h2>Itinerary</h2>
      `;
      
      itinerary.forEach((day: any) => {
        htmlContent += `<h3>Day ${day.dayNumber}</h3><ul>`;
        day.destinations.forEach((dest: any) => {
          htmlContent += `<li>${dest.name}<br><small>${dest.address}</small></li>`;
        });
        htmlContent += `</ul>`;
      });
      
      return this.printDocument(htmlContent, `${trip.title} Itinerary`);
    } else {
      console.log('Print service not implemented for mobile');
    }
  }
}

export default PrintService;