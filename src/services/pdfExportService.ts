import { Trip, Destination, DayItinerary } from '../types';

interface PDFData {
  trip: Trip;
  itinerary: DayItinerary[];
  totalPlaces: number;
  totalDays: number;
}

class PDFExportService {
  /**
   * Generate PDF from trip data
   */
  async generatePDF(data: PDFData): Promise<string> {
    // For web/mobile compatibility, generate HTML that can be converted to PDF
    const htmlContent = this.generateHTML(data);
    
    // In a real implementation, you would use a library like:
    // - react-native-html-to-pdf for mobile
    // - @react-pdf/renderer for cross-platform
    // - or send to backend for server-side PDF generation
    
    return htmlContent;
  }

  /**
   * Generate HTML content for PDF
   */
  private generateHTML(data: PDFData): string {
    const { trip, itinerary, totalPlaces, totalDays } = data;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${trip.title} - Trip Itinerary</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 30px 0;
              border-bottom: 3px solid #FF6B9D;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              color: #FF6B9D;
              font-size: 32px;
            }
            .trip-info {
              display: flex;
              justify-content: space-around;
              margin: 20px 0;
              padding: 20px;
              background: #f8f9fd;
              border-radius: 8px;
            }
            .info-item {
              text-align: center;
            }
            .info-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
            }
            .info-value {
              font-size: 18px;
              font-weight: bold;
              color: #FF6B9D;
            }
            .day-section {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .day-header {
              background: linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%);
              color: white;
              padding: 15px 20px;
              border-radius: 8px;
              margin-bottom: 15px;
            }
            .destination {
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              margin: 10px 0;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .destination-name {
              font-size: 18px;
              font-weight: bold;
              color: #1a1a2e;
              margin-bottom: 8px;
            }
            .destination-address {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 8px;
            }
            .destination-time {
              font-size: 14px;
              color: #FF6B9D;
              margin-bottom: 8px;
            }
            .destination-notes {
              font-size: 14px;
              color: #666;
              font-style: italic;
              padding: 10px;
              background: #f8f9fd;
              border-radius: 4px;
              margin-top: 10px;
            }
            .category-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              margin-right: 8px;
            }
            .category-restaurant { background: #fecaca; color: #7f1d1d; }
            .category-attraction { background: #fed7aa; color: #78350f; }
            .category-hotel { background: #ddd6fe; color: #5b21b6; }
            .category-shopping { background: #fbcfe8; color: #831843; }
            .category-activity { background: #bbf7d0; color: #14532d; }
            .footer {
              text-align: center;
              padding: 30px 0;
              margin-top: 50px;
              border-top: 2px solid #e5e7eb;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              .day-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${trip.title}</h1>
            <p style="font-size: 16px; color: #666; margin: 10px 0;">
              ${trip.destination}
            </p>
            <p style="font-size: 14px; color: #999;">
              ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}
            </p>
          </div>

          <div class="trip-info">
            <div class="info-item">
              <div class="info-label">Total Days</div>
              <div class="info-value">${totalDays}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Total Places</div>
              <div class="info-value">${totalPlaces}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Destinations</div>
              <div class="info-value">${itinerary.length}</div>
            </div>
          </div>

          ${trip.description ? `
            <div style="margin: 20px 0; padding: 20px; background: #f8f9fd; border-radius: 8px;">
              <p style="margin: 0; color: #666;">${trip.description}</p>
            </div>
          ` : ''}

          ${itinerary.map((day) => `
            <div class="day-section">
              <div class="day-header">
                <h2 style="margin: 0; font-size: 20px;">
                  Day ${day.dayNumber} - ${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">
                  ${day.destinations.length} destination${day.destinations.length !== 1 ? 's' : ''}
                </p>
              </div>

              ${day.destinations.length === 0 ? `
                <p style="text-align: center; color: #999; padding: 20px;">
                  No destinations planned for this day
                </p>
              ` : day.destinations.map((dest, index) => `
                <div class="destination">
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                      <div class="destination-name">
                        ${index + 1}. ${dest.name}
                      </div>
                      <div class="destination-address">
                        📍 ${dest.address}
                      </div>
                      ${dest.startTime ? `
                        <div class="destination-time">
                          🕓 ${dest.startTime}${dest.endTime ? ` - ${dest.endTime}` : ''}
                          ${dest.duration ? ` (${dest.duration})` : ''}
                        </div>
                      ` : ''}
                      <div style="margin-top: 8px;">
                        <span class="category-badge category-${dest.category}">
                          ${this.getCategoryIcon(dest.category)} ${dest.category}
                        </span>
                        ${dest.cost ? `
                          <span style="color: #10b981; font-weight: 600; font-size: 14px;">
                            💵 $${dest.cost}
                          </span>
                        ` : ''}
                      </div>
                      ${dest.notes ? `
                        <div class="destination-notes">
                          📝 ${dest.notes}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')}

          <div class="footer">
            <p>Generated by TripWeaver on ${new Date().toLocaleDateString()}</p>
            <p>Happy Travels! ✈️🌍</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get category icon
   */
  private getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      restaurant: '🍽️',
      attraction: '🏛️',
      hotel: '🏨',
      shopping: '🛍️',
      transport: '🚆',
      activity: '⛷️',
      other: '📍',
    };
    return icons[category] || icons.other;
  }

  /**
   * Share PDF (platform-specific)
   */
  async sharePDF(htmlContent: string, tripTitle: string): Promise<void> {
    // Platform-specific implementation would go here
    // For web: Download as HTML or convert to PDF using browser print
    // For mobile: Use react-native-share
    
    if (typeof window !== 'undefined') {
      // Web implementation
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tripTitle.replace(/[^a-z0-9]/gi, '_')}_itinerary.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Print PDF
   */
  async printPDF(htmlContent: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    }
  }
}

export const pdfExportService = new PDFExportService();
export default pdfExportService;
