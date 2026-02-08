import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Image, ActivityIndicator, Switch, TouchableOpacity, Share, Alert } from "react-native";
import { ThemedText } from "../components/ThemedText";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "../config/firebaseConfig";
import { deleteAllUserData, getSaveCloudImagesPreference, setSaveCloudImagesPreference } from "../services/firebaseService";

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveCloudImages, setSaveCloudImages] = useState(false);
  const [deletingData, setDeletingData] = useState(false);

  useEffect(() => {
    fetchHistory();
    loadPrivacyPreference();
  }, []);

  const loadPrivacyPreference = async () => {
    const enabled = await getSaveCloudImagesPreference();
    setSaveCloudImages(enabled);
  };

  const fetchHistory = async () => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, "scans"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const classificationLabel =
      typeof item.classification === "string"
        ? item.classification
        : item.classification?.classification || "Unknown";

    // Determine color based on classification (simple mapping)
    let badgeColor = "#2196F3";
    if (classificationLabel.toLowerCase().includes("clear")) badgeColor = "#4CAF50";
    if (classificationLabel.toLowerCase().includes("cyst")) badgeColor = "#F44336";

    return (
      <View style={styles.card}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <MaterialCommunityIcons name="image-off-outline" size={24} color="#9aa0a6" />
          </View>
        )}
        <View style={styles.info}>
          <ThemedText style={styles.date}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() + " • " + new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Unknown Date"}
          </ThemedText>
          <View style={[styles.badge, { backgroundColor: badgeColor + "20" }]}>
            <ThemedText style={[styles.diagnosis, { color: badgeColor }]}>
              {classificationLabel}
            </ThemedText>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
      </View>
    );
  };

  const handleToggleImageSaving = async (enabled: boolean) => {
    setSaveCloudImages(enabled);
    await setSaveCloudImagesPreference(enabled);
  };

  const handleShareHistory = async () => {
    const lines = history.map((item, index) => {
      const label =
        typeof item.classification === "string"
          ? item.classification
          : item.classification?.classification || "Unknown";
      const confidence =
        typeof item.classification === "object" && typeof item.classification?.confidence === "number"
          ? ` (${Math.round(item.classification.confidence * 100)}%)`
          : "";
      const date = item.createdAt ? new Date(item.createdAt).toLocaleString() : "Unknown date";
      return `${index + 1}. ${date} - ${label}${confidence}`;
    });

    if (!lines.length) return;
    await Share.share({
      message: `Skin scan history:\n\n${lines.join("\n")}`,
    });
  };

  const confirmDeleteAllData = () => {
    Alert.alert(
      "Delete My Data",
      "This will permanently delete your profile, scan logs, and stored scan images.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: handleDeleteAllData,
        },
      ]
    );
  };

  const handleDeleteAllData = async () => {
    try {
      setDeletingData(true);
      await deleteAllUserData();
      setHistory([]);
      setSaveCloudImages(false);
      Alert.alert("Done", "Your app data has been deleted.");
    } catch (error: any) {
      Alert.alert("Delete Failed", error.message || "Could not delete your data.");
    } finally {
      setDeletingData(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>History</ThemedText>
        <ThemedText style={styles.subtitle}>Your skin analysis journey</ThemedText>
      </View>
      
      <View style={styles.controls}>
        <View style={styles.privacyRow}>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.privacyTitle}>Save scan images to cloud history</ThemedText>
            <ThemedText style={styles.privacySub}>
              When off, scans are logged without image uploads (privacy-first default).
            </ThemedText>
          </View>
          <Switch value={saveCloudImages} onValueChange={handleToggleImageSaving} />
        </View>

        <TouchableOpacity
          style={[styles.shareButton, history.length === 0 && styles.shareButtonDisabled]}
          disabled={history.length === 0}
          onPress={handleShareHistory}
        >
          <MaterialCommunityIcons name="share-variant" size={18} color="#007AFF" />
          <ThemedText style={styles.shareText}>Share Logs</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteDataButton, deletingData && styles.shareButtonDisabled]}
          disabled={deletingData}
          onPress={confirmDeleteAllData}
        >
          {deletingData ? (
            <ActivityIndicator size="small" color="#B3261E" />
          ) : (
            <MaterialCommunityIcons name="delete-forever-outline" size={18} color="#B3261E" />
          )}
          <ThemedText style={styles.deleteDataText}>Delete My Data</ThemedText>
        </TouchableOpacity>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="image-off-outline" size={60} color="#ddd" />
          <ThemedText style={styles.emptyText}>No scans yet.</ThemedText>
          <ThemedText style={styles.emptySub}>Take your first photo to start tracking.</ThemedText>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
  },
  subtitle: {
    color: "#666",
    fontSize: 16,
  },
  controls: {
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 12,
  },
  privacyRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  privacySub: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  shareButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  shareText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  deleteDataButton: {
    backgroundColor: "#fff5f5",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#ffd4d4",
  },
  deleteDataText: {
    color: "#B3261E",
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  diagnosis: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySub: {
    color: "#999",
    marginTop: 8,
  },
});
