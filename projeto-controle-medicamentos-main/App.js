import React, { useState, useEffect, createContext, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ===================
// CONFIGURAÇÃO MOCKAPI
// ===================
const API_BASE = "https://68b09bc33b8db1ae9c047dcd.mockapi.io";
const MEDICINES_PATH = "/remedio";
const TOKEN_KEY = "@medcontrol_token";

// ===================
// CONTEXTO DE AUTENTICAÇÃO
// ===================
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(TOKEN_KEY);
      if (stored) setToken(stored);
      setLoading(false);
    })();
  }, []);

  const login = async (username, password) => {
    if (username === "user" && password === "1234") {
      await AsyncStorage.setItem(TOKEN_KEY, "logged-in");
      setToken("logged-in");
    } else {
      throw new Error("Usuário ou senha inválidos");
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ===================
// TELAS
// ===================

// Login
function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login(username, password);
    } catch (err) {
      Alert.alert("Erro", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Controle de Medicamentos</Text>
        <TextInput
          style={styles.input}
          placeholder="Usuário"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Home
function HomeScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Início</Text>
        <TouchableOpacity
          style={styles.btnHome}
          onPress={() => navigation.navigate("Medicines")}
        >
          <Text style={styles.btnTextHome}>Lista de Medicamentos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnHome}
          onPress={() => navigation.navigate("NewMedicine")}
        >
          <Text style={styles.btnTextHome}>Cadastrar Novo Medicamento</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnHome, { backgroundColor: "#ef4444" }]}
          onPress={logout}
        >
          <Text style={styles.btnTextHome}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Lista de Medicamentos
function MedicinesListScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}${MEDICINES_PATH}`);
      const meds = await res.json();
      setData(Array.isArray(meds) ? meds : []);
    } catch (e) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}${MEDICINES_PATH}/${id}`, { method: "DELETE" });
      setData((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      Alert.alert("Erro", e.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardList}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nameList}>{item.name}</Text>
        <Text style={styles.detailsList}>
          {item.dosage} • {item.schedule}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={styles.delBtnList}
      >
        <Text style={styles.delTextList}>Excluir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Medicamentos</Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(it) => String(it.id)}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.emptyList}>Nenhum medicamento cadastrado.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// Cadastro de Medicamento
function MedicineFormScreen({ navigation }) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [schedule, setSchedule] = useState("");
  const [note, setNote] = useState("");

  const save = async () => {
    if (!name || !dosage || !schedule)
      return Alert.alert("Erro", "Preencha todos os campos obrigatórios.");

    const payload = { name, dosage, schedule, note, createdAt: new Date().toISOString() };

    try {
      await fetch(`${API_BASE}${MEDICINES_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      Alert.alert("Sucesso", "Medicamento cadastrado!");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erro", e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Cadastrar Medicamento</Text>
        <TextInput
          placeholder="Nome"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Dosagem (ex: 500mg)"
          value={dosage}
          onChangeText={setDosage}
          style={styles.input}
        />
        <TextInput
          placeholder="Horário (ex: 08:00 / 14:00)"
          value={schedule}
          onChangeText={setSchedule}
          style={styles.input}
        />
        <TextInput
          placeholder="Observações"
          value={note}
          onChangeText={setNote}
          style={[styles.input, { height: 100 }]}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={save}>
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ===================
// NAVEGAÇÃO
// ===================
const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} />;

  return (
    <Stack.Navigator>
      {!token ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Medicines" component={MedicinesListScreen} />
          <Stack.Screen name="NewMedicine" component={MedicineFormScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// ===================
// APP PRINCIPAL
// ===================
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

// ===================
// ESTILOS
// ===================
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  btnHome: { backgroundColor: "#4f46e5", padding: 14, borderRadius: 10, marginBottom: 10 },
  btnTextHome: { color: "#fff", fontWeight: "700", textAlign: "center" },
  cardList: { flexDirection: "row", backgroundColor: "#f1f5f9", padding: 12, borderRadius: 8, marginBottom: 8, alignItems: "center" },
  nameList: { fontWeight: "700", fontSize: 16 },
  detailsList: { color: "#6b7280" },
  delBtnList: { backgroundColor: "#ef4444", padding: 8, borderRadius: 8 },
  delTextList: { color: "#fff", fontWeight: "700" },
  emptyList: { color: "#94a3b8", marginTop: 20 },
});
