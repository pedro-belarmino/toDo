import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { createTask } from '../services/api';

const CreateTaskScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTask = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome da tarefa é obrigatório.');
      return;
    }

    setLoading(true);
    try {
      const newTask = {
        name,
        description,
        completed: false,
        archived: false,
      };
      await createTask(newTask);
      Alert.alert('Sucesso', 'Tarefa criada com sucesso!');
      navigation.navigate('ManageTasks');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a tarefa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome da Tarefa</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Digite o nome da tarefa"
      />
      <Text style={styles.label}>Descrição (Opcional)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Digite a descrição da tarefa"
        multiline
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Criar Tarefa" onPress={handleCreateTask} />
      )}
      <View style={styles.buttonSpacing} />
      <Button
        title="Ver Minhas Tarefas"
        onPress={() => navigation.navigate('ManageTasks')}
        color="#6c757d"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
    buttonSpacing: {
    marginVertical: 10,
  },
});

export default CreateTaskScreen;
