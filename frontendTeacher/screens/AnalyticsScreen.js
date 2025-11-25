import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Modal, FlatList, RefreshControl } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getAnalytics } from '../api/evaluationRequests'; 
import { getSubjects } from '../api/coursesRequests';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { StyledButton } from '../components/StyledButton';

const screenWidth = Dimensions.get("window").width;

export default function AnalyticsScreen() {
    const { t } = useLanguage();
    
    // Estados de Datos
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false); // Para pull-to-refresh

    // Estados de Filtros
    const [groupBy, setGroupBy] = useState('topic'); 
    const [selectedSubject, setSelectedSubject] = useState(null); 
    
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

    // Efecto inicial y cuando cambian filtros
    useEffect(() => {
        fetchData();
    }, [groupBy, selectedSubject]);

    // Función para refrescar al deslizar
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [groupBy, selectedSubject]);

    // Configuración de la Gráfica
    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(13, 148, 136, ${opacity})`, // Teal
        strokeWidth: 2,
        barPercentage: 0.7,
        decimalPlaces: 0,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        // Evita que los números se corten en los lados
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

            {/* SECCIÓN DE FILTROS */}
            <View style={styles.filterContainer}>
                
                {/* Selector de Agrupación */}
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
                            // Lógica de ancho dinámico para evitar solapamiento
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

            {/* MODAL */}
            <Modal visible={showFilterModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('selectSubject') || 'Seleccionar Asignatura'}</Text>
                        <FlatList
                            data={filterOptions}
                            keyExtractor={(item) => item.id}
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
    filterContainer: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 20, elevation: 2 },
    label: { fontSize: 14, color: 'gray', marginBottom: 10, fontWeight: '600' },
    tabs: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 4 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
    activeTab: { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
    tabText: { color: 'gray', fontSize: 11, fontWeight: '600' },
    activeTabText: { color: COLORS.primary, fontWeight: 'bold' },
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