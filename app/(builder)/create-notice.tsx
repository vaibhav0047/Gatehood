import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { noticeService } from '../../src/services/noticeService';
import { useApp } from '../../src/context/AppContext';
import { NoticeCategory, NoticeTargetType } from '../../src/types';

const SAMPLE_PHOTOS = [
  { label: 'RCC Slab', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=60' },
  { label: 'Crane & Exterior', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60' },
  { label: 'Pool & Podium', url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=60' },
];

export default function CreateNoticeScreen() {
  const router = useRouter();
  const { allBuyers } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('construction');
  const [targetType, setTargetType] = useState<NoticeTargetType>('all');
  const [selectedTowers, setSelectedTowers] = useState<string[]>(['Tower A']);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(['A-1204']);
  const [isPinned, setIsPinned] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [posting, setPosting] = useState(false);

  const availableTowers = ['Tower A', 'Tower B', 'Tower C', 'Tower D', 'Tower E'];
  const popularUnits = ['A-1204', 'A-0502', 'B-0301', 'B-0802', 'C-0902', 'D-0202', 'E-1001'];

  const toggleTower = (tower: string) => {
    setSelectedTowers((prev) =>
      prev.includes(tower) ? prev.filter((t) => t !== tower) : [...prev, tower]
    );
  };

  const toggleUnit = (unit: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  };

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Incomplete Form', 'Please enter both title and content.');
      return;
    }

    if (targetType === 'towers' && selectedTowers.length === 0) {
      Alert.alert('Audience Missing', 'Please select at least one tower.');
      return;
    }

    if (targetType === 'units' && selectedUnits.length === 0) {
      Alert.alert('Audience Missing', 'Please select at least one target unit.');
      return;
    }

    setPosting(true);
    try {
      await noticeService.createNotice(
        {
          title: title.trim(),
          content: content.trim(),
          category,
          targetType,
          targetTowers: targetType === 'towers' ? selectedTowers : [],
          targetUnits: targetType === 'units' ? selectedUnits : [],
          isPinned,
          totalTargetBuyers: 0, // calculated inside noticeService
          createdBy: 'builder_admin',
          authorRole: 'Chief Project Engineer',
          imageUrl: imageUrl.trim() || undefined,
        },
        allBuyers
      );

      Alert.alert('Notice Broadcasted', 'Notice has been published with live push to buyer feeds!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(builder)'),
        },
      ]);
    } catch (e: any) {
      Alert.alert('Publish Error', e?.message || 'Could not post notice.');
    } finally {
      setPosting(false);
    }
  };

  const categories: Array<{ id: NoticeCategory; label: string }> = [
    { id: 'construction', label: 'Construction' },
    { id: 'milestone', label: 'Milestone' },
    { id: 'urgent', label: 'Urgent' },
    { id: 'payment', label: 'Payment' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'legal', label: 'Legal / RERA' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="megaphone" size={24} color="#B45309" />
        </View>
        <Text style={styles.headerTitle}>Post New Notice</Text>
        <Text style={styles.headerSubtitle}>
          Broadcast targeted updates to the whole project, specific towers, or individual units.
        </Text>
      </View>

      {/* Target Audience Selector */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>TARGET AUDIENCE</Text>
        <View style={styles.targetTypeRow}>
          <TouchableOpacity
            style={[styles.targetTypeBtn, targetType === 'all' && styles.targetTypeActive]}
            onPress={() => setTargetType('all')}
          >
            <Ionicons
              name="globe-outline"
              size={14}
              color={targetType === 'all' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.targetTypeText,
                targetType === 'all' && styles.targetTypeTextActive,
              ]}
            >
              Whole Project
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.targetTypeBtn, targetType === 'towers' && styles.targetTypeActive]}
            onPress={() => setTargetType('towers')}
          >
            <Ionicons
              name="business-outline"
              size={14}
              color={targetType === 'towers' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.targetTypeText,
                targetType === 'towers' && styles.targetTypeTextActive,
              ]}
            >
              Select Towers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.targetTypeBtn, targetType === 'units' && styles.targetTypeActive]}
            onPress={() => setTargetType('units')}
          >
            <Ionicons
              name="key-outline"
              size={14}
              color={targetType === 'units' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.targetTypeText,
                targetType === 'units' && styles.targetTypeTextActive,
              ]}
            >
              Specific Units
            </Text>
          </TouchableOpacity>
        </View>

        {/* Multi-select Towers */}
        {targetType === 'towers' && (
          <View style={styles.subSelectorBox}>
            <Text style={styles.subSelectorLabel}>SELECT TOWERS TO TARGET:</Text>
            <View style={styles.chipsWrap}>
              {availableTowers.map((tower) => {
                const isSelected = selectedTowers.includes(tower);
                return (
                  <TouchableOpacity
                    key={tower}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => toggleTower(tower)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark' : 'add'}
                      size={12}
                      color={isSelected ? '#FFFFFF' : '#64748B'}
                    />
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {tower}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Multi-select Units */}
        {targetType === 'units' && (
          <View style={styles.subSelectorBox}>
            <Text style={styles.subSelectorLabel}>SELECT APARTMENT UNITS:</Text>
            <View style={styles.chipsWrap}>
              {popularUnits.map((unit) => {
                const isSelected = selectedUnits.includes(unit);
                return (
                  <TouchableOpacity
                    key={unit}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => toggleUnit(unit)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark' : 'add'}
                      size={12}
                      color={isSelected ? '#FFFFFF' : '#64748B'}
                    />
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      Unit {unit}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Category Chips */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>NOTICE CATEGORY</Text>
        <View style={styles.chipsWrap}>
          {categories.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Pin to Top Switch */}
      <View style={[styles.card, styles.pinnedRow]}>
        <View style={styles.pinnedLeft}>
          <Ionicons name="pin" size={18} color="#B45309" />
          <View>
            <Text style={styles.pinnedTitle}>Pin Notice to Top</Text>
            <Text style={styles.pinnedSubtitle}>
              Pinned notices remain at the top of buyer feeds
            </Text>
          </View>
        </View>
        <Switch
          value={isPinned}
          onValueChange={setIsPinned}
          trackColor={{ false: '#CBD5E1', true: '#FDE68A' }}
          thumbColor={isPinned ? '#B45309' : '#F1F5F9'}
        />
      </View>

      {/* Notice Title & Content */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>NOTICE TITLE</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Tower A: Lift Testing & Commissioning"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.cardLabel, { marginTop: 14 }]}>NOTICE CONTENT</Text>
        <TextInput
          style={styles.contentInput}
          placeholder="Detailed announcement, instructions, and next steps for buyers..."
          placeholderTextColor="#94A3B8"
          value={content}
          onChangeText={setContent}
          multiline={true}
          numberOfLines={6}
        />
      </View>

      {/* Optional Photo Attachment */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>OPTIONAL SITE PHOTO (ATTACHMENT)</Text>
        <View style={styles.samplePhotoRow}>
          {SAMPLE_PHOTOS.map((photo, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.photoChip, imageUrl === photo.url && styles.photoChipActive]}
              onPress={() => setImageUrl(imageUrl === photo.url ? '' : photo.url)}
            >
              <Ionicons name="image-outline" size={12} color="#475569" />
              <Text style={styles.photoChipText}>{photo.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={[styles.textInput, { marginTop: 8 }]}
          placeholder="Or paste custom image URL..."
          placeholderTextColor="#94A3B8"
          value={imageUrl}
          onChangeText={setImageUrl}
        />
      </View>

      {/* Submit Broadcast Button */}
      <TouchableOpacity
        style={[styles.broadcastBtn, posting && styles.btnDisabled]}
        onPress={handlePost}
        disabled={posting}
        activeOpacity={0.85}
      >
        {posting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="send" size={16} color="#FFFFFF" />
            <Text style={styles.broadcastBtnText}>Broadcast Notice to Buyers</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 320,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  targetTypeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  targetTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 9,
  },
  targetTypeActive: {
    backgroundColor: '#B45309',
  },
  targetTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  targetTypeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subSelectorBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  subSelectorLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipActive: {
    backgroundColor: '#B45309',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFDF7',
    borderColor: '#FDE68A',
  },
  pinnedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pinnedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  pinnedSubtitle: {
    fontSize: 11,
    color: '#B45309',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    height: 100,
    textAlignVertical: 'top',
  },
  samplePhotoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  photoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  photoChipActive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  photoChipText: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600',
  },
  broadcastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#B45309',
    borderRadius: 10,
    height: 48,
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  broadcastBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
