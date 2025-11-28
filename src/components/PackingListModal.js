import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, StyleSheet, Dimensions, Alert, } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setPackingList, addCategory, removeCategory, addItem, removeItem, toggleItem, } from '../store/slices/packingSlice';
import { useTranslation } from '../i18n/useTranslation';
const { width, height } = Dimensions.get('window');
const getDefaultCategories = (t) => [
    {
        id: 'docs',
        name: t.importantDocuments,
        icon: '📄',
        items: [
            { id: 'doc-1', name: t.passport, checked: false, categoryId: 'docs' },
            { id: 'doc-2', name: t.creditCard, checked: false, categoryId: 'docs' },
            { id: 'doc-3', name: t.foreignCurrency, checked: false, categoryId: 'docs' },
            { id: 'doc-4', name: t.internationalDriverLicense, checked: false, categoryId: 'docs' },
        ],
    },
    {
        id: 'clothing',
        name: t.clothing,
        icon: '👕',
        items: [
            { id: 'cloth-1', name: t.topClothing, checked: false, categoryId: 'clothing' },
            { id: 'cloth-2', name: t.pants, checked: false, categoryId: 'clothing' },
            { id: 'cloth-3', name: t.underwear, checked: false, categoryId: 'clothing' },
            { id: 'cloth-4', name: t.pajamas, checked: false, categoryId: 'clothing' },
            { id: 'cloth-5', name: t.shoesAndSlippers, checked: false, categoryId: 'clothing' },
            { id: 'cloth-6', name: t.socks, checked: false, categoryId: 'clothing' },
        ],
    },
    {
        id: 'electronics',
        name: t.electronics,
        icon: '📱',
        items: [
            { id: 'elec-1', name: t.smartphone, checked: false, categoryId: 'electronics' },
            { id: 'elec-2', name: t.powerBank, checked: false, categoryId: 'electronics' },
            { id: 'elec-3', name: t.phoneCharger, checked: false, categoryId: 'electronics' },
            { id: 'elec-4', name: t.wifiDeviceOrSimCard, checked: false, categoryId: 'electronics' },
            { id: 'elec-5', name: t.earphones, checked: false, categoryId: 'electronics' },
        ],
    },
    {
        id: 'toiletries',
        name: t.toiletries,
        icon: '🧴',
        items: [
            { id: 'toilet-1', name: t.toothbrushToothpasteTowel, checked: false, categoryId: 'toiletries' },
            { id: 'toilet-2', name: t.facialCleanserBodyWash, checked: false, categoryId: 'toiletries' },
            { id: 'toilet-3', name: t.sunscreen, checked: false, categoryId: 'toiletries' },
            { id: 'toilet-4', name: t.personalMedicine, checked: false, categoryId: 'toiletries' },
        ],
    },
    {
        id: 'other',
        name: t.otherItems,
        icon: '🎒',
        items: [
            { id: 'other-1', name: t.waterBottleOrThermos, checked: false, categoryId: 'other' },
            { id: 'other-2', name: t.pen, checked: false, categoryId: 'other' },
            { id: 'other-3', name: t.plasticBags, checked: false, categoryId: 'other' },
            { id: 'other-4', name: t.umbrella, checked: false, categoryId: 'other' },
            { id: 'other-5', name: t.reusableUtensils, checked: false, categoryId: 'other' },
        ],
    },
];
export default function PackingListModal({ visible, tripId, onClose }) {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const packingList = useSelector((state) => state.packing.packingLists.find((p) => p.tripId === tripId));
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [newItemName, setNewItemName] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
    // Initialize with default categories if none exist
    useEffect(() => {
        if (visible && !packingList) {
            dispatch(setPackingList({
                tripId,
                categories: getDefaultCategories(t),
            }));
        }
    }, [visible, tripId, packingList, dispatch, t]);
    const categories = packingList?.categories || [];
    const getTotalStats = () => {
        let total = 0;
        let checked = 0;
        categories.forEach((cat) => {
            total += cat.items.length;
            checked += cat.items.filter((item) => item.checked).length;
        });
        return { total, checked };
    };
    const handleToggleItem = (categoryId, itemId) => {
        dispatch(toggleItem({ tripId, categoryId, itemId }));
    };
    const handleAddItem = () => {
        if (!newItemName.trim()) {
            Alert.alert('Error', 'Please enter an item name');
            return;
        }
        const newItem = {
            id: `item-${Date.now()}`,
            name: newItemName.trim(),
            checked: false,
            categoryId: selectedCategoryId,
        };
        dispatch(addItem({ tripId, categoryId: selectedCategoryId, item: newItem }));
        setNewItemName('');
        setShowAddItemModal(false);
    };
    const handleAddCategory = () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }
        const newCategory = {
            id: `cat-${Date.now()}`,
            name: newCategoryName.trim(),
            icon: newCategoryIcon,
            items: [],
        };
        dispatch(addCategory({ tripId, category: newCategory }));
        setNewCategoryName('');
        setNewCategoryIcon('📦');
        setShowAddCategoryModal(false);
    };
    const handleDeleteItem = (categoryId, itemId) => {
        Alert.alert(t.delete, 'Are you sure you want to delete this item?', [
            { text: t.cancel, style: 'cancel' },
            {
                text: t.delete,
                style: 'destructive',
                onPress: () => dispatch(removeItem({ tripId, categoryId, itemId })),
            },
        ]);
    };
    const handleDeleteCategory = (categoryId) => {
        Alert.alert(t.delete, 'Are you sure you want to delete this category and all its items?', [
            { text: t.cancel, style: 'cancel' },
            {
                text: t.delete,
                style: 'destructive',
                onPress: () => dispatch(removeCategory({ tripId, categoryId })),
            },
        ]);
    };
    const stats = getTotalStats();
    return (<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>🎒 {t.packingListTitle}</Text>
              <Text style={styles.headerStats}>
                {stats.checked}/{stats.total} {t.checkedItems}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => setShowAddCategoryModal(true)} style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {categories.length === 0 ? (<View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>{t.nothingPacked}</Text>
                <Text style={styles.emptyText}>{t.startAddingItems}</Text>
              </View>) : (categories.map((category) => {
            const categoryStats = {
                total: category.items.length,
                checked: category.items.filter((i) => i.checked).length,
            };
            return (<View key={category.id} style={styles.categoryCard}>
                    <View style={styles.categoryHeader}>
                      <View style={styles.categoryHeaderLeft}>
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryStats}>
                          {categoryStats.checked}/{categoryStats.total}
                        </Text>
                      </View>
                      <View style={styles.categoryActions}>
                        <TouchableOpacity onPress={() => {
                    setSelectedCategoryId(category.id);
                    setShowAddItemModal(true);
                }} style={styles.categoryActionBtn}>
                          <Text style={styles.categoryActionText}>+ {t.addItem}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteCategory(category.id)} style={styles.categoryDeleteBtn}>
                          <Text style={styles.categoryDeleteText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {category.items.map((item) => (<View key={item.id} style={styles.itemRow}>
                        <TouchableOpacity style={styles.itemCheckbox} onPress={() => handleToggleItem(category.id, item.id)}>
                          <View style={[
                        styles.checkbox,
                        item.checked && styles.checkboxChecked,
                    ]}>
                            {item.checked && <Text style={styles.checkmark}>✓</Text>}
                          </View>
                          <Text style={[
                        styles.itemName,
                        item.checked && styles.itemNameChecked,
                    ]}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteItem(category.id, item.id)} style={styles.itemDeleteBtn}>
                          <Text style={styles.itemDeleteText}>✕</Text>
                        </TouchableOpacity>
                      </View>))}
                  </View>);
        }))}
          </ScrollView>
        </View>
      </View>

      {/* Add Item Modal */}
      <Modal visible={showAddItemModal} transparent animationType="fade" onRequestClose={() => setShowAddItemModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.addItem}</Text>
            <TextInput style={styles.modalInput} placeholder={t.enterItemName} value={newItemName} onChangeText={setNewItemName} autoFocus placeholderTextColor="#999"/>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => {
            setShowAddItemModal(false);
            setNewItemName('');
        }}>
                <Text style={styles.modalButtonCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={handleAddItem}>
                <Text style={styles.modalButtonConfirmText}>{t.add}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Category Modal */}
      <Modal visible={showAddCategoryModal} transparent animationType="fade" onRequestClose={() => setShowAddCategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.addCategory}</Text>
            <Text style={styles.modalLabel}>{t.categoryName}</Text>
            <TextInput style={styles.modalInput} placeholder={t.enterCategoryName} value={newCategoryName} onChangeText={setNewCategoryName} placeholderTextColor="#999"/>
            <Text style={styles.modalLabel}>{t.categoryIcon}</Text>
            <TextInput style={styles.modalInput} placeholder={t.enterCategoryIcon} value={newCategoryIcon} onChangeText={setNewCategoryIcon} placeholderTextColor="#999"/>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => {
            setShowAddCategoryModal(false);
            setNewCategoryName('');
            setNewCategoryIcon('📦');
        }}>
                <Text style={styles.modalButtonCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={handleAddCategory}>
                <Text style={styles.modalButtonConfirmText}>{t.add}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>);
}
const styles = StyleSheet.create({
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        width: Math.min(500, width * 0.9),
        maxHeight: height * 0.8,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    headerStats: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    closeButton: {
        padding: 8,
        marginLeft: 8,
    },
    closeButtonText: {
        fontSize: 28,
        color: '#333',
        fontWeight: '300',
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: '300',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    categoryCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    categoryHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    categoryStats: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
        marginLeft: 8,
    },
    categoryActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryActionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#007AFF',
        marginRight: 8,
    },
    categoryActionText: {
        fontSize: 12,
        color: '#FFF',
        fontWeight: '600',
    },
    categoryDeleteBtn: {
        padding: 6,
    },
    categoryDeleteText: {
        fontSize: 18,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    itemCheckbox: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#DDD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxChecked: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    checkmark: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemName: {
        fontSize: 15,
        color: '#333',
        flex: 1,
    },
    itemNameChecked: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    itemDeleteBtn: {
        padding: 8,
    },
    itemDeleteText: {
        fontSize: 16,
        color: '#999',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        width: width * 0.85,
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginTop: 12,
    },
    modalInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: '#F0F0F0',
        marginRight: 8,
    },
    modalButtonConfirm: {
        backgroundColor: '#007AFF',
        marginLeft: 8,
    },
    modalButtonCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    modalButtonConfirmText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});
