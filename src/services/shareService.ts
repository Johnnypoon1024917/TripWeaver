import { Trip } from '../types';

interface ShareOptions {
  title: string;
  message: string;
  url?: string;
  subject?: string;
}

class ShareService {
  /**
   * Generate shareable link for trip
   */
  generateShareLink(tripId: string): string {
    const baseUrl = process.env.APP_URL || 'https://tripweaver.app';
    return `${baseUrl}/trip/${tripId}`;
  }

  /**
   * Share trip via native share dialog
   */
  async shareTrip(trip: Trip): Promise<boolean> {
    const shareUrl = this.generateShareLink(trip.id);
    const message = `Check out my trip to ${trip.destination}!\n\n${trip.title}\n${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`;

    const options: ShareOptions = {
      title: trip.title,
      message: message,
      url: shareUrl,
      subject: `Trip Invitation: ${trip.title}`,
    };

    try {
      // For web
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: options.title,
          text: options.message,
          url: options.url,
        });
        return true;
      }

      // Fallback: Copy to clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${message}\n\n${shareUrl}`);
        alert('Link copied to clipboard!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Share error:', error);
      return false;
    }
  }

  /**
   * Share via WhatsApp
   */
  shareViaWhatsApp(trip: Trip): void {
    const shareUrl = this.generateShareLink(trip.id);
    const message = encodeURIComponent(
      `Check out my trip to ${trip.destination}! ${trip.title}\n${shareUrl}`
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;

    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }
  }

  /**
   * Share via Email
   */
  shareViaEmail(trip: Trip): void {
    const shareUrl = this.generateShareLink(trip.id);
    const subject = encodeURIComponent(`Trip Invitation: ${trip.title}`);
    const body = encodeURIComponent(
      `Hi!

I'd like to share my trip with you:

${trip.title}
Destination: ${trip.destination}
Dates: ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}

${trip.description || ''}

View and collaborate: ${shareUrl}

Best regards`
    );

    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

    if (typeof window !== 'undefined') {
      window.location.href = mailtoUrl;
    }
  }

  /**
   * Generate QR code data URL
   */
  async generateQRCode(tripId: string): Promise<string> {
    const shareUrl = this.generateShareLink(tripId);
    
    // In a real implementation, use a QR code library
    // For now, return a placeholder or use an API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;
    
    return qrApiUrl;
  }

  /**
   * Copy trip link to clipboard
   */
  async copyLink(trip: Trip): Promise<boolean> {
    const shareUrl = this.generateShareLink(trip.id);

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Copy error:', error);
      return false;
    }
  }
}

export const shareService = new ShareService();
export default shareService;
