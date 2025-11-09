import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { getTasks, updateTask, deleteTask } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const ArchivedTasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const allTasks = await getTasks();
      setTasks(allTasks.filter(task => task.archived));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as tarefas arquivadas.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const handleUnarchive = async (task) => {
    try {
      await updateTask(task.id, { archived: false });
      fetchTasks();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível desarquivar a tarefa.');
    }
  };

  const handleDelete = async (task) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir permanentemente a tarefa "${task.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await deleteTask(task.id);
              fetchTasks();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskContainer}>
      <Text style={styles.taskName}>{item.name}</Text>
      <View style={styles.icons}>
        <TouchableOpacity onPress={() => handleUnarchive(item)}>
          <MaterialIcons name="unarchive" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <MaterialIcons name="delete-forever" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Voltar" onPress={() => navigation.goBack()} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text>Nenhuma tarefa arquivada.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  taskContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#ccc' },
  taskName: { fontSize: 18 },
  icons: { flexDirection: 'row', width: 60, justifyContent: 'space-between' },
});

export default ArchivedTasksScreen;
