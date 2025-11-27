const NotificationService = require('./src/services/notificationService').default;

async function testNotifications() {
  console.log('Testing Notification Service...');
  
  // Clear existing notifications
  await NotificationService.clearAllNotifications();
  console.log('Cleared existing notifications');
  
  // Add a test notification
  await NotificationService.addNotification({
    title: 'Test Notification',
    body: 'This is a test notification',
    type: 'general'
  });
  console.log('Added test notification');
  
  // Get all notifications
  const notifications = await NotificationService.getAllNotifications();
  console.log('Retrieved notifications:', notifications.length);
  
  // Check unread count
  const unreadCount = await NotificationService.getUnreadCount();
  console.log('Unread count:', unreadCount);
  
  // Mark as read
  if (notifications.length > 0) {
    await NotificationService.markAsRead(notifications[0].id);
    console.log('Marked notification as read');
  }
  
  // Check unread count again
  const unreadCountAfter = await NotificationService.getUnreadCount();
  console.log('Unread count after marking read:', unreadCountAfter);
  
  // Add another notification
  await NotificationService.addNotification({
    title: 'Trip Reminder',
    body: 'Your trip to Paris starts tomorrow!',
    type: 'reminder',
    tripId: 'trip-123'
  });
  console.log('Added trip reminder');
  
  // Get final notifications
  const finalNotifications = await NotificationService.getAllNotifications();
  console.log('Final notifications count:', finalNotifications.length);
  
  console.log('Test completed successfully!');
}

testNotifications().catch(console.error);