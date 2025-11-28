import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Modal, ScrollView, Alert, ActivityIndicator, Dimensions, Animated, } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { colors, spacing, typography, shadows, borderRadius } from '../utils/theme';
const { width } = Dimensions.get('window');
export default function TravelJournalScreen() {
    const user = useSelector((state) => state.auth.user);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [postLocation, setPostLocation] = useState('');
    const [selectedTrip, setSelectedTrip] = useState('');
    // Animation values
    const modalSlideAnim = useRef(new Animated.Value(0)).current;
    const postAnimations = useRef(new Map()).current;
    useEffect(() => {
        loadPosts();
    }, []);
    // Animate modal when it opens/closes
    useEffect(() => {
        if (showCreatePost) {
            Animated.spring(modalSlideAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 65,
                friction: 8,
            }).start();
        }
        else {
            modalSlideAnim.setValue(0);
        }
    }, [showCreatePost]);
    const loadPosts = async () => {
        setLoading(true);
        try {
            // Mock data for now - will connect to backend later
            const mockPosts = [
                {
                    id: '1',
                    userId: '1',
                    userName: 'Sarah Johnson',
                    userAvatar: 'https://i.pravatar.cc/150?img=1',
                    tripTitle: 'Paris Adventure',
                    content: 'Just arrived at the Eiffel Tower! The view is absolutely breathtaking. Can\'t wait to explore more of this beautiful city. 🗼✨',
                    images: ['https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800'],
                    location: 'Paris, France',
                    likes: 234,
                    comments: 45,
                    isLiked: false,
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                },
                {
                    id: '2',
                    userId: '2',
                    userName: 'Mike Chen',
                    userAvatar: 'https://i.pravatar.cc/150?img=12',
                    tripTitle: 'Tokyo Food Journey',
                    content: 'Best ramen I\'ve ever had! This little shop in Shibuya is a hidden gem. The broth is so rich and flavorful. 🍜',
                    images: ['https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800'],
                    location: 'Tokyo, Japan',
                    likes: 567,
                    comments: 89,
                    isLiked: true,
                    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
                },
                {
                    id: '3',
                    userId: '3',
                    userName: 'Emma Wilson',
                    userAvatar: 'https://i.pravatar.cc/150?img=5',
                    content: 'Sunset at Santorini never gets old. Every evening brings a new painting in the sky. Grateful for these moments. 🌅',
                    images: [
                        'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
                        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
                    ],
                    location: 'Santorini, Greece',
                    likes: 892,
                    comments: 123,
                    isLiked: false,
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                },
            ];
            setPosts(mockPosts);
        }
        catch (error) {
            console.error('Failed to load posts:', error);
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const handleRefresh = () => {
        setRefreshing(true);
        loadPosts();
    };
    const handleLike = (postId) => {
        setPosts(prev => prev.map(post => post.id === postId
            ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
            : post));
    };
    const handleCreatePost = async () => {
        if (!postContent.trim()) {
            Alert.alert('Error', 'Please write something to share');
            return;
        }
        try {
            const newPost = {
                id: Date.now().toString(),
                userId: user?.id || '',
                userName: user?.displayName || 'User',
                userAvatar: user?.photoURL,
                content: postContent,
                location: postLocation,
                likes: 0,
                comments: 0,
                isLiked: false,
                createdAt: new Date(),
            };
            setPosts(prev => [newPost, ...prev]);
            setPostContent('');
            setPostLocation('');
            setShowCreatePost(false);
            Alert.alert('Success', 'Post shared successfully!');
        }
        catch (error) {
            console.error('Failed to create post:', error);
            Alert.alert('Error', 'Failed to share post');
        }
    };
    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60)
            return 'Just now';
        if (seconds < 3600)
            return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400)
            return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800)
            return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    const renderPost = ({ item, index }) => {
        // Create animation for this post if it doesn't exist
        if (!postAnimations.has(item.id)) {
            const anim = new Animated.Value(0);
            postAnimations.set(item.id, anim);
            // Trigger animation immediately
            Animated.spring(anim, {
                toValue: 1,
                delay: index * 100,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }).start();
        }
        const slideAnim = postAnimations.get(item.id);
        return (<Animated.View style={{
                opacity: slideAnim,
                transform: [
                    {
                        translateY: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                        }),
                    },
                ],
            }}>
      <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {item.userAvatar ? (<Image source={{ uri: item.userAvatar }} style={styles.avatarImage}/>) : (<View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
              </View>)}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.userName}</Text>
            <View style={styles.postMeta}>
              <Text style={styles.metaText}>{formatTimeAgo(item.createdAt)}</Text>
              {item.location && (<>
                  <Text style={styles.metaDot}> • </Text>
                  <Text style={styles.locationText}>📍 {item.location}</Text>
                </>)}
            </View>
            {item.tripTitle && (<Text style={styles.tripBadge}>{item.tripTitle}</Text>)}
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.moreButton}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{item.content}</Text>

      {/* Post Images */}
      {item.images && item.images.length > 0 && (<View style={styles.imagesContainer}>
          {item.images.length === 1 ? (<Image source={{ uri: item.images[0] }} style={styles.singleImage}/>) : (<View style={styles.multiImageGrid}>
              {item.images.slice(0, 4).map((img, index) => (<View key={index} style={[
                            styles.gridImage,
                            item.images.length === 2 && styles.gridImageHalf,
                            item.images.length >= 3 && index === 0 && styles.gridImageFull,
                            item.images.length >= 3 && index > 0 && styles.gridImageThird,
                        ]}>
                  <Image source={{ uri: img }} style={styles.gridImageContent}/>
                  {index === 3 && item.images.length > 4 && (<View style={styles.moreImagesOverlay}>
                      <Text style={styles.moreImagesText}>+{item.images.length - 4}</Text>
                    </View>)}
                </View>))}
            </View>)}
        </View>)}

      {/* Post Actions */}
      <View style={styles.actionsBar}>
        {(item.likes > 0 || item.comments > 0) && (<View style={styles.stats}>
            {item.likes > 0 && (<Text style={styles.statsText}>❤️ {item.likes}</Text>)}
            {item.comments > 0 && (<Text style={styles.statsText}>{item.comments} comments</Text>)}
          </View>)}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
          <Text style={[styles.actionIcon, item.isLiked && styles.likedIcon]}>
            {item.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, item.isLiked && styles.likedText]}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
    </Animated.View>);
    };
    return (<View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.gradientEnd]} style={styles.header}>
        <Text style={styles.headerTitle}>Travel Journal</Text>
        <Text style={styles.headerSubtitle}>Share your adventures with the community</Text>
      </LinearGradient>

      {/* Create Post Button */}
      <TouchableOpacity style={styles.createPostButton} onPress={() => setShowCreatePost(true)}>
        <View style={styles.avatar}>
          {user?.photoURL ? (<Image source={{ uri: user.photoURL }} style={styles.avatarImage}/>) : (<View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user?.displayName?.charAt(0) || 'U'}</Text>
            </View>)}
        </View>
        <Text style={styles.createPostText}>Share your travel story...</Text>
      </TouchableOpacity>

      {/* Posts Feed */}
      <FlatList data={posts} renderItem={renderPost} keyExtractor={(item) => item.id} contentContainerStyle={styles.feedContainer} refreshing={refreshing} onRefresh={handleRefresh} ListEmptyComponent={loading ? (<View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary}/>
            </View>) : (<View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>Be the first to share your travel story!</Text>
            </View>)}/>

      {/* Create Post Modal */}
      <Modal visible={showCreatePost} transparent={true} animationType="none" onRequestClose={() => setShowCreatePost(false)}>
        <Animated.View style={[
            styles.modalOverlay,
            {
                opacity: modalSlideAnim,
            },
        ]}>
          <Animated.View style={[
            styles.createPostModal,
            {
                transform: [
                    {
                        translateY: modalSlideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [600, 0],
                        }),
                    },
                ],
            },
        ]}>
            <>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => setShowCreatePost(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalUserInfo}>
                <View style={styles.avatar}>
                  {user?.photoURL ? (<Image source={{ uri: user.photoURL }} style={styles.avatarImage}/>) : (<View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>{user?.displayName?.charAt(0) || 'U'}</Text>
                    </View>)}
                </View>
                <View>
                  <Text style={styles.modalUserName}>{user?.displayName || 'User'}</Text>
                  <Text style={styles.modalUserEmail}>{user?.email}</Text>
                </View>
              </View>

              <TextInput style={styles.postInput} placeholder="What's on your mind? Share your travel experiences..." placeholderTextColor={colors.textLight} value={postContent} onChangeText={setPostContent} multiline numberOfLines={6} textAlignVertical="top"/>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>📍 Location (Optional)</Text>
                <TextInput style={styles.locationInput} placeholder="Where are you?" placeholderTextColor={colors.textLight} value={postLocation} onChangeText={setPostLocation}/>
              </View>

              <View style={styles.mediaOptions}>
                <TouchableOpacity style={styles.mediaButton}>
                  <Text style={styles.mediaIcon}>📷</Text>
                  <Text style={styles.mediaText}>Photo/Video</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mediaButton}>
                  <Text style={styles.mediaIcon}>😊</Text>
                  <Text style={styles.mediaText}>Feeling/Activity</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mediaButton}>
                  <Text style={styles.mediaIcon}>🏷️</Text>
                  <Text style={styles.mediaText}>Tag People</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleCreatePost}>
                <LinearGradient colors={[colors.primary, colors.gradientEnd]} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.submitText}>Post</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
            </>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    headerTitle: {
        ...typography.h1,
        color: colors.surface,
        marginBottom: spacing.xs,
    },
    headerSubtitle: {
        ...typography.body,
        color: colors.surface,
        opacity: 0.9,
    },
    createPostButton: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.md,
        marginVertical: spacing.md,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.sm,
    },
    createPostText: {
        ...typography.body,
        color: colors.textLight,
        marginLeft: spacing.md,
    },
    feedContainer: {
        paddingBottom: spacing.xl,
    },
    postCard: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: spacing.md,
    },
    userInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        marginRight: spacing.sm,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        ...typography.body,
        color: colors.surface,
        fontWeight: '700',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
    },
    postMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    metaText: {
        ...typography.small,
        color: colors.textSecondary,
    },
    metaDot: {
        ...typography.small,
        color: colors.textSecondary,
    },
    locationText: {
        ...typography.small,
        color: colors.textSecondary,
    },
    tripBadge: {
        ...typography.caption,
        color: colors.primary,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    moreButton: {
        fontSize: 24,
        color: colors.textSecondary,
        paddingHorizontal: spacing.sm,
    },
    postContent: {
        ...typography.body,
        color: colors.text,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        lineHeight: 22,
    },
    imagesContainer: {
        marginBottom: spacing.sm,
    },
    singleImage: {
        width: '100%',
        height: 300,
        backgroundColor: colors.background,
    },
    multiImageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridImage: {
        position: 'relative',
    },
    gridImageHalf: {
        width: '50%',
        height: 200,
    },
    gridImageFull: {
        width: '100%',
        height: 250,
    },
    gridImageThird: {
        width: '50%',
        height: 150,
    },
    gridImageContent: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.background,
    },
    moreImagesOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreImagesText: {
        ...typography.h2,
        color: colors.surface,
        fontWeight: '700',
    },
    actionsBar: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    stats: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statsText: {
        ...typography.small,
        color: colors.textSecondary,
    },
    actionButtons: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        paddingVertical: spacing.sm,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    actionIcon: {
        fontSize: 20,
        marginRight: 4,
    },
    actionText: {
        ...typography.body,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    likedIcon: {
        fontSize: 20,
    },
    likedText: {
        color: colors.error,
    },
    loadingContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        padding: spacing.xxl,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        ...typography.h2,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    createPostModal: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    modalTitle: {
        ...typography.h3,
        color: colors.text,
        fontWeight: '700',
    },
    closeButton: {
        fontSize: 36,
        color: colors.textSecondary,
        fontWeight: '300',
        lineHeight: 36,
    },
    modalContent: {
        padding: spacing.lg,
    },
    modalUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalUserName: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
    },
    modalUserEmail: {
        ...typography.small,
        color: colors.textSecondary,
    },
    postInput: {
        ...typography.body,
        color: colors.text,
        minHeight: 150,
        textAlignVertical: 'top',
        marginBottom: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    inputLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        fontWeight: '600',
    },
    locationInput: {
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        ...typography.body,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    mediaOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    mediaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    mediaIcon: {
        fontSize: 18,
        marginRight: spacing.xs,
    },
    mediaText: {
        ...typography.caption,
        color: colors.text,
        fontWeight: '600',
    },
    submitButton: {
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        ...shadows.md,
    },
    submitGradient: {
        padding: spacing.md,
        alignItems: 'center',
    },
    submitText: {
        ...typography.body,
        color: colors.surface,
        fontWeight: '700',
    },
});
