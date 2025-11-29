import NotificationService from '../services/notificationService';

export class NotificationUtils {
  // Trip-related notifications
  static async sendTripReminder(tripId: string, tripName: string, daysUntil: number): Promise<void> {
    let title = '';
    let body = '';
    
    if (daysUntil === 1) {
      title = 'Trip Reminder';
      body = `Your trip "${tripName" starts tomorrow!`;
     else if (daysUntil === 0) {
      title = 'Trip Starting Soon';
      body = `Your trip "${tripName" starts today!`;
    
      title = 'Upcoming Trip';
      body = `Your trip "${tripName" starts in ${daysUntil days.`;
    
    
    await NotificationService.addNotification({
      title,
      body,
      type: 'reminder',
      tripId,
    );
  

  // Budget-related notifications
  static async sendBudgetAlert(
    tripId: string, 
    categoryName: string, 
    spent: number, 
    budget: number
  ): Promise<void> {
    const percentage = (spent / budget) * 100;
    let title = '';
    let body = '';
    
    if (percentage >= 90) {
      title = 'Budget Alert';
      body = `You've spent ${percentage.toFixed(0)% of your ${categoryName budget!`;
     else if (percentage >= 75) {
      title = 'Budget Warning';
      body = `You've spent ${percentage.toFixed(0)% of your ${categoryName budget.`;
    
      // Don't send notification for lower percentages
      return;
    
    
    await NotificationService.addNotification({
      title,
      body,
      type: 'budget',
      tripId,
    );
  

  // Collaboration notifications
  static async sendCollaborationNotification(
    tripId: string,
    message: string,
    senderName: string
  ): Promise<void> {
    await NotificationService.addNotification({
      title: 'Collaboration Update',
      body: `${senderName: ${message`,
      type: 'collaboration',
      tripId,
    );
  

  // Weather notifications
  static async sendWeatherAlert(
    tripId: string,
    location: string,
    condition: string,
    severity: 'low' | 'medium' | 'high'
  ): Promise<void> {
    let title = '';
    let body = '';
    
    switch (severity) {
      case 'high':
        title = 'Severe Weather Alert';
        body = `Severe ${condition expected in ${location. Consider changing your plans.`;
        break;
      case 'medium':
        title = 'Weather Warning';
        body = `Moderate ${condition expected in ${location. Plan accordingly.`;
        break;
      case 'low':
      default:
        title = 'Weather Advisory';
        body = `Light ${condition expected in ${location.`;
        break;
    
    
    await NotificationService.addNotification({
      title,
      body,
      type: 'weather',
      tripId,
    );
  

  // General notifications
  static async sendGeneralNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    await NotificationService.addNotification({
      title,
      body,
      type: 'general',
      data,
    );
  
