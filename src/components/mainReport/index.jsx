import React from 'react'
import c from './mainReport.module.scss'
import { Icons } from '../../assets/icons'

// сюда подставь свои значения из API
const mock = {
  revenue: 1140, expense: 0, profit: 1140,
  avgCheck: 1140, orders: 1, items: 6,
  cashSum: 1140, cardSum: 0,
  lastSales: [{ id: 1, date: '2025-09-23T10:55:53', pay: 'Наличные', items: 6, sum: 1140 }],
  lastExpenses: [], // [{date:'', id: 0, sum: 0}]
  allTimeRevenue: 2490, allTimeProfit: 2490,
  trendDays: Array.from({length:31},(_,i)=>i+1)
}

const money = (n)=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(n)+' сом'

export default function MainReport(){
  const [preset, setPreset] = React.useState('month')
  const cashPct = mock.revenue ? (mock.cashSum/mock.revenue)*100 : 0
  const cardPct = mock.revenue ? (mock.cardSum/mock.revenue)*100 : 0

  return (
    <div className={c.page}>
      <div className={c.header}>
        <div>
          <h1>Главный отчёт</h1>
          <p>Все ключевые метрики за выбранный период</p>
        </div>
        <div className={c.pills}>
          {[
            ['month','Текущий месяц'],
            ['7d','7 дней'],
            ['30d','30 дней'],
            ['today','Сегодня'],
            ['custom','Свой период'],
          ].map(([key,label])=>(
            <button key={key} className={preset===key?c.active:''}
              onClick={()=>setPreset(key)}>{label}</button>
          ))}
        </div>
      </div>

      <div className={c.topCards}>
        <div className={c.card}>
          <div className={c.up}><img src={Icons.date} alt="" /><h3>Оборот (выручка)</h3></div>
          <div className={c.down}><h1>{money(mock.revenue)}</h1><span className={c.delta}>▲ 15,56% к прошлому месяцу</span></div>
        </div>
        <div className={c.card}>
          <div className={c.up}><img src={Icons.expenses} alt="" /><h3>Расходы</h3></div>
          <div className={c.down}><h1>{money(mock.expense)}</h1><span className={c.deltaGreen}>▲ 100% меньше/больше прошл. мес.</span></div>
        </div>
        <div className={c.card}>
          <div className={c.up}><img src={Icons.document} alt="" /><h3>Прибыль (выручка – расходы)</h3></div>
          <div className={c.down}><h1>{money(mock.profit)}</h1><span className={c.delta}>▲ 20% к прошлому месяцу</span></div>
        </div>
        <div className={c.card}>
          <div className={c.up}><img src={Icons.ticket} alt="" /><h3>Средний чек</h3></div>
          <div className={c.downCol}>
            <div className={c.big}>{new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(mock.avgCheck)}</div>
            <div className={c.rows}>
              <div><span>заказов</span><b>{mock.orders}</b></div>
              <div><span>тов. позиций</span><b>{mock.items}</b></div>
            </div>
          </div>
        </div>
      </div>

      <div className={c.row2}>
        <div className={c.block}>
          <h3>Разложение оплат</h3>
          <div className={c.payRow}>
            <div className={c.payLabel}>Наличные</div>
            <div className={c.bar}><div className={c.fillGreen} style={{width:`${cashPct}%`}}/></div>
            <div className={c.payVal}>{money(mock.cashSum)}</div>
          </div>
          <div className={c.payRow}>
            <div className={c.payLabel}>Карта</div>
            <div className={c.bar}><div className={c.fillGray} style={{width:`${cardPct}%`}}/></div>
            <div className={c.payVal}>{money(mock.cardSum)}</div>
          </div>
        </div>

        <div className={c.block}>
          <h3>Тренд: выручка vs расходы</h3>
          <div className={c.chart}>
            <div className={c.legend}>
              <span className={c.dotBlue}/><b>выручка</b>
              <span className={c.dotRed}/><b>расходы</b>
            </div>
            <div className={c.axis}>
              {mock.trendDays.map(d=>(<div key={d} className={c.tick}>{String(d).padStart(2,'0')}</div>))}
            </div>
          </div>
        </div>
      </div>

      <div className={c.row2}>
        <div className={c.block}>
          <h3>Последние продажи</h3>
          <table className={c.table}>
            <thead><tr><th>Дата</th><th>Оплата</th><th>Позиции</th><th>Сумма</th></tr></thead>
            <tbody>
              {mock.lastSales.length?mock.lastSales.map(s=>(
                <tr key={s.id}>
                  <td>{new Date(s.date).toLocaleString('ru-RU')}</td>
                  <td>{s.pay}</td>
                  <td>{s.items}</td>
                  <td className={c.alignR}>{new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(s.sum)}</td>
                </tr>
              )):<tr><td colSpan={4} className={c.empty}>Нет продаж за период</td></tr>}
            </tbody>
          </table>
        </div>

        <div className={c.block}>
          <h3>Последние расходы</h3>
          <table className={c.table}>
            <thead><tr><th>Дата</th><th>ID</th><th>Сумма</th></tr></thead>
            <tbody>
              {mock.lastExpenses.length?mock.lastExpenses.map(e=>(
                <tr key={e.id}>
                  <td>{new Date(e.date).toLocaleString('ru-RU')}</td>
                  <td>{e.id}</td>
                  <td className={c.alignR}>{money(e.sum)}</td>
                </tr>
              )):<tr><td colSpan={3} className={c.empty}>Нет расходов за период</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className={c.row2}>
        <div className={c.blockWide}>
          <div className={c.inlineHead}>
            <img src={Icons.date} alt="" />
            <h3>Оборот / Прибыль (all-time)</h3>
          </div>
          <div className={c.inlineNums}>
            <b>{money(mock.allTimeRevenue)}</b>
            <span>/</span>
            <i>{money(mock.allTimeProfit)}</i>
          </div>
        </div>

        <div className={c.blockWide}>
          <div className={c.inlineHead}>
            <img src={Icons.expenses} alt="" />
            <h3>Расходы (период)</h3>
          </div>
          <div className={c.inlineOnlyBig}><b>{money(mock.expense)}</b></div>
        </div>
      </div>
    </div>
  )
}