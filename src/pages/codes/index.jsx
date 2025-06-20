import React, { useEffect, useState } from 'react'
import Barcode       from 'react-barcode'
import { useNavigate } from 'react-router-dom'
import { API }        from '../../api'      // твой axios-клиент

const Codes = () => {
  const [name,  setName]  = useState('')
  const [price, setPrice] = useState('')
  const [code,  setCode]  = useState('')
  const [stock, setStock] = useState([])    // ← весь склад
  const navigate = useNavigate()

  /* ───────── 1. подгружаем весь склад один раз ───────── */
  useEffect(() => {
    API.getStocks()                         // GET /stocks/
      .then(res => setStock(res.data))
      .catch(err => console.error('Ошибка загрузки склада', err))
  }, [])

  /* ───────── генератор нового кода ───────── */
  const genCode = (len = 13) =>
    Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('')

  /* ───────── проверка / генерация ───────── */
  const findOrMakeCode = () => {
    if (!name.trim()) return alert('Введите название товара')

    /* ищем по регистру без учёта */
    const found = stock.find(
      item => item.name.toLowerCase().trim() === name.toLowerCase().trim()
    )

    if (found) {
      setCode(found.code)
    } else {
      setCode(genCode())
    }
  }

  /* ───────── UI ───────── */
  return (
    <div style={{ padding: 20 }}>
      <input
        type="text"
        placeholder="Наименование товара"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: 200, height: 40 }}
      />

      <input
        type="number"
        placeholder="Стоимость товара"
        value={price}
        onChange={e => setPrice(e.target.value)}
        style={{ width: 200, height: 40, marginLeft: 20 }}
      />

      <button
        onClick={findOrMakeCode}
        style={btn('#216EFD')}
      >
        Проверить / сгенерировать
      </button>

      <button
        disabled={!code}
        onClick={() =>
          navigate(`/codes-print/${code}/${encodeURIComponent(name)}/${price}`)
        }
        style={btn('green', !code)}
      >
        Распечатать
      </button>

      {code && (
        <div style={{ width: 300, marginTop: 20 }}>
          <h3>{name}</h3>
          <h3>Стоимость: {price}</h3>
          <Barcode value={code} width={1} height={50} fontSize={12} />
        </div>
      )}
    </div>
  )
}

/* helper для кнопок */
const btn = (color, disabled) => ({
  width: 200,
  height: 46,
  marginLeft: 20,
  background: disabled ? '#ccc' : color,
  color: '#fff',
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  borderRadius: 5
})

export default Codes
