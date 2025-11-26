import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, 
    TouchableOpacity, Modal, FlatList, RefreshControl, LayoutAnimation, Platform, UIManager 
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
// Asegúrate de importar tus rutas correctas aquí
import { getAnalytics } from '../api/evaluationRequests'; 
import { getSubjects } from '../api/coursesRequests';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { StyledButton } from '../components/StyledButton';

const screenWidth = Dimensions.get("window").width;

// Habilitar animaciones para Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AnalyticsScreen() {
    const { t } = useLanguage();
    
    // Estados de Datos
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Estados de Filtros
    const [groupBy, setGroupBy] = useState('topic'); 
    const [selectedSubject, setSelectedSubject] = useState(null); 
    const [showFilters, setShowFilters] = useState(false); // <--- NUEVO: Estado para ocultar/mostrar
    
    // Estados para Modales
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterOptions, setFilterOptions] = useState([]); 

    // Cargar asignaturas
    const handleOpenSubjectFilter = async () => {
        try {
            const subjects = await getSubjects(); 
            setFilterOptions(subjects);
            setShowFilterModal(true);
        } catch (error) {
            console.error("Error cargando asignaturas", error);
        }
    };

    const handleSelectOption = (item) => {
        setSelectedSubject(item);
        setShowFilterModal(false);
    };

    // Toggle de filtros con animación
    const toggleFilters = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowFilters(!showFilters);
    };

    // Función de carga de datos
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                group_by: groupBy,
                subject_id: selectedSubject?.id,
            };
            const data = await getAnalytics(params);
            setChartData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [groupBy, selectedSubject]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [groupBy, selectedSubject]);

    // Configuración de la Gráfica
    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(13, 148, 136, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        decimalPlaces: 0,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        propsForLabels: { fontSize: 10 }
    };

    const dataForChart = {
        labels: chartData.map(item => item.label),
        datasets: [{ data: chartData.map(item => item.value) }]
    };

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
        >
            <Text style={styles.headerTitle}>{t('performanceAnalytics') || 'Analíticas de Rendimiento'}</Text>

            {/* SECCIÓN DE FILTROS (MODIFICADA) */}
            <View style={styles.filterContainer}>
                {/* Cabecera del desplegable */}
                <TouchableOpacity onPress={toggleFilters} style={styles.filterHeader}>
                    <Text style={styles.filterTitle}>{t('filters') || 'Filtros y Configuración'}</Text>
                    <Text style={styles.filterIcon}>{showFilters ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {/* Contenido ocultable */}
                {showFilters && (
                    <View style={styles.filterContent}>
                        {/* Selector de Agrupación (2 filas si es necesario) */}
                        <Text style={styles.label}>{t('groupBy') || 'Agrupar por:'}</Text>
                        
                        
                        <View style={styles.tabs}>
                            {['topic', 'concept', 'group', 'question'].map((mode) => (
                                <TouchableOpacity 
                                    key={mode} 
                                    style={[styles.tab, groupBy === mode && styles.activeTab]}
                                    onPress={() => setGroupBy(mode)}
                                >
                                    <Text style={[styles.tabText, groupBy === mode && styles.activeTabText]}>
                                        {t(mode) || mode.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Filtro de Asignatura */}
                        <View style={{ marginTop: 15 }}>
                            <Text style={styles.label}>{t('filterBy') || 'Filtrar por:'}</Text>
                            <StyledButton 
                                title={selectedSubject ? `${t('subject')}: ${selectedSubject.name}` : t('allSubjects') || "Todas las Asignaturas"} 
                                onPress={handleOpenSubjectFilter}
                                style={{ backgroundColor: selectedSubject ? COLORS.secondary : '#e5e7eb' }}
                                textStyle={{ color: selectedSubject ? 'white' : 'black' }}
                            />
                            {selectedSubject && (
                                <TouchableOpacity onPress={() => setSelectedSubject(null)} style={{marginTop: 8, alignItems: 'center'}}>
                                    <Text style={{color: '#ef4444', fontSize: 14, fontWeight: '500'}}>{t('clearFilter') || "Limpiar filtro"}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>

            {/* GRÁFICA */}
            {loading && !refreshing ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}}/>
            ) : chartData.length > 0 ? (
                <View style={styles.chartWrapper}>
                    <Text style={styles.chartTitle}>
                        {t('percentageCorrect') || '% de Aciertos'}
                    </Text>
                    
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                        <BarChart
                            data={dataForChart}
                            width={Math.max(screenWidth - 40, chartData.length * 60)} 
                            height={300}
                            yAxisLabel=""
                            yAxisSuffix="%"
                            chartConfig={chartConfig}
                            verticalLabelRotation={30}
                            fromZero={true}
                            showValuesOnTopOfBars={true}
                            withInnerLines={true}
                        />
                    </ScrollView>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t('noData') || 'No hay datos suficientes para mostrar gráficas.'}</Text>
                </View>
            )}

            {/* TABLA DE DETALLES */}
            {!loading && chartData.length > 0 && (
                <View style={styles.detailsContainer}>
                    <Text style={styles.subTitle}>{t('details') || 'Detalles'}</Text>
                    {chartData.map((item, index) => (
                        <View key={index} style={styles.row}>
                            <View style={{flex: 1, paddingRight: 10}}>
                                <Text style={styles.rowLabel}>{item.full_label}</Text>
                            </View>
                            
                            <View style={styles.rowStats}>
                                <Text style={[
                                    styles.rowValue, 
                                    item.value < 50 ? {color: '#ef4444'} : {color: '#10b981'}
                                ]}>
                                    {item.value}%
                                </Text>
                                <Text style={styles.rowAttempts}>({item.attempts})</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* MODAL (Sin Cambios) */}
            <Modal visible={showFilterModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('selectSubject') || 'Seleccionar Asignatura'}</Text>
                        <FlatList
                            data={filterOptions}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.modalItem}
                                    onPress={() => handleSelectOption(item)}
                                >
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <StyledButton 
                            title={t('close') || "Cerrar"} 
                            onPress={() => setShowFilterModal(false)} 
                            style={{backgroundColor: '#ef4444', marginTop: 10}}
                        />
                    </View>
                </View>
            </Modal>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },
    
    // --- ESTILOS FILTROS MODIFICADOS ---
    filterContainer: { 
        backgroundColor: 'white', 
        borderRadius: 10, 
        marginBottom: 20, 
        elevation: 2,
        overflow: 'hidden' // Importante para la animación
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white'
    },
    filterTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    filterIcon: { fontSize: 18, color: 'gray' },
    filterContent: { padding: 15, paddingTop: 0, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    
    label: { fontSize: 14, color: 'gray', marginBottom: 10, marginTop: 10, fontWeight: '600' },
    
    // Contenedor de Tabs con Wrap
    tabs: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', // <--- Permite salto de línea
        justifyContent: 'space-between', // Espaciado uniforme
        backgroundColor: '#f3f4f6', 
        borderRadius: 8, 
        padding: 4 
    },
    // Botones individuales
    tab: { 
        width: '48%', // <--- Fuerza 2 elementos por fila (aprox 50%)
        paddingVertical: 10, // Un poco más alto para mejor tacto
        alignItems: 'center', 
        borderRadius: 6,
        marginBottom: 4, // Espacio vertical entre filas si hay salto
        marginTop: 4
    },
    activeTab: { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
    tabText: { color: 'gray', fontSize: 11, fontWeight: '600' },
    activeTabText: { color: COLORS.primary, fontWeight: 'bold' },

    // ... Resto de estilos iguales ...
    chartWrapper: { backgroundColor: 'white', padding: 10, borderRadius: 10, alignItems: 'center', elevation: 2, marginBottom: 20 },
    chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    emptyContainer: { alignItems: 'center', marginTop: 50, padding: 20 },
    emptyText: { color: 'gray', fontStyle: 'italic', textAlign: 'center' },
    detailsContainer: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 40, elevation: 2 },
    subTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    rowLabel: { flex: 1, fontSize: 14, color: '#333', lineHeight: 20 },
    rowStats: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', minWidth: 50 },
    rowValue: { fontWeight: 'bold', fontSize: 16 },
    rowAttempts: { fontSize: 11, color: 'gray' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 20, maxHeight: '60%', elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalItemText: { fontSize: 16 },
});