import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api, type ApiHabit } from '../../src/api';

export default function HabitDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const [habit, setHabit] = useState<ApiHabit | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Re-fetch whenever the route params change so deep links work.
  useEffect(() => {
    let cancelled = false;
    if (!params.id) return;
    api.getHabit(params.id).then(({ habit: h }) => {
      if (cancelled) return;
      setHabit(h);
      setNotes(h.notes ?? '');
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  async function onSave() {
    if (!habit) return;
    setSaving(true);
    try {
      const { habit: updated } = await api.updateHabit(habit.id, { notes });
      setHabit(updated);
    } finally {
      setSaving(false);
    }
  }

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text style={styles.meta}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{habit.name}</Text>
      <Text style={styles.meta}>
        Created {new Date(habit.createdAt).toLocaleDateString()}
      </Text>

      <View style={{ height: 16 }} />
      <Text style={styles.heading}>Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Anything to remember about this habit?"
        style={styles.notesInput}
        multiline
      />
      <Text style={styles.hint}>
        Supports **bold** and _italic_. Rendered on the admin dashboard.
      </Text>
      <View style={{ height: 8 }} />
      <Button title={saving ? 'Saving…' : 'Save notes'} onPress={onSave} disabled={saving} />

      <View style={{ height: 24 }} />
      <Text style={styles.heading}>Check-ins ({habit.checkins.length})</Text>
      {habit.checkins
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map((c) => (
          <Text key={c.date} style={styles.checkin}>
            {c.date}
          </Text>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fafafa', flexGrow: 1 },
  name: { fontSize: 22, fontWeight: '700' },
  meta: { color: '#888', marginTop: 4 },
  heading: { fontWeight: '600', marginBottom: 8 },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    backgroundColor: 'white',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: { color: '#999', fontSize: 12, marginTop: 6 },
  checkin: { paddingVertical: 4, color: '#333' },
});
