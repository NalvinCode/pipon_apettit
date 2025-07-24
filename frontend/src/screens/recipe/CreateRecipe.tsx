import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Receta, RecipeStackParamList, Categoria, Ingrediente, Paso } from '@/types';
import { recipeService } from '@/services/recipe';
import { useAuth } from '@/contexts/AuthContext';
import DropDownPicker from 'react-native-dropdown-picker';

type RecipeDetailScreenNavigationProp = StackNavigationProp<RecipeStackParamList, 'CreateRecipe'>;
type RecipeDetailcreenRouteProp = RouteProp<RecipeStackParamList, 'CreateRecipe'>;

interface Props {
  navigation: RecipeDetailScreenNavigationProp;
  route: RecipeDetailcreenRouteProp;
}

const UNIDADES = [
{ label: 'Gramos', value: 'gr' },
{ label: 'Kilos', value: 'kg' },
{ label: 'Unidades', value: 'ud' },
{ label: 'Cucharada', value: 'cda' },
{ label: 'Cucharadita', value: 'cdta' }
];
const { width } = Dimensions.get('window');

const CreateRecipeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [porciones, setPorciones] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [pasos, setPasos] = useState<Paso[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<Categoria[]>([]);
  const [media, setMedia] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [openUnidades, setOpenUnidades] = useState(false);
  const [unidad, setUnidad] = useState(null);

  // Estados para modales
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showIngredienteModal, setShowIngredienteModal] = useState(false);
  const [showPasoModal, setShowPasoModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Estados para formularios de ingredientes y pasos
  const [nuevoIngrediente, setNuevoIngrediente] = useState({
    nombre: '',
    cantidad: '',
    unidad: ''
  });
  const [nuevoPaso, setNuevoPaso] = useState({
    descripcion: '',
    media: []
  });
  const [editingPasoIndex, setEditingPasoIndex] = useState<number | null>(null);

  // Solicitar permisos para cámara y galería
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Se necesitan permisos de cámara y galería para agregar imágenes a las recetas.'
      );
    }
  };

  const fetchCategorias = async () => {
    try {
      setLoading(true);

      const response = await recipeService.getCategorias();

      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          setCategorias(response.data);
          console.log(`📋 ${response.data.length} categorias cargadas correctamente`);
        } else {
          console.warn('⚠️ Formato de respuesta inesperado:', response.data);
          setCategorias([]);
        }
      } else {
        console.log('❌ Error en la respuesta:', response.message);
        setCategorias([]);
      }

    } catch (error: any) {
      setCategorias([]);

      if (error.code === 'NETWORK_ERROR') {
        Alert.alert(
          'Error de Conexión',
          'No se pudo conectar al servidor. Verifica tu conexión a internet.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Funciones para manejo de imágenes
  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const uploadImage = async (imageUri: string) => {
    try {
      setUploadingImage(true);

      // Crear FormData para subir la imagen
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `recipe_${Date.now()}.jpg`,
      } as any);

      // Llamar al servicio para subir la imagen
      const response = await recipeService.subirImagen(formData);

      if (response.success && response.data.url) {
        setMedia(prevMedia => [...prevMedia, response.data.url]);
        setShowImageModal(false);
        Alert.alert('Éxito', 'Imagen subida correctamente');
      } else {
        throw new Error(response.message || 'Error al subir imagen');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'No se pudo subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    Alert.alert(
      'Eliminar imagen',
      '¿Estás seguro de que quieres eliminar esta imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setMedia(media.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const agregarIngrediente = () => {
    if (nuevoIngrediente.nombre && nuevoIngrediente.cantidad) {
      const ingrediente: Ingrediente = {
        nombre: nuevoIngrediente.nombre,
        cantidad: Number(nuevoIngrediente.cantidad),
        unidad: unidad
      };
      setIngredientes([...ingredientes, ingrediente]);
      setUnidad(null);
      setNuevoIngrediente({ nombre: '', cantidad: '', unidad});
      setShowIngredienteModal(false);
    }
  };

  const eliminarIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const agregarPaso = () => {
    if (nuevoPaso.descripcion) {
      if (editingPasoIndex !== null) {
        const pasosActualizados = [...pasos];
        pasosActualizados[editingPasoIndex] = {
          orden: editingPasoIndex + 1,
          descripcion: nuevoPaso.descripcion,
          media: nuevoPaso.media
        };
        setPasos(pasosActualizados);
        setEditingPasoIndex(null);
      } else {
        const paso: Paso = {
          orden: pasos.length + 1,
          descripcion: nuevoPaso.descripcion,
          media: nuevoPaso.media
        };
        setPasos([...pasos, paso]);
      }
      setNuevoPaso({ descripcion: '', media: [] });
      setShowPasoModal(false);
    }
  };

  const editarPaso = (index: number) => {
    setNuevoPaso({
      descripcion: pasos[index].descripcion,
      media: pasos[index].media
    });
    setEditingPasoIndex(index);
    setShowPasoModal(true);
  };

  const eliminarPaso = (index: number) => {
    setPasos(pasos.filter((_, i) => i !== index).map((paso, i) => ({
      ...paso,
      orden: i + 1
    })));
  };

  const toggleCategoria = (categoria: Categoria) => {
    const yaSeleccionada = categoriasSeleccionadas.find(c => c.id === categoria.id);
    if (yaSeleccionada) {
      setCategoriasSeleccionadas(categoriasSeleccionadas.filter(c => c.id !== categoria.id));
    } else {
      setCategoriasSeleccionadas([...categoriasSeleccionadas, categoria]);
    }
  };

  const validarFormulario = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre de la receta es obligatorio');
      return false;
    }
    if (!porciones || Number(porciones) <= 0) {
      Alert.alert('Error', 'Las porciones deben ser un número mayor a 0');
      return false;
    }
    if (!descripcion.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return false;
    }
    if (!tiempo || Number(tiempo) <= 0) {
      Alert.alert('Error', 'El tiempo debe ser un número mayor a 0');
      return false;
    }
    if (ingredientes.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos un ingrediente');
      return false;
    }
    if (pasos.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos un paso');
      return false;
    }
    return true;
  };

  const guardarReceta = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const nuevaReceta: Omit<Receta, 'id' | 'fechaCreacion' | 'valoracionPromedio'> = {
        nombre: nombre.trim(),
        porciones: Number(porciones),
        descripcion: descripcion.trim(),
        ingredientes,
        pasos,
        categorias: categoriasSeleccionadas,
        media,
        usuario: user?.id || '',
        tiempo: Number(tiempo),
      };

      await recipeService.createRecipe(nuevaReceta);
      Alert.alert('Éxito', 'Receta creada exitosamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la receta');
    } finally {
      setLoading(false);
    }
  };

  const renderIngredienteItem = ({ item, index }: { item: Ingrediente; index: number }) => (
    <View className="flex-row items-center justify-between bg-brown-50 p-3 rounded-lg mb-2">
      <Text className="flex-1 text-brown-800">
        {item.nombre} - {item.cantidad.toString()} {item.unidad}
      </Text>
      <TouchableOpacity
        onPress={() => eliminarIngrediente(index)}
        className="p-1"
      >
        <Ionicons name="trash-outline" size={20} color="#B3390C" />
      </TouchableOpacity>
    </View>
  );

  const renderPasoItem = ({ item, index }: { item: Paso; index: number }) => (
    <View className="bg-brown-50 p-3 rounded-lg mb-2">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-bold text-brown-800">Paso {item.orden}</Text>
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => editarPaso(index)}
            className="p-1 mr-2"
          >
            <Ionicons name="pencil-outline" size={20} color="#FF6B1A" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => eliminarPaso(index)}
            className="p-1"
          >
            <Ionicons name="trash-outline" size={20} color="#B3390C" />
          </TouchableOpacity>
        </View>
      </View>
      <Text className="text-brown-700">{item.descripcion}</Text>
    </View>
  );

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <View className="mr-3 mb-3">
      <Image
        source={{ uri: item }}
        resizeMode="cover"
      />
      <TouchableOpacity
        onPress={() => removeImage(index)}
        className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
      >
        <Ionicons name="close" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#8B4513" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-brown-800">Nueva Receta</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Información básica */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brown-800 mb-3">Información Básica</Text>

          <View className="mb-4">
            <Text className="text-brown-700 mb-2">Nombre de la receta *</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Pasta con salsa boloñesa"
              className="bg-white p-3 rounded-lg border border-brown-200"
            />
          </View>

          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-brown-700 mb-2">Porciones *</Text>
              <TextInput
                value={porciones}
                onChangeText={setPorciones}
                placeholder="4"
                keyboardType="numeric"
                className="bg-white p-3 rounded-lg border border-brown-200"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-brown-700 mb-2">Tiempo (min) *</Text>
              <TextInput
                value={tiempo}
                onChangeText={setTiempo}
                placeholder="30"
                keyboardType="numeric"
                className="bg-white p-3 rounded-lg border border-brown-200"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-brown-700 mb-2">Descripción *</Text>
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe tu receta..."
              multiline
              numberOfLines={3}
              className="bg-white p-3 rounded-lg border border-brown-200"
            />
          </View>
        </View>

        {/* Imágenes */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-brown-800">Imágenes</Text>
            <TouchableOpacity
              onPress={() => setShowImageModal(true)}
              className="bg-primary-500 px-4 py-2 rounded-lg"
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-medium">Agregar</Text>
              )}
            </TouchableOpacity>
          </View>

          {media.length > 0 ? (
            <FlatList
              data={media}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View className="bg-brown-100 border-2 border-dashed border-brown-300 rounded-lg p-8 items-center">
              <Ionicons name="image-outline" size={48} color="#B8A898" />
              <Text className="text-brown-500 mt-2 text-center">
                Agrega imágenes para hacer tu receta más atractiva
              </Text>
            </View>
          )}
        </View>

        {/* Categorías */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-brown-800">Categorías</Text>
            <TouchableOpacity
              onPress={() => setShowCategoriaModal(true)}
              className="bg-primary-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Seleccionar</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap">
            {categoriasSeleccionadas.map((categoria) => (
              <View key={categoria.id} className="bg-accent-200 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-brown-800 text-sm">{categoria.nombre}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ingredientes */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-brown-800">Ingredientes</Text>
            <TouchableOpacity
              onPress={() => setShowIngredienteModal(true)}
              className="bg-primary-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Agregar</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={ingredientes}
            renderItem={renderIngredienteItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Pasos */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-brown-800">Pasos de preparación</Text>
            <TouchableOpacity
              onPress={() => setShowPasoModal(true)}
              className="bg-primary-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Agregar</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={pasos}
            renderItem={renderPasoItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          onPress={guardarReceta}
          disabled={loading || uploadingImage}
          className="bg-primary-500 p-4 rounded-lg items-center mb-6"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Guardar Receta</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para seleccionar imagen */}
      <Modal
        visible={showImageModal}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white w-4/5 rounded-lg p-6">
            <Text className="text-lg font-bold text-brown-800 mb-6 text-center">
              Agregar Imagen
            </Text>

            <TouchableOpacity
              onPress={takePhoto}
              className="bg-primary-500 p-4 rounded-lg mb-3 flex-row items-center justify-center"
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text className="text-white font-medium ml-3">Tomar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImageFromGallery}
              className="bg-brown-500 p-4 rounded-lg mb-4 flex-row items-center justify-center"
            >
              <Ionicons name="images" size={24} color="white" />
              <Text className="text-white font-medium ml-3">Seleccionar de Galería</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowImageModal(false)}
              className="bg-brown-300 p-3 rounded-lg"
            >
              <Text className="text-brown-800 text-center font-medium">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Resto de modales (categorías, ingredientes, pasos) - igual que antes */}
      {/* Modal Categorías */}
      <Modal visible={showCategoriaModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white w-4/5 max-h-96 rounded-lg p-4">
            <Text className="text-lg font-bold text-brown-800 mb-4">Seleccionar Categorías</Text>
            <FlatList
              data={categorias}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => toggleCategoria(item)}
                  className={`p-3 rounded-lg mb-2 ${categoriasSeleccionadas.find(c => c.id === item.id)
                    ? 'bg-primary-300'
                    : 'bg-brown-50'
                    }`}
                >
                  <Text className="text-brown-800">{item.nombre}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
            <TouchableOpacity
              onPress={() => setShowCategoriaModal(false)}
              className="bg-primary-500 p-3 rounded-lg mt-4"
            >
              <Text className="text-white text-center font-medium">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Ingredientes */}
      <Modal visible={showIngredienteModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white w-4/5 rounded-lg p-4">
            <Text className="text-lg font-bold text-brown-800 mb-4">Agregar Ingrediente</Text>

            <TextInput
              value={nuevoIngrediente.nombre}
              onChangeText={(text) => setNuevoIngrediente({ ...nuevoIngrediente, nombre: text })}
              placeholder="Nombre del ingrediente"
              className="bg-brown-50 p-3 rounded-lg mb-3"
            />

            <View className="flex-row mb-3">
              <TextInput
                value={nuevoIngrediente.cantidad}
                onChangeText={(text) => setNuevoIngrediente({ ...nuevoIngrediente, cantidad: text })}
                placeholder="Cantidad"
                keyboardType="numeric"
                className="bg-brown-50 p-3 rounded-lg flex-1 mr-2"
              />

              <View className="flex-1 ml-2">
                  <DropDownPicker
                    open={openUnidades}
                    value={unidad}
                    items={UNIDADES}
                    setOpen={setOpenUnidades}
                    setValue={setUnidad}
                    placeholder='Unidad'
                  />
              </View>
            </View>

            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setShowIngredienteModal(false)}
                className="bg-brown-300 p-3 rounded-lg flex-1 mr-2"
              >
                <Text className="text-brown-800 text-center">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={agregarIngrediente}
                className="bg-primary-500 p-3 rounded-lg flex-1 ml-2"
                disabled={!nuevoIngrediente.cantidad || !nuevoIngrediente.nombre || !unidad}
              >
                <Text className="text-white text-center font-medium">Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Pasos */}
      <Modal visible={showPasoModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white w-4/5 rounded-lg p-4">
            <Text className="text-lg font-bold text-brown-800 mb-4">
              {editingPasoIndex !== null ? 'Editar Paso' : 'Agregar Paso'}
            </Text>

            <TextInput
              value={nuevoPaso.descripcion}
              onChangeText={(text) => setNuevoPaso({ ...nuevoPaso, descripcion: text })}
              placeholder="Descripción del paso"
              multiline
              numberOfLines={4}
              className="bg-brown-50 p-3 rounded-lg mb-3"
            />

            <View className="flex-row">
              <TouchableOpacity
                onPress={() => {
                  setShowPasoModal(false);
                  setEditingPasoIndex(null);
                  setNuevoPaso({ descripcion: '', media: [] });
                }}
                className="bg-brown-300 p-3 rounded-lg flex-1 mr-2"
              >
                <Text className="text-brown-800 text-center">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={agregarPaso}
                className="bg-primary-500 p-3 rounded-lg flex-1 ml-2"
              >
                <Text className="text-white text-center font-medium">
                  {editingPasoIndex !== null ? 'Actualizar' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CreateRecipeScreen;