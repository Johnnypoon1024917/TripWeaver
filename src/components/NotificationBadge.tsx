import React from 'react';
import { View, Text, StyleSheet  from 'react-native';
import { useSelector  from 'react-redux';
import { RootState  from '../store';

interface NotificationBadgeProps {
  size?: 'small' | 'large';


const NotificationBadge: React.FC<NotificationBadgeProps> = ({ size = 'small' ) => {
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);

  if (unreadCount === 0) {
    return null;
  

  return (
    <View style={[styles.badge, size === 'large' && styles.largeBadge]>
      <Text style={[styles.count, size === 'large' && styles.largeCount]>
        {unreadCount > 99 ? '99+' : unreadCount
      </Text>
    </View>
  );
;

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -8,
    right: -8,
  ,
  largeBadge: {
    minWidth: 24,
    height: 24,
    top: -10,
    right: -10,
  ,
  count: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  ,
  largeCount: {
    fontSize: 14,
  ,
);

export default NotificationBadge;