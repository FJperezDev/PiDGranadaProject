import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
    View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, Modal, FlatList, RefreshControl, Platform, UIManager, LayoutAnimation, Alert 
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getAnalytics, resetAnalytics } from '../api/evaluationRequests';
import { getSubjects } from '../api/coursesRequests';
import { COLORS } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import { StyledButton } from '../components/StyledButton';
import { Filter, ChevronDown, X, BarChart2, Target, Repeat, Layers, Trash2 } from 'lucide-react-native';

const screenWidth = Dimensions.get("window").width;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProgressBar = ({ percentage }) => {
    const color = percentage < 50 ? COLORS.danger : (percentage < 80 ? COLORS.warning : COLORS.success);
    return (
        <View style={{ height: 6, backgroundColor: COLORS.lightGray, borderRadius: 3, flex: 1, marginTop: 4 }}>
            <View style={{ width: `${percentage}%`, backgroundColor: color, height: '100%', borderRadius: 3 }} />
        </View>
    );
};

export default function AnalyticsScreen({ route }) {
    const { t, language } = useLanguage();
    const { isSuper } = useContext(AuthContext);
    const { initialGroupBy } = route.params || {};

    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [groupBy, setGroupBy] = useState(initialGroupBy || 'topic'); 
    const [selectedSubject, setSelectedSubject] = useState(null); 
    const [showFilters, setShowFilters] = useState(false);
    
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
    }, [language]);

    useEffect(() => {
        fetchData();
    }, [groupBy, selectedSubject]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [groupBy, selectedSubject]);

    const confirmDelete = (title, message, deleteParams) => {
        if (Platform.OS === 'web') {
            if (window.confirm(`${title}\n${message}`)) {
                performDelete(deleteParams);
            }
        } else {
            Alert.alert(
                title,
                message,
                [
                    { text: t('cancel'), style: "cancel" },
                    { text: t('delete'), style: "destructive", onPress: () => performDelete(deleteParams) }
                ]
            );
        }
    };

    const performDelete = async (params) => {
        setLoading(true);
        try {
            await resetAnalytics(params);
            await fetchData(); 
        } catch (error) {
            Alert.alert(t('error'), t('deleteError') || "No se pudieron eliminar los datos.");
        } finally {
            setLoading(false);
        }
    };

    const handleGlobalReset = () => {
        if (selectedSubject) {
            confirmDelete(
                t('delete'),
                `${t('deleteGroupConfirm')} ${selectedSubject.name}?`,
                { scope: 'subject', subject_id: selectedSubject.id }
            );
        } else {
            confirmDelete(
                `⚠️ ${t('globalReset')}`,
                t('confirmGlobalReset'),
                { scope: 'global' }
            );
        }
    };

    const handleSpecificReset = (item) => {
        const typeLabel = t(groupBy) || groupBy;
        confirmDelete(
            t('delete'),
            `${t('deleteUserConfirm')} ${typeLabel}: "${item.full_label}"?`,
            { 
                scope: 'specific', 
                group_by: groupBy, 
                target_id: item.id, 
                subject_id: selectedSubject?.id 
            }
        );
    };

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
        backgroundGradientFrom: COLORS.surface,
        backgroundGradientTo: COLORS.surface,
        fillShadowGradientFrom: COLORS.primary,
        fillShadowGradientTo: COLORS.primary,
        fillShadowGradientFromOpacity: 0.7,
        fillShadowGradientToOpacity: 0.3,
        color: (opacity = 1) => COLORS.primary, 
        strokeWidth: 0,
        barPercentage: 0.7,
        decimalPlaces: 0,
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, 
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
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <View>
                        <Text style={styles.headerTitle}>{t('performanceAnalytics')}</Text>
                        <Text style={styles.headerSubtitle}>{t('analyzeProgress')}</Text>
                    </View>
                    {isSuper && (
                        <StyledButton 
                            onPress={handleGlobalReset} 
                            style={styles.globalDeleteBtn}
                            variant="danger"
                            size="small"
                            icon={<Trash2 size={22} color={COLORS.danger} />}
                        />
                    )}
                </View>
            </View>

            {/* --- SECCIÓN DE CONTROLES / FILTROS --- */}
            <View style={styles.card}>
                <StyledButton 
                    onPress={toggleFilters} 
                    style={styles.filterHeader}
                    variant="ghost"
                >
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <View style={[styles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
                            <Filter size={20} color={COLORS.primary} />
                        </View>
                        <View style={{marginLeft: 12}}>
                            <Text style={styles.cardTitle}>{t('configuration')}</Text>
                            <Text style={styles.cardSubtitle}>
                                {t(groupBy)} • {selectedSubject ? selectedSubject.name : t('allSubjects')}
                            </Text>
                        </View>
                    </View>
                    <ChevronDown size={20} color={COLORS.gray} style={{ transform: [{ rotate: showFilters ? '180deg' : '0deg' }] }} />
                </StyledButton>

                {showFilters && (
                    <View style={styles.filterContent}>
                        <Text style={styles.sectionLabel}>{t('groupBy')}</Text>
                        <View style={styles.chipContainer}>
                            {['topic', 'concept', 'group', 'question'].map((mode) => (
                                <StyledButton 
                                    key={mode} 
                                    style={[styles.chip, groupBy === mode && styles.chipActive]}
                                    onPress={() => setGroupBy(mode)}
                                    variant="ghost"
                                >
                                    <Text style={[styles.chipText, groupBy === mode && styles.chipTextActive]}>
                                        {t(mode)}
                                    </Text>
                                </StyledButton>
                            ))}
                        </View>

                        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>{t('filterBySubject')}</Text>
                        <StyledButton 
                            style={styles.selectButton} 
                            onPress={handleOpenSubjectFilter}
                            variant="ghost"
                        >
                            <Text style={styles.selectButtonText}>
                                {selectedSubject ? selectedSubject.name : t('allSubjects')}
                            </Text>
                            <ChevronDown size={16} color={COLORS.textSecondary} />
                        </StyledButton>

                        {selectedSubject && (
                            <StyledButton 
                                onPress={() => setSelectedSubject(null)} 
                                style={styles.clearFilterBtn}
                                variant="ghost"
                            >
                                <Text style={styles.clearFilterText}>{t('clearFilter')}</Text>
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
                        <View style={[styles.iconBox, { backgroundColor: COLORS.successBg }]}>
                            <BarChart2 size={20} color={COLORS.success} />
                        </View>
                        <Text style={styles.cardTitle}>{t('percentageCorrect')}</Text>
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
                            style={{ paddingRight: 30, marginLeft: -10 }} 
                        />
                    </ScrollView>
                </View>
            ) : (
                <View style={[styles.card, styles.emptyState]}>
                    <Layers size={40} color={COLORS.border} />
                    <Text style={styles.emptyText}>{t('noData')}</Text>
                </View>
            )}

            {/* --- LISTA DE DETALLES --- */}
            {!loading && chartData.length > 0 && (
                <View>
                    <Text style={styles.sectionTitle}>{t('breakdown')}</Text>
                    
                    {chartData.map((item, index) => (
                        <View key={index} style={styles.detailItem}>
                            <View style={styles.detailHeader}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{prefix}{index + 1}</Text>
                                </View>
                                <Text style={styles.detailTitle} numberOfLines={1}>
                                    {item.full_label || item.label}
                                </Text>
                                {isSuper && (
                                    <StyledButton 
                                        onPress={() => handleSpecificReset(item)} 
                                        style={styles.itemDeleteBtn}
                                        variant="ghost"
                                        size="small"
                                        icon={<Trash2 size={18} color={COLORS.danger} />}
                                    />
                                )}
                            </View>

                            <View style={styles.detailStatsRow}>
                                <View style={styles.statGroup}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                                        <Target size={14} color={COLORS.textSecondary} style={{marginRight: 4}} />
                                        <Text style={styles.statLabel}>{t('hits')}</Text>
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={[
                                            styles.statValue, 
                                            item.value < 50 ? {color: COLORS.danger} : {color: COLORS.success}
                                        ]}>
                                            {item.value}%
                                        </Text>
                                        <ProgressBar percentage={item.value} />
                                    </View>
                                </View>
                                
                                <View style={[styles.statGroup, { flex: 0.4, alignItems: 'flex-end' }]}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                                        <Repeat size={14} color={COLORS.textSecondary} style={{marginRight: 4}} />
                                        <Text style={styles.statLabel}>{t('attempts')}</Text>
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
                            <Text style={styles.modalTitle}>{t('selectSubject')}</Text>
                            <StyledButton onPress={() => setShowFilterModal(false)} variant="ghost" style={{padding: 4}}>
                                <X size={24} color={COLORS.textSecondary} />
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
                                    variant="ghost"
                                >
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
                                        <Text style={[
                                            styles.modalItemText,
                                            selectedSubject?.id === item.id && { color: COLORS.primary, fontWeight: 'bold' }
                                        ]}>{item.name}</Text>
                                        {selectedSubject?.id === item.id && <Target size={16} color={COLORS.primary} />}
                                    </View>
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
    container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
    
    // Header
    headerContainer: { marginBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text },
    headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
    
    globalDeleteBtn: {
        backgroundColor: COLORS.dangerBg,
        borderRadius: 8,
    },

    // Cards Genéricas
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        ...Platform.select({
            ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 3 },
            web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.05)' }
        }),
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginLeft: 12 },
    cardSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
    
    // Icon Boxes
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

    // Filtros
    filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, paddingHorizontal: 0 },
    filterContent: { marginTop: 16, borderTopWidth: 1, borderTopColor: COLORS.background, paddingTop: 16 },
    sectionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    
    // Chips
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { 
        paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, 
        backgroundColor: COLORS.background, borderWidth: 1, borderColor: 'transparent' 
    },
    chipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
    chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
    chipTextActive: { color: COLORS.primaryDark },

    // Select Button
    selectButton: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#f9fafb', borderWidth: 1, borderColor: COLORS.border,
        padding: 12, borderRadius: 10
    },
    selectButtonText: { fontSize: 14, color: COLORS.text },
    clearFilterBtn: { alignItems: 'center', marginTop: 12 },
    clearFilterText: { fontSize: 13, color: COLORS.danger, fontWeight: '600' },

    // Empty State
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { color: COLORS.textSecondary, marginTop: 10, textAlign: 'center' },

    // Detalles Lista
    sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
    detailItem: {
        backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 10,
        borderWidth: 1, borderColor: COLORS.background
    },
    detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    badge: { 
        backgroundColor: '#eff6ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginRight: 10 
    },
    badgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
    detailTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, flex: 1, marginRight: 8 },
    itemDeleteBtn: { padding: 4 },
    
    detailStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statGroup: { flex: 1 },
    statLabel: { fontSize: 12, color: COLORS.textSecondary },
    statValue: { fontSize: 18, fontWeight: '800', marginRight: 10 },
    statValueSimple: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: COLORS.surface, borderRadius: 20, width: '100%', maxWidth: 400, padding: 20, elevation: 5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.background, flexDirection: 'row', justifyContent: 'space-between' },
    modalItemSelected: { backgroundColor: COLORS.background },
    modalItemText: { fontSize: 16, color: COLORS.textSecondary },
});