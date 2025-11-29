// Added comment to trigger recompilation
import React, { useState  from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated  from 'react-native';
import { Ionicons  from 'react-native-vector-icons';
import { colors, spacing, typography  from '../utils/theme';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;


const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  expanded = false,
  onToggle,
) => {
  const [isOpen, setIsOpen] = useState(expanded);
  const animation = new Animated.Value(expanded ? 1 : 0);

  const toggleSection = () => {
    const newValue = !isOpen;
    setIsOpen(newValue);
    onToggle?.();
    
    Animated.timing(animation, {
      toValue: newValue ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    ).start();
  ;

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  );

  return (
    <View style={styles.container>
      <TouchableOpacity style={styles.header onPress={toggleSection>
        <Text style={styles.title>{title</Text>
        <Animated.View style={{ transform: [{ rotate: rotateIcon ] >
          <Ionicons name="chevron-down" size={20 color={colors.textSecondary />
        </Animated.View>
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.content>
          {children
        </View>
      )
    </View>
  );
;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  ,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  ,
  title: {
    ...typography.h3,
    color: colors.text,
  ,
  content: {
    marginTop: spacing.sm,
  ,
);

export default CollapsibleSection;