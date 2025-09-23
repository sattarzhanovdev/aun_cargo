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
    setRows(prev => [...prev, { ...emptyRow }])
  }

  const handleSave = () => {
    const payload = rows.map(item => ({
      id: item.id,
      code: item.code,
      client_id: item.client_id,
      name: item.name,
      weight: item.weight,
      price: +item.price || 0,
      order_status: item.order_status || '',
      payment_status: item.payment_status || ''
    }))

    API.putStock(payload[0].id, payload) // основной ID — любой из payload
      .then(res => {
        if (res.status === 200 || res.status === 201) {
          setActive(false)
          window.location.reload()
        }
      })
      .catch(err => {
        console.error('Ошибка при сохранении товара:', err)
        alert('Ошибка при сохранении. Проверьте консоль.')
      })
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
              id={`status-${idx}`}
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