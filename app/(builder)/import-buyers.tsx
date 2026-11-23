import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { buyerService } from '../../src/services/buyerService';
import { useApp } from '../../src/context/AppContext';
import { parseBuyersCSV } from '../../src/utils/csvParser';
import { CSVImportResult } from '../../src/types';

const SAMPLE_CSV = `tower,unit,name,phone,configuration
Tower A,A-1204,Rahul Sharma,+91 98765 43210,3BHK Luxury
Tower A,A-0502,Priya Narang,+91 98111 22334,2BHK Executive
Tower A,A-0901,Vikram Mehta,+91 98222 33445,3BHK Luxury
Tower B,B-0301,Rohit Verma,+91 98555 66778,3BHK Premium
Tower B,B-0802,Sneha Kulkarni,+91 98666 77889,3BHK Premium
Tower C,C-0902,Manish Agarwal,+91 98999 00112,3BHK Grand
Tower D,D-0202,Harish Nair,+91 99333 44556,3BHK Deluxe
Tower E,E-1001,Gaurav Kapoor,+91 99555 66778,4BHK Royal`;

export default function ImportBuyersScreen() {
  const router = useRouter();
  const { refreshBuyers } = useApp();

  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<CSVImportResult | null>(null);

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        // Read file contents
        const response = await fetch(file.uri);
        const text = await response.text();
        setCsvText(text);
        setResult(null);
      }
    } catch (err) {
      console.warn('Error reading file:', err);
      Alert.alert('File Error', 'Could not open CSV file.');
    }
  };

  const handleExecuteImport = async () => {
    if (!csvText.trim()) {
      Alert.alert('Empty Input', 'Please paste CSV content or select a CSV file.');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const res = await buyerService.importBuyersFromCSV(csvText);
      setResult(res);
      await refreshBuyers();
    } catch (err: any) {
      Alert.alert('Import Failed', err?.message || 'Error parsing CSV.');
    } finally {
      setImporting(false);
    }
  };

  // Preview parsed rows
  const preview = parseBuyersCSV(csvText);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="cloud-upload" size={24} color="#B45309" />
        </View>
        <Text style={styles.title}>Import Buyers from CSV</Text>
        <Text style={styles.subtitle}>
          Upload or paste your buyer roster. TowerPulse automatically provisions each unit with a unique invite code (e.g. A1204-7KQ).
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.topActions}>
        <TouchableOpacity style={styles.filePickerBtn} onPress={handlePickDocument}>
          <Ionicons name="document-text-outline" size={16} color="#1E293B" />
          <Text style={styles.filePickerText}>Select .CSV File</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sampleBtn}
          onPress={() => {
            setCsvText(SAMPLE_CSV);
            setResult(null);
          }}
        >
          <Ionicons name="flash-outline" size={16} color="#B45309" />
          <Text style={styles.sampleText}>Load Sample CSV</Text>
        </TouchableOpacity>
      </View>

      {/* CSV Text Input Area */}
      <View style={styles.inputCard}>
        <Text style={styles.inputCardLabel}>CSV CONTENT (HEADERS: TOWER, UNIT, NAME, PHONE)</Text>
        <TextInput
          style={styles.textArea}
          value={csvText}
          onChangeText={(text) => {
            setCsvText(text);
            setResult(null);
          }}
          multiline={true}
          numberOfLines={8}
          placeholder="tower,unit,name,phone"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Parse Preview Status */}
      <View style={styles.previewSummaryRow}>
        <Text style={styles.previewLabel}>
          PARSED PREVIEW: {preview.buyers.length} VALID BUYER UNITS
        </Text>
        {preview.skippedCount > 0 && (
          <Text style={styles.skippedWarning}>
            ({preview.skippedCount} rows skipped or duplicate)
          </Text>
        )}
      </View>

      {/* Preview Table of Buyers & Generated Invite Codes */}
      <View style={styles.previewTable}>
        {preview.buyers.slice(0, 6).map((buyer, idx) => (
          <View key={idx} style={styles.previewRow}>
            <View style={styles.rowMain}>
              <Text style={styles.rowUnit}>{buyer.unit}</Text>
              <Text style={styles.rowTower}>• {buyer.tower}</Text>
              <Text style={styles.rowName}>{buyer.name}</Text>
            </View>
            <View style={styles.rowCodeBadge}>
              <Ionicons name="key-outline" size={11} color="#B45309" />
              <Text style={styles.rowCodeText}>{buyer.inviteCode}</Text>
            </View>
          </View>
        ))}

        {preview.buyers.length > 6 && (
          <View style={styles.moreRowsNotice}>
            <Text style={styles.moreRowsText}>
              + {preview.buyers.length - 6} more buyers ready to import
            </Text>
          </View>
        )}
      </View>

      {/* Result Status Message */}
      {result && (
        <View style={styles.resultBanner}>
          <Ionicons name="checkmark-circle" size={20} color="#059669" />
          <View style={styles.resultTextCol}>
            <Text style={styles.resultTitle}>
              Successfully Imported {result.importedCount} Buyers!
            </Text>
            <Text style={styles.resultSubtitle}>
              Invite codes have been provisioned. Buyers can now join their respective towers and units.
            </Text>
            <TouchableOpacity
              style={styles.viewTowersBtn}
              onPress={() => router.replace('/(builder)')}
            >
              <Text style={styles.viewTowersBtnText}>View Towers Breakdown →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Import Execution Button */}
      <TouchableOpacity
        style={[styles.importSubmitBtn, importing && styles.btnDisabled]}
        onPress={handleExecuteImport}
        disabled={importing || preview.buyers.length === 0}
        activeOpacity={0.8}
      >
        {importing ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="cloud-done" size={18} color="#FFFFFF" />
            <Text style={styles.importSubmitText}>
              Import & Provision {preview.buyers.length} Buyers
            </Text>
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
    marginVertical: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  filePickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 10,
  },
  filePickerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  sampleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingVertical: 10,
  },
  sampleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  inputCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textArea: {
    height: 120,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  previewSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  skippedWarning: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '500',
  },
  previewTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  rowUnit: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  rowTower: {
    fontSize: 11,
    color: '#64748B',
  },
  rowName: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
    maxWidth: 110,
  },
  rowCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rowCodeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
    fontFamily: 'monospace',
  },
  moreRowsNotice: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  moreRowsText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  resultTextCol: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
    marginBottom: 8,
  },
  viewTowersBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  viewTowersBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  importSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#B45309',
    borderRadius: 10,
    height: 48,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  importSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
