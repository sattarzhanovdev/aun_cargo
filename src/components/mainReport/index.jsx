import React from 'react'
import c from './mainReport.module.scss'
import { Icons } from '../../assets/icons'
import { API } from '../../api'

const num = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n)

const MainReport = () => {
  const [data, setData] = React.useState({
    revenue: 0,
    expense: 0,
    profit: 0,
    orders: 0,
    items: 0,
    lastSales: [],
    lastExpenses: [],
    allTimeRevenue: 0,
    allTimeProfit: 0
  })

  React.useEffect(() => {
    Promise.all([API.getTransactions(), API.getStocks()])
      .then(([txRes, stockRes]) => {
        const tx = txRes.data || []
        const stocks = stockRes.data || []

        // === Расходы ===
        const expense = tx
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const lastExpenses = tx
          .filter(t => t.type === 'expense')
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map(e => ({
            id: e.id,
            date: e.date,
            sum: Number(e.amount)
          }))

        // === Доходы и продажи ===
        const revenue = stocks.reduce((sum, s) => sum + Number(s.price || 0), 0)
        const orders = stocks.length
        const items = stocks.length // если 1 строка = 1 товар

        const lastSales = stocks
          .slice()
          .sort((a, b) => b.id - a.id)
          .slice(0, 5)
          .map(s => ({
            id: s.id,
            date: s.date || '-',
            pay: s.payment_status === 'Оплачен' ? 'Карта' : 'Наличные',
            items: 1,
            sum: Number(s.price) || 0,
            client: s.client_id,
            code: s.code
          }))

        const profit = revenue - expense

        setData({
          revenue,
          expense,
          profit,
          orders,
          items,
          lastSales,
          lastExpenses,
          allTimeRevenue: revenue,
          allTimeProfit: profit
        })
      })
      .catch(err => console.error('Ошибка загрузки данных:', err))
  }, [])

  return (
    <div className={c.reports}>
      {/* Карточка: Оборот / Прибыль */}
      <div className={c.card}>
        <div className={c.up}>
          <img src={Icons.date} alt="date" />
          <h3>Оборот / Прибыль</h3>
        </div>
        <div className={c.down}>
          <h1>{num(data.revenue)} / {num(data.profit)}</h1>
          <button>Посмотреть</button>
        </div>
      </div>

      {/* Карточка: Расходы */}
      <div className={c.card}>
        <div className={c.up}>
          <img src={Icons.expenses} alt="expenses" />
          <h3>Расходы</h3>
        </div>
        <div className={c.down}>
          <h1>{num(data.expense)}</h1>
          <button>Посмотреть</button>
        </div>
      </div>

      {/* Карточка: Заказы */}
      <div className={c.card}>
        <div className={c.up}>
          <img src={Icons.document} alt="orders" />
          <h3>Заказы / позиции</h3>
        </div>
        <div className={c.down}>
          <h1>{data.orders} / {data.items}</h1>
          <button>Посмотреть</button>
        </div>
      </div>

      {/* Последние продажи */}
      <div className={c.block}>
        <h3>Последние продажи</h3>
        <table className={c.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Код</th>
              <th>Оплата</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {data.lastSales.length ? data.lastSales.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.client}</td>
                <td>{s.code}</td>
                <td>{s.pay}</td>
                <td>{num(s.sum)}</td>
              </tr>
            )) : <tr><td colSpan={5} className={c.empty}>Нет продаж</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Последние расходы */}
      <div className={c.block}>
        <h3>Последние расходы</h3>
        <table className={c.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Дата</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {data.lastExpenses.length ? data.lastExpenses.map(e => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.date}</td>
                <td>{num(e.sum)}</td>
              </tr>
            )) : <tr><td colSpan={3} className={c.empty}>Нет расходов</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MainReport