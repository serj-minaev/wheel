import { useState, useEffect, useCallback } from 'react';
import type { WheelData } from '../types/wheel';
import wheelDataJson from '../../data/wheel-data.json';

export function useWheelData() {
  const [data, setData] = useState<WheelData>(wheelDataJson as WheelData);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    const savedData = localStorage.getItem('wheel-data');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (error) {
        console.error('Ошибка при загрузке данных из localStorage:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Сохранение данных в localStorage
  const saveData = useCallback((newData: WheelData) => {
    setData(newData);
    localStorage.setItem('wheel-data', JSON.stringify(newData));
  }, []);

  // Обновление оценки метрики в основном колесе
  const updateMainMetricScore = useCallback(
    (metricId: string, score: number) => {
      const newData: WheelData = {
        mainWheel: {
          metrics: data.mainWheel.metrics.map((m) =>
            m.id === metricId
              ? { ...m, score: Math.max(0, Math.min(10, score)) }
              : m
          ),
        },
      };
      saveData(newData);
    },
    [data, saveData]
  );

  // Обновление оценки подметрики
  const updateSubMetricScore = useCallback(
    (mainMetricId: string, subMetricId: string, score: number) => {
      const newData: WheelData = {
        mainWheel: {
          metrics: data.mainWheel.metrics.map((m) => {
            if (m.id === mainMetricId && m.subWheel) {
              return {
                ...m,
                subWheel: {
                  metrics: m.subWheel.metrics.map((sm) =>
                    sm.id === subMetricId
                      ? { ...sm, score: Math.max(0, Math.min(10, score)) }
                      : sm
                  ),
                },
              };
            }
            return m;
          }),
        },
      };
      saveData(newData);
    },
    [data, saveData]
  );

  // Универсальная функция обновления любой метрики
  const updateMetricScore = useCallback(
    (path: string[], score: number) => {
      if (path.length === 1) {
        // Основная метрика
        updateMainMetricScore(path[0], score);
      } else if (path.length === 2) {
        // Подметрика
        updateSubMetricScore(path[0], path[1], score);
      }
    },
    [updateMainMetricScore, updateSubMetricScore]
  );

  // Экспорт данных в JSON файл
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wheel-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data]);

  // Импорт данных из JSON файла
  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as WheelData;
        saveData(importedData);
      } catch (error) {
        console.error('Ошибка при импорте данных:', error);
        alert('Ошибка при импорте данных. Проверьте формат файла.');
      }
    };
    reader.readAsText(file);
  }, [saveData]);

  return {
    data,
    isLoading,
    updateMetricScore,
    updateMainMetricScore,
    updateSubMetricScore,
    exportData,
    importData,
  };
}

