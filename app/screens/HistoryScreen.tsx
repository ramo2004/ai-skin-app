import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { ThemedText } from "../components/ThemedText";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "../config/firebaseConfig";

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

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
    // Determine color based on classification (simple mapping)
    let badgeColor = "#2196F3";
    if (item.classification?.classification?.toLowerCase().includes("clear")) badgeColor = "#4CAF50";
    if (item.classification?.classification?.toLowerCase().includes("cyst")) badgeColor = "#F44336";

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
        <View style={styles.info}>
          <ThemedText style={styles.date}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() + " • " + new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Unknown Date"}
          </ThemedText>
          <View style={[styles.badge, { backgroundColor: badgeColor + "20" }]}>
            <ThemedText style={[styles.diagnosis, { color: badgeColor }]}>
              {item.classification?.classification || "Unknown"}
            </ThemedText>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
      </View>
    );
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
