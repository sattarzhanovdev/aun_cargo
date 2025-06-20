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
}

const EditStock = ({ setActive }) => {
  const idsFromStorage = React.useMemo(() => {
    return JSON.parse(localStorage.getItem('edit_stock_ids') || '[]')
  }, [])

  // Заполнить строки по количеству ID
  const initialRows = idsFromStorage.map(id => ({ ...emptyRow, id }))
  const [rows, setRows] = React.useState(initialRows.length > 0 ? initialRows : [emptyRow])

  // ---------- изменение полей ----------
  const handleChange = (index, field, value) => {
    setRows(prev =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    )
  }

  const addRow = () => setRows(prev => [...prev, { ...emptyRow, id: null }])

  // ---------- сохранить ----------
  const handleSave = () => {
    const payload = rows.map(item => ({
      id: item.id,
      code: item.code,
      name: item.name,
      price: +item.price || 0,
      order_status: item.order_status || '',
    }))

    API.putStock(idsFromStorage[0], payload)
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
          {/* ID (только для отображения) */}
          <div className={c.addExpense__form__item}>
            <label htmlFor={`id-${idx}`}>ID</label>
            <input
              id={`id-${idx}`}
              value={row.id || ''}
              placeholder="ID (из localStorage)"
              disabled
            />
          </div>

          {/* код */}
          <div className={c.addExpense__form__item}>
            <label htmlFor={`code-${idx}`}>Код</label>
            <input
              id={`code-${idx}`}
              value={row.code}
              placeholder="Код товара"
              onChange={e => handleChange(idx, 'code', e.target.value)}
            />
          </div>

          {/* наименование */}
          <div className={c.addExpense__form__item}>
            <label htmlFor={`name-${idx}`}>Наименование</label>
            <input
              id={`name-${idx}`}
              value={row.name}
              placeholder="Введите наименование"
              onChange={e => handleChange(idx, 'name', e.target.value)}
            />
          </div>

          {/* прайс */}
          <div className={c.addExpense__form__item}>
            <label htmlFor={`price-${idx}`}>Прайс</label>
            <input
              id={`price-${idx}`}
              value={row.price}
              placeholder="Введите прайс"
              onChange={e => handleChange(idx, 'price', e.target.value)}
            />
          </div>

          {/* статус */}
          <div className={c.addExpense__form__item}>
            <label htmlFor={`status-${idx}`}>Статус</label>
            <select
              id={`status-${idx}`}
              value={row.order_status}
              onChange={e => handleChange(idx, 'order_status', e.target.value)}
            >
              <option value="" disabled>Выберите статус</option>
              <option value="Приехал">Приехал</option>
              <option value="На складе">На складе</option>
              <option value="Передан">Передан</option>
            </select>
          </div>
        </div>
      ))}

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