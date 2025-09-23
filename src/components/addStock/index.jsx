import React from 'react';
import * as XLSX from 'xlsx';
import { API } from '../../api';

// добавь:
import useBatchProgress from '../../hooks/useBatchProgress';
import ProgressPopup from '../../components/ProgressPopup';

const AddStock = ({ setActive }) => {
  const { open, title, total, done, percent, runBatch, setOpen } = useBatchProgress();

  const mapRowToPayload = (row) => ({
    code: String(row['条码内容'] ?? '').trim(),
    client_id: String(row['代碼'] ?? '').trim(),
    weight: Number(row['weight'] ?? 0),
    price: Number(row['price'] ?? 0),
    payment_status: 'Не оплачен',
    order_status: 'Заказ принят',
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }); // чтобы пустые не терялись

    if (!rows.length) {
      alert('Файл пустой или неверный формат');
      return;
    }

    // 1) Собираем задачи: КАЖДАЯ — функция, возвращающая Promise (одна строка = один POST)
    const tasks = rows.map((row) => {
      const payload = mapRowToPayload(row);
      return () => API.postStock(payload); // ВАЖНО: вернуть функцию, не вызывать сразу
    });

    // 2) Запускаем последовательно с попапом и финальным alert из хука
    await runBatch(tasks, { title: `Импортируем ${rows.length} записей…` });

    // 3) Закрыть модалку (если нужно — можно перед этим обновить список)
    setActive(false);

    // сбросить input (если используешь повторно тот же файл)
    e.target.value = '';
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 420 }}>
        <h3>Загрузить товары из Excel</h3>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <br /><br />
        <button onClick={() => setActive(false)}>Закрыть</button>
      </div>

      {/* Попап прогресса */}
      <ProgressPopup
        open={open}
        title={title}
        percent={percent}
        done={done}
        total={total}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};

export default AddStock;