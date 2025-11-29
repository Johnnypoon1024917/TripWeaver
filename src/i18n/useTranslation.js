import { useSelector, useDispatch  from 'react-redux';
import { setLanguage  from '../store/slices/settingsSlice';
import { translations  from './translations';
export const useTranslation = () => {
    const dispatch = useDispatch();
    const language = useSelector((state) => state.settings.language);
    const t = translations[language];
    const changeLanguage = (newLanguage) => {
        dispatch(setLanguage(newLanguage));
    ;
    return { t, language, changeLanguage ;
;
