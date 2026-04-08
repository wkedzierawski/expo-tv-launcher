import ExpoTvLauncher, { useLauncher } from "expo-tv-launcher";
import { useState } from "react";
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function App() {
  const {
    currentHomePackage,
    disableLauncher,
    enableLauncher,
    launchTargetApp,
    openHomeSettings,
    launcherEnabled,
    refresh,
    setTargetPackage,
    status,
    targetLaunchable,
    targetPackage,
  } = useLauncher();
  const [draftPackage, setDraftPackage] = useState(targetPackage ?? "");
  const copy = messages.en;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>{copy.title}</Text>
        <Group name={copy.targetSection}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setDraftPackage}
            placeholder={copy.packagePlaceholder}
            style={styles.input}
            value={draftPackage}
          />
          <Button
            title={copy.saveTarget}
            onPress={() => {
              setTargetPackage(draftPackage || null);
            }}
          />
          <View style={styles.spacer} />
          <Button
            title={copy.clearTarget}
            onPress={() => {
              setDraftPackage("");
              setTargetPackage(null);
            }}
          />
        </Group>

        <Group name={copy.actionsSection}>
          <Button
            title={copy.enableLauncher}
            onPress={async () => {
              await enableLauncher();
            }}
          />
          <View style={styles.spacer} />
          <Button
            title={copy.disableLauncher}
            onPress={async () => {
              await disableLauncher();
            }}
          />
          <View style={styles.spacer} />
          <Button title={copy.launchTarget} onPress={launchTargetApp} />
          <View style={styles.spacer} />
          <Button
            title={copy.launchSpecific}
            onPress={() => ExpoTvLauncher.openTargetApp(draftPackage)}
          />
          <View style={styles.spacer} />
          <Button title={copy.openHomeSettings} onPress={openHomeSettings} />
          <View style={styles.spacer} />
          <Button title={copy.refreshStatus} onPress={refresh} />
        </Group>

        <Group name={copy.statusSection}>
          <StatusRow
            label={copy.savedTarget}
            value={targetPackage ?? copy.none}
          />
          <StatusRow
            label={copy.launcherEnabledLabel}
            value={String(launcherEnabled)}
          />
          <StatusRow
            label={copy.currentHomePackageLabel}
            value={currentHomePackage ?? copy.none}
          />
          <StatusRow
            label={copy.targetLaunchableLabel}
            value={String(targetLaunchable)}
          />
          <StatusRow
            label={copy.statusSnapshotLabel}
            value={JSON.stringify(status)}
          />
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusRow(props: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{props.label}</Text>
      <Text style={styles.value}>{props.value}</Text>
    </View>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const messages = {
  en: {
    title: "Launcher Demo",
    targetSection: "Target app",
    actionsSection: "Actions",
    statusSection: "Status",
    packagePlaceholder: "com.example.tvapp",
    saveTarget: "Save target package",
    clearTarget: "Clear target package",
    enableLauncher: "Enable launcher",
    disableLauncher: "Disable launcher",
    launchTarget: "Launch saved target",
    launchSpecific: "Launch typed package",
    openHomeSettings: "Open Home settings",
    refreshStatus: "Refresh status",
    savedTarget: "Saved target",
    launcherEnabledLabel: "Launcher enabled",
    currentHomePackageLabel: "Current HOME package",
    targetLaunchableLabel: "Target launchable",
    statusSnapshotLabel: "Status snapshot",
    none: "none",
  },
} as const;

const styles = StyleSheet.create({
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
  input: {
    borderColor: "#bbb",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  spacer: {
    height: 12,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    color: "#555",
    marginBottom: 4,
  },
  value: {
    color: "#111",
    fontSize: 15,
  },
});
