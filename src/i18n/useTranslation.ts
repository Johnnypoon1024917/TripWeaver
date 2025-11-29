import { useSelector, useDispatch  from 'react-redux';
import { RootState  from '../store';
import { setLanguage  from '../store/slices/settingsSlice';
import { translations, Language  from './translations';

export const useTranslation = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.settings.language);

  const t = translations[language];

  const changeLanguage = (newLanguage: Language) => {
    dispatch(setLanguage(newLanguage));
  ;

  return { t, language, changeLanguage ;
;
