import NotificationService from '../notificationService';
describe('NotificationService', () => {
    beforeEach(async () => {
        // Clear all notifications before each test
        await NotificationService.clearAllNotifications();
    });
    it('should add a notification', async () => {
        const notification = {
            title: 'Test Notification',
            body: 'This is a test notification',
            type: 'general',
        };
        await NotificationService.addNotification(notification);
        const notifications = await NotificationService.getAllNotifications();
        expect(notifications).toHaveLength(1);
        expect(notifications[0].title).toBe('Test Notification');
        expect(notifications[0].body).toBe('This is a test notification');
        expect(notifications[0].type).toBe('general');
        expect(notifications[0].read).toBe(false);
        expect(notifications[0]).toHaveProperty('id');
        expect(notifications[0]).toHaveProperty('timestamp');
    });
    it('should mark a notification as read', async () => {
        const notification = {
            title: 'Test Notification',
            body: 'This is a test notification',
            type: 'general',
        };
        await NotificationService.addNotification(notification);
        let notifications = await NotificationService.getAllNotifications();
        const notificationId = notifications[0].id;
        await NotificationService.markAsRead(notificationId);
        notifications = await NotificationService.getAllNotifications();
        expect(notifications[0].read).toBe(true);
    });
    it('should mark all notifications as read', async () => {
        const notification1 = {
            title: 'Test Notification 1',
            body: 'This is test notification 1',
            type: 'general',
        };
        const notification2 = {
            title: 'Test Notification 2',
            body: 'This is test notification 2',
            type: 'general',
        };
        await NotificationService.addNotification(notification1);
        await NotificationService.addNotification(notification2);
        await NotificationService.markAllAsRead();
        const notifications = await NotificationService.getAllNotifications();
        expect(notifications[0].read).toBe(true);
        expect(notifications[1].read).toBe(true);
    });
    it('should delete a notification', async () => {
        const notification = {
            title: 'Test Notification',
            body: 'This is a test notification',
            type: 'general',
        };
        await NotificationService.addNotification(notification);
        let notifications = await NotificationService.getAllNotifications();
        const notificationId = notifications[0].id;
        await NotificationService.deleteNotification(notificationId);
        notifications = await NotificationService.getAllNotifications();
        expect(notifications).toHaveLength(0);
    });
    it('should clear all notifications', async () => {
        const notification1 = {
            title: 'Test Notification 1',
            body: 'This is test notification 1',
            type: 'general',
        };
        const notification2 = {
            title: 'Test Notification 2',
            body: 'This is test notification 2',
            type: 'general',
        };
        await NotificationService.addNotification(notification1);
        await NotificationService.addNotification(notification2);
        await NotificationService.clearAllNotifications();
        const notifications = await NotificationService.getAllNotifications();
        expect(notifications).toHaveLength(0);
    });
    it('should get unread count', async () => {
        const notification1 = {
            title: 'Test Notification 1',
            body: 'This is test notification 1',
            type: 'general',
        };
        const notification2 = {
            title: 'Test Notification 2',
            body: 'This is test notification 2',
            type: 'general',
        };
        await NotificationService.addNotification(notification1);
        await NotificationService.addNotification(notification2);
        // Mark one as read
        let notifications = await NotificationService.getAllNotifications();
        await NotificationService.markAsRead(notifications[0].id);
        const unreadCount = await NotificationService.getUnreadCount();
        expect(unreadCount).toBe(1);
    });
    it('should schedule trip reminders', async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 2); // 2 days from now
        await NotificationService.scheduleTripReminders('test-trip-id', 'Test Trip', startDate);
        const notifications = await NotificationService.getAllNotifications();
        expect(notifications).toHaveLength(1);
        expect(notifications[0].title).toContain('Upcoming Trip');
    });
    it('should schedule budget alerts', async () => {
        await NotificationService.scheduleBudgetAlert('test-trip-id', 'Accommodation', 900, 1000);
        const notifications = await NotificationService.getAllNotifications();
        expect(notifications).toHaveLength(1);
        expect(notifications[0].title).toBe('Budget Alert');
    });
});
