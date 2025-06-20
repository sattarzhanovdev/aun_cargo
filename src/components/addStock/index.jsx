import React from 'react'
import c from './add.module.scss'
import { Icons } from '../../assets/icons'
import { API } from '../../api'

const emptyRow = {
  name: '',
  price: '',
  code: '',
  order_status: '',
}

const AddStock = ({ setActive }) => {
  const [rows, setRows] = React.useState([emptyRow])
  const [categories, setCategories] = React.useState([])

  // ---------- input helpers ----------
  const handleChange = (index, field, value) => {
    setRows(prev =>
      prev.map((row, i) => {
        if (i !== index) return row
        // фиксируем первоначальное количество
        if (field === 'quantity') {
          return {
            ...row,
          }
        }
        return { ...row, [field]: value }
      })
    )
  }

  const addRow = () => setRows(prev => [...prev, emptyRow])

  // ---------- save ----------
  const handleSave = () => {
    const payload = rows.map(item => ({
      ...item,
      price: +item.price || 0,
    }))

    API.postStock(payload)
      .then(res => {
        if (res.status === 201 || res.status === 200) {
          setActive(false)
          window.location.reload()
        }
      })
      .catch(err => console.error('Ошибка при сохранении товара:', err))
  }

  // ---------- fetch categories once ----------
  React.useEffect(() => {
    API.getCategories()
      .then(res => setCategories(res.data))
      .catch(err => console.error('Не удалось загрузить категории:', err))
  }, [])

  // ---------- render ----------
  return (
    <div className={c.addExpense}>
      <div className={c.addExpense__header}>
        <h2>Добавление товара</h2>
      </div>

      {rows.map((row, idx) => (
        <div key={idx} className={c.addExpense__form}>
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

          {/* цена */}
          <div className={c.addExpense__form__item}>
            <label htmlFor={`price-${idx}`}>Прайс</label>
            <input
              id={`price-${idx}`}
              value={row.price}
              placeholder="Введите прайс"
              onChange={e => handleChange(idx, 'price', e.target.value)}
            />
          </div>
          
          {/* цена */}
          <div className={c.addExpense__form__item}>
            <label htmlFor={`Статус-${idx}`}>Статус</label>
            <select onChange={e => handleChange(idx, 'order_status', e.target.value)} value={row.order_status} id={`Статус-${idx}`}>
              <option selected disabled>Выберите статус</option>
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

export default AddStock
