import React from 'react'
import c from './add.module.scss'
import { Icons } from '../../assets/icons'
import { API } from '../../api'

const emptyRow = {
  id: null,
  name: '',
  price: '',
  code: '',
  order_status: '',
  payment_status: ''
}

const EditStock = ({ setActive, data }) => {
  // ⏬ Получаем готовые данные из localStorage
  const initialData = React.useMemo(() => {
    return JSON.parse(localStorage.getItem('edit_stock_ids') || '[]')
  }, [])

  const [rows, setRows] = React.useState(
    initialData.length > 0 ? initialData : [emptyRow]
  )

  const handleChange = (index, field, value) => {
    setRows(prev =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    )
  }

  
const addRow = () => {
  setRows(prev => [...prev, { ...emptyRow, client_id: prev?.[0]?.client_id ?? '' }])
}

const handleSave = async () => {
  try {
    const clientId = rows?.[0]?.client_id
    if (!clientId) {
      alert('Не найден client_id — нечего обновлять.')
      return
    }

    const targetItems = (data || []).filter(x => x.client_id === clientId)
    if (!targetItems.length) {
      alert('По этому клиенту товаров не найдено.')
      return
    }

    // Что именно обновляем — берём из первой строки (единое применение)
    const common = {
      order_status: rows?.[0]?.order_status || '',
      payment_status: rows?.[0]?.payment_status || '',
    }

    // Если нужно обновлять ещё и вес/цену одинаково для всех — добавьте сюда:
    // common.weight = rows?.[0]?.weight ?? target.weight

    const requests = targetItems.map(item => {
      const body = {
        id: item.id,
        code: item.code,
        client_id: item.client_id,
        name: item.name,
        weight: item.weight,           // либо rows?.[0]?.weight
        price: Number(item.price) || 0,
        ...common,
      }
      // предполагаю сигнатуру: putStock(id, body)
      return API.putStock(item.id, body)
    })

    const results = await Promise.allSettled(requests)
    const fails = results.filter(r => r.status === 'rejected')

    if (fails.length === 0) {
      setActive(false)
    } else {
      console.error('Ошибки при обновлении:', fails)
      alert(`Обновлено: ${results.length - fails.length}, с ошибкой: ${fails.length}. Подробности в консоли.`)
    }
  } catch (err) {
    console.error('Ошибка при сохранении товара:', err)
    alert('Ошибка при сохранении. Проверьте консоль.')
  }

  window.location.reload()
}
  
  return (
    <div className={c.addExpense}>
      <div className={c.addExpense__header}>
        <h2>Изменение товара</h2>
      </div>

      {rows.map((row, idx) => (
        <div key={idx} className={c.addExpense__form}>
          <div className={c.addExpense__form__item}>
            <label htmlFor={`id-${idx}`}>ID</label>
            <input
              id={`id-${idx}`}
              value={row.client_id || ''}
              placeholder="ID"
              disabled
            />
          </div>

          <div className={c.addExpense__form__item}>
            <label htmlFor={`weight-${idx}`}>Вес</label>
            <input
              type="number"
              id={`weight-${idx}`}
              value={row.weight}
              placeholder="Введите вес"
              onChange={e => handleChange(idx, 'weight', e.target.value)}
            />
          </div>

          <div className={c.addExpense__form__item}>
            <label htmlFor={`status-${idx}`}>Статус</label>
            <select
              id={`status-${idx}`}
              value={row.order_status}
              onChange={e => handleChange(idx, 'order_status', e.target.value)}
            >
              <option value="" disabled>Выберите статус</option>
              <option value="Заказ принят">Заказ принят</option>
              <option value="В пути">В пути</option>
              <option value="Готов к выдаче">Готов к выдаче</option>
              <option value="Товар передан клиенту">Товар передан клиенту</option>
            </select>
          </div>

          <div className={c.addExpense__form__item}>
            <label htmlFor={`payment-${idx}`}>Статус оплаты</label>
            <select
              id={`payment-${idx}`}               // <-- было status-${idx}
              value={row.payment_status}
              onChange={e => handleChange(idx, 'payment_status', e.target.value)}
            >
              <option value="" disabled>Выберите статус</option>
              <option value="Не оплачен">Не оплачен</option>
              <option value="Наличными">Наличными</option>
              <option value="Оплачен картой">Оплачен картой</option>
            </select>
          </div>
        </div>
      ))}

      <div className={c.goods}>
        {
          data && data.filter(value => value.client_id === rows[0].client_id)?.map((item, index) => (
            <div key={index} className={c.goods__item}>
              <span>{item.code}</span>
            </div>
          ))
        }
      </div>

      <button onClick={addRow}>
        <img src={Icons.plus} alt="" /> Добавить строку
      </button>

      <div className={c.res}>
        <button onClick={() => setActive(false)}>Отменить</button>
        <button onClick={handleSave}>
          <img src={Icons.addGreen} alt="" /> Сохранить
        </button>
      </div>
    </div>
  )
}

export default EditStock