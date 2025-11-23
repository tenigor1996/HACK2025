import { useEffect, useRef, useState } from 'react';

function useIntersectionObserver(options) {
  const [entries, setEntries] = useState([]);
  const observer = useRef(null);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(observedEntries => {
      observedEntries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.current.unobserve(entry.target);
        }
      });
    }, options);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [options]);

  return observer;
}

export default useIntersectionObserver;
