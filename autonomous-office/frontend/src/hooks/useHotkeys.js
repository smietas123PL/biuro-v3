import { useEffect } from 'react';

export default function useHotkeys(keyMap) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignoruj wpisywanie w polach input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
        return;
      }

      const key = event.key.toLowerCase();
      if (keyMap[key]) {
        event.preventDefault();
        keyMap[key](event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyMap]);
}
