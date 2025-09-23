// твой файл: StockTable.jsx
import React from 'react';
import c from './workers.module.scss';
import { periods } from '../../utils';
import { Icons } from '../../assets/icons';
import { API } from '../../api';
import { Components } from '..';
import axios from 'axios';

// добавь:
import useBatchProgress from '../../hooks/useBatchProgress';
import ProgressPopup from '../../components/ProgressPopup';

const StockTable = () => {
  const [month, setMonth] = React.useState('');
  const [clients, setClients] = React.useState(null);
  const [active, setActive] = React.useState(false);
  const [editActive, setEditActive] = React.useState(false);
  const [selectedWeek, setSelectedWeek] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState('');

  const { open, title, total, done, percent, runBatch, setOpen } = useBatchProgress();

  const months = [
    "Январь","Февраль","Март","Апрель","Май","Июнь",
    "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
  ];

  const currentDate = new Date();

  React.useEffect(() => {
    const monthName = currentDate.toLocaleString('ru', { month: 'long' });
    setMonth(monthName.charAt(0).toUpperCase() + monthName.slice(1));

    API.getStocks().then(res => {
      setClients(res.data);
    });
  }, []);

  const getWeekNumber = (dateStr) => {
    const day = new Date(dateStr).getDate();
    if (day >= 1 && day <= 7) return 1;
    if (day >= 8 && day <= 14) return 2;
    if (day >= 15 && day <= 21) return 3;
    if (day >= 22) return 4;
    return null;
    };

  const filteredClients = clients
    ?.filter(item => {
      if (selectedWeek === 5) return true;
      const clientWeek = getWeekNumber(item.appointment_date);
      return clientWeek === selectedWeek;
    })
    .filter(item => (item.client_id + '').toLowerCase().includes(searchTerm.toLowerCase().trim()));

  // === ПРИМЕР пакетного запуска ===
  const handleMassAction = async () => {
    if (!filteredClients?.length) return;

    // 1) Собираем «задачи» — ФУНКЦИИ, которые возвращают Promise (одна функция — один запрос)
    const tasks = filteredClients.map((item) => {
      // Здесь — ЛЮБОЙ твой запрос. Примеры:
      // return () => API.updateStock(item.id, { payment_status: 'Оплачено' });
      // return () => API.someAction(item.id);
      // Если используешь axios напрямую:
      return () => axios.post('/api/stocks/some-action', { id: item.id }); // поменяй под свой эндпоинт
    });

    // 2) Запускаем последовательно с попапом и финальным alert
    await runBatch(tasks, { title: 'Выполняем массовое действие по товарам…' });

    // 3) Обновить список (по желанию)
    // const res = await API.getStocks();
    // setClients(res.data);
  };

  return (
    <div className={c.workers}>
      <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Поиск по номеру клиента..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: 8, width: 300, fontSize: 16 }}
        />
        {/* <button onClick={handleMassAction} style={{ padding: '8px 12px' }}>
          Массовое действие (по одному с прогрессом)
        </button> */}
      </div>

      <div className={c.table}>
        <table>
          <thead>
            <tr>
              <th><img src={Icons.edit} alt="edit" /></th>
              <th>Трек-код товара</th>
              <th>Номер клиента</th>
              <th>Вес</th>
              <th>Прайс</th>
              <th>Статус оплаты</th>
              <th>Статус</th>
              <th>
                <button onClick={() => setActive(true)}>+ Добавить</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClients?.length > 0 ? (
              filteredClients.map(item => (
                <tr key={item.id}>
                  <td>
                    <img
                      src={Icons.edit}
                      alt="edit"
                      onClick={() => {
                        localStorage.setItem('edit_stock_ids', JSON.stringify([item]));
                        setEditActive(true);
                      }}
                    />
                  </td>
                  <td>{item.code}</td>
                  <td>{item.client_id}</td>
                  <td>{item.weight} кг</td>
                  <td>{item.price} сом</td>
                  <td>{item.payment_status}</td>
                  <td
                    className={
                      item.order_status === 'В пути' ? c.inProgress :
                      item.order_status === 'Готов к выдаче' ? c.delivered :
                      item.order_status === 'Товар передан клиенту' ? c.took :
                      c.defaultStatus
                    }
                  >
                    {item.order_status}
                  </td>
                  <td />
                </tr>
              ))
            ) : (
              <tr>
                <td><img src={Icons.edit} alt="edit" /></td>
                <td colSpan={6}>Товаров нет</td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
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

      {editActive && <Components.EditStock setActive={setEditActive} />}
      {active && <Components.AddStock setActive={setActive} />}
    </div>
  );
};

export default StockTable;