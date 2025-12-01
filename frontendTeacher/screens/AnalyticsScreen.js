import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, 
    TouchableOpacity, Modal, FlatList, RefreshControl, Platform, UIManager 
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getAnalytics } from '../api/evaluationRequests'; 
import { getSubjects } from '../api/coursesRequests';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { StyledButton } from '../components/StyledButton';

const screenWidth = Dimensions.get("window").width;

// Habilitar animaciones SOLO para Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AnalyticsScreen({ route }) {
    const { t } = useLanguage();
    
    // Recupera el parámetro, si no existe usa 'topic' por defecto
    const { initialGroupBy } = route.params || {};

    // Estados
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Filtros
    const [groupBy, setGroupBy] = useState(initialGroupBy || 'topic'); 
    const [selectedSubject, setSelectedSubject] = useState(null); 
    const [showFilters, setShowFilters] = useState(false);
    
    // Modal
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterOptions, setFilterOptions] = useState([]); 

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

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

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

    // --- LÓGICA DE PREFIJOS ---
    const getPrefix = () => {
        switch (groupBy) {
            case 'topic': return 'T';     // T1, T2...
            case 'concept': return 'C';   // C1, C2...
            case 'group': return 'G';     // G1, G2...
            case 'question': return 'Q';  // Q1, Q2...
            default: return '';
        }
    };

    const prefix = getPrefix();

    // Generamos las etiquetas cortas para la gráfica
    const dataForChart = {
        labels: chartData.map((_, index) => `${prefix}${index + 1}`),
        datasets: [{ data: chartData.map(item => item.value) }]
    };

    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(13, 148, 136, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.6,
        decimalPlaces: 0,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        propsForLabels: { fontSize: 11, fontWeight: 'bold' }
    };

    // Ancho calculado: Ahora es mucho más predecible porque las etiquetas son cortas
    // 40px por barra es suficiente
    const chartWidth = Math.max(screenWidth - 40, chartData.length * 40);

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
        >
            <Text style={styles.headerTitle}>{t('performanceAnalytics') || 'Analíticas de Rendimiento'}</Text>

            {/* SECCIÓN DE FILTROS */}
            <View style={styles.filterContainer}>
                <TouchableOpacity onPress={toggleFilters} style={styles.filterHeader}>
                    <Text style={styles.filterTitle}>{t('filters') || 'Filtros y Configuración'}</Text>
                    <Text style={styles.filterIcon}>{showFilters ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {showFilters && (
                    <View style={styles.filterContent}>
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
                            width={chartWidth} 
                            height={260} 
                            yAxisLabel=""
                            yAxisSuffix="%"
                            chartConfig={chartConfig}
                            verticalLabelRotation={0}
                
                            showValuesOnTopOfBars={true} 
                            
                            fromZero={true}
                            withInnerLines={true}
                        />
                    </ScrollView>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t('noData') || 'No hay datos suficientes para mostrar gráficas.'}</Text>
                </View>
            )}

            {/* TABLA DE DETALLES (LEYENDA) */}
            {!loading && chartData.length > 0 && (
                <View style={styles.detailsContainer}>
                    <Text style={styles.subTitle}>{t('details') || 'Leyenda y Detalles'}</Text>
                    
                    {chartData.map((item, index) => (
                        <View key={index} style={styles.row}>
                            {/* CÓDIGO + NOMBRE COMPLETO */}
                            <View style={{flex: 1, paddingRight: 10}}>
                                <Text style={styles.rowLabel}>
                                    <Text style={{fontWeight: 'bold', color: COLORS.primary}}>
                                        {`${prefix}${index + 1}: `}
                                    </Text>
                                    {item.full_label || item.label}
                                </Text>
                            </View>
                            
                            {/* VALORES */}
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

            {/* MODAL */}
            <Modal 
                visible={showFilterModal} 
                animationType="slide" 
                transparent={true}
                hardwareAccelerated={Platform.OS !== 'web'}
            >
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
    
    filterContainer: { 
        backgroundColor: 'white', 
        borderRadius: 10, 
        marginBottom: 20, 
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2 },
            android: { elevation: 2 },
            web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }
        }),
        overflow: 'hidden' 
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white',
        ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {})
    },
    filterTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    filterIcon: { fontSize: 18, color: 'gray' },
    filterContent: { padding: 15, paddingTop: 0, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    
    label: { fontSize: 14, color: 'gray', marginBottom: 10, marginTop: 10, fontWeight: '600' },
    
    tabs: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        backgroundColor: '#f3f4f6', 
        borderRadius: 8, 
        padding: 4 
    },
    tab: { 
        width: '48%', 
        paddingVertical: 10, 
        alignItems: 'center', 
        borderRadius: 6,
        marginBottom: 4, 
        marginTop: 4,
        ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {})
    },
    activeTab: { 
        backgroundColor: 'white', 
        ...Platform.select({
            android: { elevation: 2 },
            default: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }
        })
    },
    tabText: { color: 'gray', fontSize: 11, fontWeight: '600' },
    activeTabText: { color: COLORS.primary, fontWeight: 'bold' },

    chartWrapper: { 
        backgroundColor: 'white', 
        padding: 10, 
        borderRadius: 10, 
        alignItems: 'center', 
        marginBottom: 20,
        ...Platform.select({
            android: { elevation: 2 },
            default: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }
        })
    },
    chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    emptyContainer: { alignItems: 'center', marginTop: 50, padding: 20 },
    emptyText: { color: 'gray', fontStyle: 'italic', textAlign: 'center' },
    detailsContainer: { 
        backgroundColor: 'white', 
        padding: 15, 
        borderRadius: 10, 
        marginBottom: 40, 
        ...Platform.select({
            android: { elevation: 2 },
            default: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }
        })
    },
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