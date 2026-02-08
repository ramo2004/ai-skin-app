import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const ROUTINE_REMINDER_IDS_KEY = "routine.reminder.ids";
const ROUTINE_REMINDERS_ENABLED_KEY = "routine.reminders.enabled";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function areRoutineRemindersEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ROUTINE_REMINDERS_ENABLED_KEY);
  return value === "true";
}

async function setRoutineRemindersEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(ROUTINE_REMINDERS_ENABLED_KEY, String(enabled));
}

async function getReminderIds(): Promise<string[]> {
  const stored = await AsyncStorage.getItem(ROUTINE_REMINDER_IDS_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function setReminderIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(ROUTINE_REMINDER_IDS_KEY, JSON.stringify(ids));
}

export async function cancelRoutineReminders(): Promise<void> {
  const ids = await getReminderIds();
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  await setReminderIds([]);
  await setRoutineRemindersEnabled(false);
}

export async function enableRoutineReminders(): Promise<void> {
  const permissions = await Notifications.getPermissionsAsync();
  const granted =
    permissions.granted ||
    (await Notifications.requestPermissionsAsync()).granted;

  if (!granted) {
    throw new Error("Notification permission was not granted.");
  }

  await cancelRoutineReminders();

  const morningId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Morning Routine",
      body: "Time for your morning skincare steps.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: 8,
      minute: 0,
      repeats: true,
    },
  });

  const eveningId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Evening Routine",
      body: "Time for your evening skincare steps.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: 21,
      minute: 0,
      repeats: true,
    },
  });

  await setReminderIds([morningId, eveningId]);
  await setRoutineRemindersEnabled(true);
}

export async function sendTestRoutineNotification(): Promise<void> {
  const permissions = await Notifications.getPermissionsAsync();
  const granted =
    permissions.granted ||
    (await Notifications.requestPermissionsAsync()).granted;

  if (!granted) {
    throw new Error("Notification permission was not granted.");
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Routine Reminder Test",
      body: "If you see this, notifications are working.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      repeats: false,
    },
  });
}
