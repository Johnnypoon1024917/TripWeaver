import React, { useState  from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
 from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch  from 'react-redux';
import { RootState  from '../store';
import { addCollaborator, removeCollaborator  from '../store/slices/tripsSlice';
import { colors, spacing, typography, shadows  from '../utils/theme';

interface Collaborator {
  userId: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  displayName?: string;
  status: 'pending' | 'accepted';


export default function CollaboratorsScreen({ route, navigation : any) {
  const { tripId  = route.params;
  const dispatch = useDispatch();
  const trip = useSelector((state: RootState) =>
    state.trips.items.find((t) => t.id === tripId)
  );
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      userId: currentUser?.id || '',
      email: currentUser?.email || '',
      displayName: currentUser?.displayName || '',
      role: 'owner',
      status: 'accepted',
    ,
  ]);

  const handleInvite = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    

    if (collaborators.some((c) => c.email === email)) {
      Alert.alert('Error', 'This user is already invited');
      return;
    

    const newCollaborator: Collaborator = {
      userId: 'pending_' + Date.now(),
      email,
      role: selectedRole,
      status: 'pending',
    ;

    setCollaborators([...collaborators, newCollaborator]);
    dispatch(addCollaborator({ tripId, collaboratorEmail: email, role: selectedRole ));
    setEmail('');
    Alert.alert('Success', `Invitation sent to ${email`);
  ;

  const handleRemoveCollaborator = (userId: string) => {
    Alert.alert(
      'Remove Collaborator',
      'Are you sure you want to remove this collaborator?',
      [
        { text: 'Cancel', style: 'cancel' ,
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setCollaborators(collaborators.filter((c) => c.userId !== userId));
            dispatch(removeCollaborator({ tripId, userId ));
          ,
        ,
      ]
    );
  ;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return colors.primary;
      case 'editor':
        return colors.secondary;
      case 'viewer':
        return colors.textSecondary;
      default:
        return colors.textLight;
    
  ;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return '👑';
      case 'editor':
        return '✏️';
      case 'viewer':
        return '👁️';
      default:
        return '👤';
    
  ;

  return (
    <View style={styles.container>
      <LinearGradient
        colors={[colors.primary, colors.gradientEnd]
        style={styles.header
      >
        <Text style={styles.headerTitle>Collaborators</Text>
        <Text style={styles.headerSubtitle>{trip?.title</Text>
      </LinearGradient>

      <View style={styles.inviteSection>
        <Text style={styles.sectionTitle>Invite People</Text>
        
        <TextInput
          style={styles.input
          placeholder="Enter email address"
          placeholderTextColor={colors.textLight
          value={email
          onChangeText={setEmail
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.roleSelector>
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === 'editor' && styles.roleButtonActive,
            ]
            onPress={() => setSelectedRole('editor')
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === 'editor' && styles.roleButtonTextActive,
              ]
            >
              ✏️ Can Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === 'viewer' && styles.roleButtonActive,
            ]
            onPress={() => setSelectedRole('viewer')
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === 'viewer' && styles.roleButtonTextActive,
              ]
            >
              👁️ Can View
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleInvite>
          <LinearGradient
            colors={[colors.primary, colors.gradientEnd]
            style={styles.inviteButton
            start={{ x: 0, y: 0 
            end={{ x: 1, y: 0 
          >
            <Text style={styles.inviteButtonText>Send Invitation</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.listSection>
        <Text style={styles.sectionTitle>
          Current Members ({collaborators.length)
        </Text>

        <FlatList
          data={collaborators
          keyExtractor={(item) => item.userId
          renderItem={({ item ) => (
            <View style={styles.collaboratorItem>
              <View style={styles.collaboratorLeft>
                <View style={styles.avatar>
                  <Text style={styles.avatarText>
                    {item.displayName?.charAt(0).toUpperCase() || item.email.charAt(0).toUpperCase()
                  </Text>
                </View>
                <View style={styles.collaboratorInfo>
                  <Text style={styles.collaboratorName>
                    {item.displayName || item.email
                  </Text>
                  {item.displayName && (
                    <Text style={styles.collaboratorEmail>{item.email</Text>
                  )
                  <View style={styles.roleTag>
                    <Text style={styles.roleIcon>{getRoleIcon(item.role)</Text>
                    <Text
                      style={[
                        styles.roleText,
                        { color: getRoleColor(item.role) ,
                      ]
                    >
                      {item.role.toUpperCase()
                    </Text>
                    {item.status === 'pending' && (
                      <Text style={styles.pendingBadge>• Pending</Text>
                    )
                  </View>
                </View>
              </View>

              {item.role !== 'owner' && (
                <TouchableOpacity
                  onPress={() => handleRemoveCollaborator(item.userId)
                  style={styles.removeButton
                >
                  <Text style={styles.removeButtonText>Remove</Text>
                </TouchableOpacity>
              )
            </View>
          )
        />
      </View>
    </View>
  );


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  ,
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  ,
  headerTitle: {
    ...typography.h1,
    color: colors.surface,
    marginBottom: spacing.xs,
  ,
  headerSubtitle: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
  ,
  inviteSection: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    ...shadows.md,
  ,
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  ,
  input: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  ,
  roleSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  ,
  roleButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  ,
  roleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  ,
  roleButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  ,
  roleButtonTextActive: {
    color: colors.primary,
  ,
  inviteButton: {
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.sm,
  ,
  inviteButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  ,
  listSection: {
    flex: 1,
    backgroundColor: colors.surface,
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: 12,
    ...shadows.md,
  ,
  collaboratorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  ,
  collaboratorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  ,
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  ,
  avatarText: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '700',
  ,
  collaboratorInfo: {
    flex: 1,
  ,
  collaboratorName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  ,
  collaboratorEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  ,
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  ,
  roleIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  ,
  roleText: {
    ...typography.small,
    fontWeight: '700',
  ,
  pendingBadge: {
    ...typography.small,
    color: colors.warning,
    marginLeft: spacing.sm,
  ,
  removeButton: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  ,
  removeButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  ,
);
