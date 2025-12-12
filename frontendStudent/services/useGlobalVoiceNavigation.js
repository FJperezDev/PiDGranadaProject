// hooks/useGlobalVoiceNavigation.js
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useVoiceControl } from '../context/VoiceContext';

export const useGlobalVoiceNavigation = () => {
    const navigation = useNavigation();
    const { transcript, setTranscript } = useVoiceControl();

    useEffect(() => {
        if(!transcript) return;
        const spoken = transcript.toLowerCase();

        if (spoken.includes('volver') || spoken.includes('atrás') || spoken.includes('back')) {
            if (navigation.canGoBack()) {
                navigation.goBack();
                setTranscript('');
            }
        }
    }, [transcript, navigation]);
};