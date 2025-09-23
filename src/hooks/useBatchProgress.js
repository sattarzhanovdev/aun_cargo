// src/hooks/useBatchProgress.js
import React from 'react';

export default function useBatchProgress() {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('Загрузка...');
  const [total, setTotal] = React.useState(0);
  const [done, setDone] = React.useState(0);
  const [errors, setErrors] = React.useState([]);

  const percent = total ? Math.round((done / total) * 100) : 0;

  const runBatch = React.useCallback(async (tasks, opts = {}) => {
    if (!tasks || !tasks.length) return [];
    setTitle(opts.title || 'Загрузка...');
    setOpen(true);
    setTotal(tasks.length);
    setDone(0);
    setErrors([]);

    const results = [];
    let errorCount = 0;

    for (let i = 0; i < tasks.length; i++) {
      try {
        const res = await tasks[i](); // ВАЖНО: последовательно, один за другим
        results.push(res);
      } catch (e) {
        console.error(`Задача #${i + 1} упала:`, e);
        results.push(null);
        errorCount++;
        setErrors(prev => [...prev, e]);
      } finally {
        setDone(prev => prev + 1);
      }
    }

    setOpen(false);
    if (errorCount === 0) {
      alert('Готово: все запросы выполнены успешно ✅');
    } else {
      alert(`Готово: часть запросов завершилась ошибкой (${errorCount}) ⚠️`);
    }
    return results;
  }, []);

  return { open, title, total, done, percent, errors, runBatch, setOpen };
}