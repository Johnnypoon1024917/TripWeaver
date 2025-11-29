import { useState, useEffect  from 'react';
import { Dimensions  from 'react-native';

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window ) => {
      setWindowDimensions(window);
    );

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      
    ;
  , []);

  return windowDimensions;
;