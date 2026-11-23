import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { buyerService, InviteCodeError } from '../../src/services/buyerService';

export default function JoinScreen() {
  const router = useRouter();
  const { setCurrentBuyer, currentBuyer, logoutBuyer } = useApp();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleClaim = async (codeToClaim?: string) => {
    const targetCode = (codeToClaim || code).trim();
    if (!targetCode) {
      setErrorMessage('Please enter your invite code.');
      setErrorType('INVALID');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setErrorType(null);
    setSuccessInfo(null);

    try {
      const buyer = await buyerService.validateAndClaimInviteCode(targetCode);
      await setCurrentBuyer(buyer);
      setSuccessInfo(`Welcome ${buyer.name}! Linked to ${buyer.tower}, Unit ${buyer.unit}.`);
      setTimeout(() => {
        router.replace('/(buyer)/unit');
      }, 1200);
    } catch (err: any) {
      if (err instanceof InviteCodeError) {
        setErrorType(err.code);
        setErrorMessage(err.message);
      } else {
        setErrorType('UNKNOWN');
        setErrorMessage(err?.message || 'Failed to claim code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const demoTestCases = [
    { label: 'Valid Code (A-1204)', code: 'A1204-7KQ', type: 'valid' },
    { label: 'Valid Code (B-0802)', code: 'B0802-9XP', type: 'valid' },
    { label: 'Expired Code (A-1503)', code: 'A1503-4LK', type: 'expired' },
    { label: 'Already Used (A-0502)', code: 'A0502-3TR', type: 'used' },
    { label: 'Invalid Code', code: 'XYZ99-000', type: 'invalid' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="key" size={28} color="#1E40AF" />
          </View>
          <Text style={styles.title}>Join Your Residential Unit</Text>
          <Text style={styles.subtitle}>
            Enter the personal invite code shared by the builder on SMS or email to link your apartment.
          </Text>
        </View>

        {/* Current Active Buyer status if already joined */}
        {currentBuyer && (
          <View style={styles.currentActiveBox}>
            <View style={styles.activeLeft}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <View>
                <Text style={styles.activeTitle}>Currently Linked:</Text>
                <Text style={styles.activeDesc}>
                  {currentBuyer.name} • {currentBuyer.tower}, Unit {currentBuyer.unit}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={logoutBuyer} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Unlink</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Code Input Box */}
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>INVITE CODE</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="ticket-outline" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. A1204-7KQ"
              placeholderTextColor="#94A3B8"
              value={code}
              onChangeText={(text) => {
                setCode(text.toUpperCase());
                setErrorMessage(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={15}
            />
            {code.length > 0 && (
              <TouchableOpacity onPress={() => setCode('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Error Feedback Banner */}
          {errorMessage && (
            <View
              style={[
                styles.errorBanner,
                errorType === 'EXPIRED_CODE' && styles.expiredBanner,
                errorType === 'ALREADY_USED' && styles.usedBanner,
              ]}
            >
              <Ionicons
                name={
                  errorType === 'EXPIRED_CODE'
                    ? 'time-outline'
                    : errorType === 'ALREADY_USED'
                    ? 'lock-closed-outline'
                    : 'alert-circle-outline'
                }
                size={18}
                color={
                  errorType === 'EXPIRED_CODE'
                    ? '#B45309'
                    : errorType === 'ALREADY_USED'
                    ? '#6B21A8'
                    : '#DC2626'
                }
              />
              <View style={styles.errorTextContainer}>
                <Text
                  style={[
                    styles.errorHeadline,
                    errorType === 'EXPIRED_CODE' && styles.expiredHeadline,
                    errorType === 'ALREADY_USED' && styles.usedHeadline,
                  ]}
                >
                  {errorType === 'EXPIRED_CODE'
                    ? 'Code Expired'
                    : errorType === 'ALREADY_USED'
                    ? 'Already Claimed'
                    : 'Invalid Code'}
                </Text>
                <Text style={styles.errorSubtext}>{errorMessage}</Text>
              </View>
            </View>
          )}

          {/* Success Banner */}
          {successInfo && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.successText}>{successInfo}</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.claimButton, loading && styles.buttonDisabled]}
            onPress={() => handleClaim()}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.claimButtonText}>Verify & Claim Unit</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo Fast-Test Chips */}
        <View style={styles.demoSection}>
          <Text style={styles.demoHeader}>1-TAP TEST CODES (FOR DEMO & EVALUATION)</Text>
          <View style={styles.chipsContainer}>
            {demoTestCases.map((demo, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.demoChip,
                  demo.type === 'expired' && styles.chipExpired,
                  demo.type === 'used' && styles.chipUsed,
                  demo.type === 'invalid' && styles.chipInvalid,
                ]}
                onPress={() => {
                  setCode(demo.code);
                  handleClaim(demo.code);
                }}
              >
                <Text style={styles.chipCode}>{demo.code}</Text>
                <Text style={styles.chipLabel}>• {demo.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  currentActiveBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  activeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  activeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  activeDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
  },
  logoutBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  clearBtn: {
    padding: 4,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E40AF',
    borderRadius: 10,
    height: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  expiredBanner: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  usedBanner: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  errorTextContainer: {
    flex: 1,
  },
  errorHeadline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 2,
  },
  expiredHeadline: {
    color: '#B45309',
  },
  usedHeadline: {
    color: '#6B21A8',
  },
  errorSubtext: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  successText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
  },
  demoSection: {
    marginTop: 8,
  },
  demoHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipExpired: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFDF5',
  },
  chipUsed: {
    borderColor: '#E9D5FF',
    backgroundColor: '#FCFAFF',
  },
  chipInvalid: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF8F8',
  },
  chipCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  chipLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
