import React from 'react'
import c from './mainReport.module.scss'
import { Icons } from '../../assets/icons'
import { API } from '../../api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const num = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n)

const MainReport = () => {
  const [data, setData] = React.useState({
    revenue: 0,
    expense: 0,
    profit: 0,
    orders: 0,
    avgCheck: 0,
    payments: { cash: 0, card: 0 },
    trend: [],
    lastSales: [],
    lastExpenses: []
  })

React.useEffect(() => {
  Promise.all([API.getTransactions(), API.getStocks()])
    .then(([txRes, stockRes]) => {
      const tx = txRes.data.results || []
      const stocks = stockRes.data.results || []

      console.log(tx);
      
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

      // === Отфильтровываем только завершённые и оплаченные заказы ===
      const paidStocks = stocks.filter(s =>
        ['Наличными', 'Оплачен картой'].includes(s.payment_status) &&
        s.order_status === 'Товар передан клиенту'
      )

      // === Доходы ===
      const revenue = paidStocks.reduce((sum, s) => sum + Number(s.price || 0), 0)
      const orders = paidStocks.length
      const items = paidStocks.length
      const avgCheck = orders ? revenue / orders : 0

      // === Разложение оплат ===
      const cash = paidStocks
        .filter(s => s.payment_status === 'Наличными')
        .reduce((sum, s) => sum + Number(s.price || 0), 0)

      const card = paidStocks
        .filter(s => s.payment_status === 'Оплачен картой')
        .reduce((sum, s) => sum + Number(s.price || 0), 0)

      // === Последние продажи ===
      const lastSales = paidStocks
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(s => ({
          id: s.id,
          date: s.created_at ? new Date(s.created_at).toLocaleDateString() : '-',
          pay: s.payment_status,
          sum: Number(s.price) || 0,
          client: s.client_id,
          code: s.code
        }))

      // === Прибыль ===
      const profit = revenue - expense

      setData({
        revenue,
        expense,
        profit,
        orders,
        items,
        avgCheck,
        lastSales,
        lastExpenses,
        payments: { cash, card },
      })
    })
    .catch(err => console.error('Ошибка загрузки данных:', err))
}, [])


  return (
    <div className={c.wrapper}>
      {/* Верхние карточки */}
      <div className={c.topCards}>
        <div className={c.card}><h4>💰 Оборот (выручка)</h4><p>{num(data.revenue)} сом</p></div>
        <div className={c.card}><h4>📄 Расходы</h4><p>{num(data.expense)} сом</p></div>
        <div className={c.card}><h4>📊 Прибыль</h4><p>{num(data.profit)} сом</p></div>
        <div className={c.card}>
          <h4>🎟 Средний чек</h4>
          <p>{num(data.avgCheck)} сом</p>
          <span>{data.orders} заказов</span>
        </div>
      </div>

      {/* Средний ряд */}
      <div className={c.middleRow}>
        <div className={c.paymentCard}>
          <h3>📅 Разложение оплат</h3>
          <div className={c.paymentRow}>
            <span>Наличные</span>
            <div className={c.bar}><div style={{ width: '100%' }} /></div>
            <span>{num(data.payments.cash)} сом</span>
          </div>
          <div className={c.paymentRow}>
            <span>Карта</span>
            <div className={c.bar}><div style={{ width: `${data.payments.card / data.revenue * 100 || 0}%` }} /></div>
            <span>{num(data.payments.card)} сом</span>
          </div>
        </div>

        <div className={c.chartBlock}>
          <h3>📊 Тренд: выручка vs расходы</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" name="Выручка" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Расходы" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Нижний ряд */}
      <div className={c.bottomRow}>
        <div className={c.tableBlock}>
          <h3>Последние продажи</h3>
          <table>
            <thead>
              <tr><th>ID</th><th>Клиент</th><th>Код</th><th>Оплата</th><th>Сумма</th></tr>
            </thead>
            <tbody>
              {data.lastSales.length ? data.lastSales.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td><td>{s.client}</td><td>{s.code}</td><td>{s.pay}</td><td>{num(s.sum)}</td>
                </tr>
              )) : <tr><td colSpan={5}>Нет продаж</td></tr>}
            </tbody>
          </table>
        </div>

        <div className={c.tableBlock}>
          <h3>Последние расходы</h3>
          <table>
            <thead>
              <tr><th>ID</th><th>Дата</th><th>Сумма</th></tr>
            </thead>
            <tbody>
              {data.lastExpenses.length ? data.lastExpenses.map(e => (
                <tr key={e.id}><td>{e.id}</td><td>{e.date}</td><td>{num(e.sum)}</td></tr>
              )) : <tr><td colSpan={3}>Нет расходов</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MainReport
