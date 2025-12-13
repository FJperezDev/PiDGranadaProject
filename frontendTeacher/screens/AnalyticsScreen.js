import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, Modal, FlatList, RefreshControl, Platform, UIManager, LayoutAnimation 
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getAnalytics } from '../api/evaluationRequests'; 
import { getSubjects } from '../api/coursesRequests';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { StyledButton } from '../components/StyledButton';
import { Filter, ChevronDown, X, BarChart2, Target, Repeat, Layers } from 'lucide-react-native';

const screenWidth = Dimensions.get("window").width;

// Habilitar animaciones para Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Componente pequeño para la barra de progreso en la lista
const ProgressBar = ({ percentage }) => {
    const color = percentage < 50 ? '#ef4444' : (percentage < 80 ? '#f59e0b' : '#10b981');
    return (
        <View style={{ height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, flex: 1, marginTop: 4 }}>
            <View style={{ width: `${percentage}%`, backgroundColor: color, height: '100%', borderRadius: 3 }} />
        </View>
    );
};

export default function AnalyticsScreen({ route }) {
    const { t } = useLanguage();
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
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
            case 'topic': return 'T';
            case 'concept': return 'C';
            case 'group': return 'G';
            case 'question': return 'Q';
            default: return '';
        }
    };

    const prefix = getPrefix();

    const dataForChart = {
        labels: chartData.map((_, index) => `${prefix}${index + 1}`),
        datasets: [{ data: chartData.map(item => item.value) }]
    };

    const chartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        fillShadowGradientFrom: COLORS.primary,
        fillShadowGradientTo: COLORS.primary,
        fillShadowGradientFromOpacity: 0.7,
        fillShadowGradientToOpacity: 0.3,
        color: (opacity = 1) => COLORS.primary, // Color de las barras
        strokeWidth: 0,
        barPercentage: 0.7,
        decimalPlaces: 0,
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gris moderno
        propsForLabels: { fontSize: 11, fontWeight: '600' },
        style: { borderRadius: 16 }
    };

    const chartWidth = Math.max(screenWidth - 40, chartData.length * 45);

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
        >
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>{t('performanceAnalytics') || 'Rendimiento'}</Text>
                <Text style={styles.headerSubtitle}>Analiza tu progreso y estadísticas</Text>
            </View>

            {/* --- SECCIÓN DE CONTROLES / FILTROS --- */}
            <View style={styles.card}>
                <StyledButton onPress={toggleFilters} style={styles.filterHeader}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                            <Filter size={20} color={COLORS.primary} />
                        </View>
                        <View style={{marginLeft: 12}}>
                            <Text style={styles.cardTitle}>{t('configuration') || 'Configuración'}</Text>
                            <Text style={styles.cardSubtitle}>
                                {t(groupBy)} • {selectedSubject ? selectedSubject.name : (t('allSubjects'))}
                            </Text>
                        </View>
                    </View>
                    <ChevronDown size={20} color="#9ca3af" style={{ transform: [{ rotate: showFilters ? '180deg' : '0deg' }] }} />
                </StyledButton>

                {showFilters && (
                    <View style={styles.filterContent}>
                        <Text style={styles.sectionLabel}>{t('groupBy') || 'Agrupar vista por'}</Text>
                        <View style={styles.chipContainer}>
                            {['topic', 'concept', 'group', 'question'].map((mode) => (
                                <StyledButton 
                                    key={mode} 
                                    style={[styles.chip, groupBy === mode && styles.chipActive]}
                                    onPress={() => setGroupBy(mode)}
                                >
                                    <Text style={[styles.chipText, groupBy === mode && styles.chipTextActive]}>
                                        {t(mode) || mode.toUpperCase()}
                                    </Text>
                                </StyledButton>
                            ))}
                        </View>

                        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>{t('filterBySubject') || 'Filtrar Asignatura'}</Text>
                        <StyledButton 
                            style={styles.selectButton} 
                            onPress={handleOpenSubjectFilter}
                        >
                            <Text style={styles.selectButtonText}>
                                {selectedSubject ? selectedSubject.name : (t('allSubjects') || "Todas las Asignaturas")}
                            </Text>
                            <ChevronDown size={16} color="#6b7280" />
                        </StyledButton>

                        {selectedSubject && (
                            <StyledButton onPress={() => setSelectedSubject(null)} style={styles.clearFilterBtn}>
                                <Text style={styles.clearFilterText}>{t('clearFilter') || "Mostrar todas"}</Text>
                            </StyledButton>
                        )}
                    </View>
                )}
            </View>

            {/* --- GRÁFICA --- */}
            {loading && !refreshing ? (
                <View style={[styles.card, { height: 200, justifyContent: 'center' }]}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : chartData.length > 0 ? (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                            <BarChart2 size={20} color="#10b981" />
                        </View>
                        <Text style={styles.cardTitle}>{t('percentageCorrect') || '% de Aciertos'}</Text>
                    </View>
                    
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -10 }}>
                        <BarChart
                            data={dataForChart}
                            width={chartWidth} 
                            height={240} 
                            yAxisLabel=""
                            yAxisSuffix="%"
                            chartConfig={chartConfig}
                            verticalLabelRotation={0}
                            showValuesOnTopOfBars={true} 
                            fromZero={true}
                            withInnerLines={true}
                            withHorizontalLabels={true}
                            withVerticalLabels={true}
                            style={{ paddingRight: 30, marginLeft: -10 }} // Ajuste visual
                        />
                    </ScrollView>
                </View>
            ) : (
                <View style={[styles.card, styles.emptyState]}>
                    <Layers size={40} color="#d1d5db" />
                    <Text style={styles.emptyText}>{t('noData') || 'No hay datos suficientes para mostrar gráficas.'}</Text>
                </View>
            )}

            {/* --- LISTA DE DETALLES --- */}
            {!loading && chartData.length > 0 && (
                <View>
                    <Text style={styles.sectionTitle}>{t('breakdown') || 'Desglose Detallado'}</Text>
                    
                    {chartData.map((item, index) => (
                        <View key={index} style={styles.detailItem}>
                            <View style={styles.detailHeader}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{prefix}{index + 1}</Text>
                                </View>
                                <Text style={styles.detailTitle} numberOfLines={1}>
                                    {item.full_label || item.label}
                                </Text>
                            </View>

                            <View style={styles.detailStatsRow}>
                                <View style={styles.statGroup}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                                        <Target size={14} color="#6b7280" style={{marginRight: 4}} />
                                        <Text style={styles.statLabel}>Aciertos</Text>
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={[
                                            styles.statValue, 
                                            item.value < 50 ? {color: '#ef4444'} : {color: '#10b981'}
                                        ]}>
                                            {item.value}%
                                        </Text>
                                        <ProgressBar percentage={item.value} />
                                    </View>
                                </View>
                                
                                <View style={[styles.statGroup, { flex: 0.4, alignItems: 'flex-end' }]}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                                        <Repeat size={14} color="#6b7280" style={{marginRight: 4}} />
                                        <Text style={styles.statLabel}>Intentos</Text>
                                    </View>
                                    <Text style={styles.statValueSimple}>{item.attempts}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* --- MODAL --- */}
            <Modal 
                visible={showFilterModal} 
                animationType="fade" 
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('selectSubject') || 'Seleccionar Asignatura'}</Text>
                            <StyledButton onPress={() => setShowFilterModal(false)}>
                                <X size={24} color="#6b7280" />
                            </StyledButton>
                        </View>
                        
                        <FlatList
                            data={filterOptions}
                            keyExtractor={(item) => item.id.toString()}
                            style={{ maxHeight: 300 }}
                            renderItem={({ item }) => (
                                <StyledButton 
                                    style={[
                                        styles.modalItem,
                                        selectedSubject?.id === item.id && styles.modalItemSelected
                                    ]}
                                    onPress={() => handleSelectOption(item)}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        selectedSubject?.id === item.id && { color: COLORS.primary, fontWeight: 'bold' }
                                    ]}>{item.name}</Text>
                                    {selectedSubject?.id === item.id && <Target size={16} color={COLORS.primary} />}
                                </StyledButton>
                            )}
                        />
                    </View>
                </View>
            </Modal>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 }, // Fondo más claro y limpio
    
    // Header
    headerContainer: { marginBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
    headerSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },

    // Cards Genéricas
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 3 },
            web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.05)' }
        }),
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginLeft: 12 },
    cardSubtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
    
    // Icon Boxes
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

    // Filtros
    filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.background },
    filterContent: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16 },
    sectionLabel: { fontSize: 12, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    
    // Chips
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { 
        paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, 
        backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: 'transparent' 
    },
    chipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
    chipText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
    chipTextActive: { color: COLORS.primary },

    // Select Button
    selectButton: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
        padding: 12, borderRadius: 10
    },
    selectButtonText: { fontSize: 14, color: '#374151' },
    clearFilterBtn: { alignItems: 'center', marginTop: 12 },
    clearFilterText: { fontSize: 13, color: '#ef4444', fontWeight: '600' },

    // Empty State
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { color: '#9ca3af', marginTop: 10, textAlign: 'center' },

    // Detalles Lista
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 12 },
    detailItem: {
        backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 10,
        borderWidth: 1, borderColor: '#f3f4f6'
    },
    detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    badge: { 
        backgroundColor: '#eff6ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginRight: 10 
    },
    badgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
    detailTitle: { fontSize: 15, fontWeight: '600', color: '#1f2937', flex: 1 },
    
    detailStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statGroup: { flex: 1 },
    statLabel: { fontSize: 12, color: '#9ca3af' },
    statValue: { fontSize: 18, fontWeight: '800', marginRight: 10 },
    statValueSimple: { fontSize: 16, fontWeight: '600', color: '#4b5563' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 20, width: '100%', maxWidth: 400, padding: 20, elevation: 5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between' },
    modalItemSelected: { backgroundColor: '#f9fafb' },
    modalItemText: { fontSize: 16, color: '#4b5563' },
});