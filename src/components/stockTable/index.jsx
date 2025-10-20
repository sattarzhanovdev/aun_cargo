// StockTable.jsx
import React from 'react';
import c from './workers.module.scss';
import { Icons } from '../../assets/icons';
import { API } from '../../api';
import { Components } from '..';
import axios from 'axios';

// если используешь — оставляю
import useBatchProgress from '../../hooks/useBatchProgress';
import ProgressPopup from '../../components/ProgressPopup';

const ORDER_STATUSES = [
  'Заказ принят',
  'В пути',
  'Готов к выдаче',
  'Товар передан клиенту',
];

const StockTable = () => {
  const [month, setMonth] = React.useState('');
  const [clients, setClients] = React.useState(null);
  const [active, setActive] = React.useState(false);
  const [editActive, setEditActive] = React.useState(false);
  const [selectedWeek, setSelectedWeek] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState('');

  // фильтрация по диапазону дат
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');

  // массовые действия
  const [massDate, setMassDate] = React.useState(''); // обязательная дата
  const [massStatus, setMassStatus] = React.useState(ORDER_STATUSES[0]);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmMode, setConfirmMode] = React.useState(null); // 'update' | 'delete'
  const [confirmTargets, setConfirmTargets] = React.useState([]);

  // попап с заказами клиента
  const [ordersOpen, setOrdersOpen] = React.useState(false);
  const [ordersData, setOrdersData] = React.useState({ client_id: '', orders: [] });

  const { open, title, total, done, percent, runBatch, setOpen } = useBatchProgress();

  React.useEffect(() => {
    const now = new Date();
    const monthName = now.toLocaleString('ru', { month: 'long' });
    setMonth(monthName.charAt(0).toUpperCase() + monthName.slice(1));

    API.getStocks().then(res => {
      setClients(res.data || []);
    });
  }, []);

  // === utils ===
  const dateOnly = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    // YYYY-MM-DD
    return dt.toISOString().slice(0, 10);
  };
  const inRange = (iso, from, to) => {
    if (!iso) return false;
    const v = dateOnly(iso);
    if (!v) return false;
    if (from && v < from) return false;
    if (to && v > to) return false;
    return true;
  };

  // если у тебя есть дата записи, фильтр по неделе
  const getWeekNumber = (dateStr) => {
    if (!dateStr) return null;
    const day = new Date(dateStr).getDate();
    if (day >= 1 && day <= 7) return 1;
    if (day >= 8 && day <= 14) return 2;
    if (day >= 15 && day <= 21) return 3;
    if (day >= 22) return 4;
    return null;
  };

  // фильтрация исходных данных
  const filteredClients = React.useMemo(() => {
    let list = clients || [];
    // фильтр по неделе (если есть поле appointment_date — в твоём примере его нет)
    if (selectedWeek !== 5) {
      list = list.filter(item => getWeekNumber(item.appointment_date) === selectedWeek);
    }
    // фильтр по диапазону дат (по полю created_at; если у тебя другое — поменяй ниже)
    if (dateFrom || dateTo) {
      list = list.filter(item => inRange(item.created_at || item.date || item.createdAt, dateFrom, dateTo));
    }
    // поиск по client_id
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      list = list.filter(item => String(item.client_id || '').toLowerCase().includes(term));
    }
    return list;
  }, [clients, selectedWeek, searchTerm, dateFrom, dateTo]);

  // группируем по client_id (одна строка на клиента)
  const groupedByClient = React.useMemo(() => {
    const map = new Map();
    for (const item of filteredClients || []) {
      const key = item.client_id || '—';
      if (!map.has(key)) {
        map.set(key, {
          client_id: key,
          orders: [],
          totalWeight: 0,
          totalPrice: 0,
          lastStatus: item.order_status || '',
          paymentStatuses: new Set(),
        });
      }
      const g = map.get(key);
      g.orders.push(item);
      g.totalWeight += Number(item.weight || 0);
      g.totalPrice += Number(item.price || 0);
      g.paymentStatuses.add(item.payment_status || '');
      // возьмём «последний» по id как актуальный статус
      if (!g._maxId || (item.id || 0) > g._maxId) {
        g._maxId = item.id || 0;
        g.lastStatus = item.order_status || '';
      }
    }
    return Array.from(map.values()).sort((a, b) => (b._maxId || 0) - (a._maxId || 0));
  }, [filteredClients]);

  // открыть попап «Заказы клиента»
  const openOrdersPopup = (group) => {
    setOrdersData({
      client_id: group.client_id,
      orders: group.orders
        .slice()
        .sort((a, b) => (b.id || 0) - (a.id || 0)),
    });
    setOrdersOpen(true);
  };

  // === массовые действия ===
  const collectByDate = React.useCallback((targetDate) => {
    if (!clients?.length || !targetDate) return [];
    const d = String(targetDate);
    return (clients || []).filter((item) =>
      dateOnly(item.created_at || item.date || item.createdAt) === d
    );
  }, [clients]);

  const openConfirm = (mode) => {
    // mode: 'update' | 'delete'
    const targets = collectByDate(massDate);
    setConfirmTargets(targets);
    setConfirmMode(mode);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    const targets = confirmTargets || [];
    if (!targets.length) return;

    if (confirmMode === 'update') {
      // поштучно меняем статус
      const tasks = targets.map((item) => {
        return () =>
          // === TODO API: замени на свой эндпоинт массового/штучного апдейта ===
          axios.post(`/stocks/${item.id}/status/`, { status: massStatus });
      });
      await runBatch(tasks, { title: `Обновляем статус (${massStatus})…` });
    } else if (confirmMode === 'delete') {
      const tasks = targets.map((item) => {
        return () =>
          // === TODO API: замени на свой эндпоинт удаления ===
          axios.delete(`/stocks/${item.id}`);
      });
      await runBatch(tasks, { title: `Удаляем ${targets.length} позиций…` });
    }

    // обновить список после действий
    const res = await API.getStocks();
    setClients(res.data || []);
  };

  const fmt = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);
  const fmtSom = (n) => `${fmt(Math.round(n))} сом`;
  const fmtKg = (n) => `${fmt(n)} кг`;

  return (
    <div className={c.workers}>
      {/* Панель фильтров */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Поиск по номеру клиента…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: 8, width: 260, fontSize: 16 }}
        />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          c
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </label>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          по
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </label>
        <button onClick={() => { setDateFrom(''); setDateTo(''); }} style={{ padding: '8px 10px' }}>
          Сброс дат
        </button>
        {/* неделя (оставил как было) */}
        <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))}>
          <option value={5}>Все недели</option>
          <option value={1}>1 неделя</option>
          <option value={2}>2 неделя</option>
          <option value={3}>3 неделя</option>
          <option value={4}>4 неделя</option>
        </select>
      </div>

      {/* Массовые действия */}
      <div style={{
        marginBottom: 18, padding: 12, border: '1px solid #e5e7eb',
        borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'
      }}>
        <div style={{ fontWeight: 700 }}>Массовые действия по дате создания</div>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          Дата:
          <input
            type="date"
            value={massDate}
            onChange={(e) => setMassDate(e.target.value)}
          />
        </label>

        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          Новый статус:
          <select value={massStatus} onChange={(e) => setMassStatus(e.target.value)}>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <button
          disabled={!massDate}
          onClick={() => openConfirm('update')}
          className={c.primaryBtn}
        >
          Применить статус по дате
        </button>

        <button
          disabled={!massDate}
          onClick={() => openConfirm('delete')}
          style={{ padding: '8px 12px', border: '1px solid #ef4444', background: '#fff', color: '#ef4444', borderRadius: 10 }}
        >
          Удалить все за дату
        </button>

        <div style={{ marginLeft: 'auto', opacity: 0.8 }}>
          Найдено на дату: {collectByDate(massDate).length}
        </div>
      </div>

      <div className={c.table}>
        <table>
          <thead>
            <tr>
              <th><img src={Icons.edit} alt="edit" /></th>
              <th>Номер клиента</th>
              <th>Позиций</th>
              <th>Итоговый вес</th>
              <th>Итоговая сумма</th>
              <th>Статус оплаты</th>
              <th>Статус</th>
              <th>
                <button onClick={() => setActive(true)}>+ Добавить</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {groupedByClient?.length ? (
              groupedByClient.map(group => {
                const paymentStatus =
                  group.paymentStatuses.size === 1
                    ? Array.from(group.paymentStatuses)[0]
                    : 'Разные';

                return (
                  <tr key={group.client_id}>
                    <td>
                      <img
                        src={Icons.edit}
                        alt="edit"
                        onClick={() => {
                          // откроем редактор с последней записью клиента
                          const last = group.orders[0];
                          localStorage.setItem('edit_stock_ids', JSON.stringify([last]));
                          setEditActive(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>{group.client_id}</td>
                    <td>{group.orders.length}</td>
                    <td>{group.totalWeight} кг</td>
                    <td>{fmtSom(group.totalPrice)}</td>
                    <td>{paymentStatus || '—'}</td>
                    <td
                      className={
                        group.lastStatus === 'В пути' ? c.inProgress :
                        group.lastStatus === 'Готов к выдаче' ? c.delivered :
                        group.lastStatus === 'Товар передан клиенту' ? c.took :
                        c.defaultStatus
                      }
                    >
                      {group.lastStatus || '—'}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <button onClick={() => openOrdersPopup(group)} style={{background: "#216EFD", color: 'white', width: '150px', height: '40px', borderRadius: '7px', border: 0}}>
                        Заказы
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td><img src={Icons.edit} alt="edit" /></td>
                <td colSpan={7}>Товаров нет</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Попап прогресса (из твоего кода) */}
      <ProgressPopup
        open={open}
        title={title}
        percent={percent}
        done={done}
        total={total}
        onClose={() => setOpen(false)}
      />

      {/* Попап «Заказы клиента» */}
      {ordersOpen && (
        <div style={styles.backdrop} onClick={() => setOrdersOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHead}>
              <h3 style={{ margin: 0 }}>Заказы клиента {ordersData.client_id}</h3>
              <button onClick={() => setOrdersOpen(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={{ maxHeight: 520, overflow: 'auto' }}>
              <table className={c.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Трек-код</th>
                    <th>Вес</th>
                    <th>Цена</th>
                    <th>Оплата</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData.orders.length ? ordersData.orders.map(o => (
                    <tr key={o.id}>
                      <td style={{textAlign: 'center'}}>{o.id}</td>
                      <td style={{textAlign: 'center'}}>{o.code}</td>
                      <td style={{textAlign: 'center'}}>{fmtKg(o.weight || 0)}</td>
                      <td style={{textAlign: 'center'}}>{fmtSom(o.price || 0)}</td>
                      <td style={{textAlign: 'center'}}>{o.payment_status || '—'}</td>
                      <td style={{textAlign: 'center'}}>{o.order_status || '—'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className={c.empty}>Нет заказов</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={styles.modalFoot}>
              <div style={{ fontWeight: 800 }}>
                Итого: {ordersData.orders.length} поз., {fmtSom(ordersData.orders.reduce((s, x) => s + (Number(x.price) || 0), 0))}
              </div>
              <button onClick={() => setOrdersOpen(false)} className={c.primaryBtn}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {/* Подтверждение массового действия */}
      {confirmOpen && (
        <div style={styles.backdrop} onClick={() => setConfirmOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHead}>
              <h3 style={{ margin: 0 }}>
                {confirmMode === 'delete' ? 'Удалить товары?' : 'Изменить статусы?'}
              </h3>
              <button onClick={() => setConfirmOpen(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div>
              <p style={{ marginTop: 0 }}>
                Дата: <b>{massDate || '—'}</b><br/>
                Найдено позиций: <b>{confirmTargets.length}</b>
                {confirmMode === 'update' && <> <br/>Новый статус: <b>{massStatus}</b></>}
              </p>
              <p style={{ opacity: .8, marginTop: -4 }}>
                Действие выполнится поштучно с отображением прогресса.
              </p>
            </div>
            <div style={styles.modalFoot}>
              <button onClick={() => setConfirmOpen(false)} style={{ padding: '8px 12px' }}>Отмена</button>
              <button
                onClick={handleConfirm}
                className={c.primaryBtn}
                style={{ background: confirmMode === 'delete' ? '#ef4444' : undefined }}
              >
                {confirmMode === 'delete' ? 'Удалить' : 'Применить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editActive && <Components.EditStock setActive={setEditActive} data={clients} />}
      {active && <Components.AddStock setActive={setActive} />}
    </div>
  );
};

// простые стили модалки (чтобы не править SCSS)
const styles = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,.35)',
    display: 'grid', placeItems: 'center', zIndex: 1000
  },
  modal: {
    width: 'min(1000px, 92vw)', background: '#fff', borderRadius: 16,
    boxShadow: '0 20px 60px rgba(15,23,42,.25)', padding: 16, display: 'flex',
    flexDirection: 'column', gap: 12
  },
  modalHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalFoot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  closeBtn: {
    border: '1px solid #e5e7eb', background: '#fff', borderRadius: 10,
    padding: '6px 10px', cursor: 'pointer', fontWeight: 800
  }
};

export default StockTable;
