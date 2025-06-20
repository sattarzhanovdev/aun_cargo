// pages/return/index.jsx
import React, { useEffect, useRef, useState } from 'react'
import { API }         from '../../api'
import { useNavigate } from 'react-router-dom'

/* ───────── маленькие css-объекты, чтобы не трогать вёрстку ───────── */
const th  = { border:'1px solid #ccc', padding:10, textAlign:'left' }
const td  = { border:'1px solid #eee', padding:10 }
const btn = { width:28, height:28, margin:'0 4px',
              border:'1px solid #ccc', background:'#fff', cursor:'pointer' }

const Return = () => {
  /* позиции продаж, доступные для возврата */
  const [items, setItems] = useState([])       // → SaleItem[]
  /* содержимое корзины возврата */
  const [cart,  setCart]  = useState([])
  /* причина */
  const [reason, setReason] = useState('defect')

  const inputRef = useRef()
  const navigate = useNavigate()

  /* сумма возврата */
  const total = cart.reduce((s,i)=> s + i.qty * +i.price ,0)

  /* ---- загружаем ВСЕ проданные позиции (один раз) ---- */
  useEffect(()=>{
    API.getSales()           // GET /sales/items/   (должен вернуть {id,code,name,price,quantity})
      .then(r => setItems(r.data))
      .catch(e => console.error('Ошибка загрузки позиций продаж',e))
  },[])

  /* ---- сканирование ---- */
  const handleScan = e => {
  if (e.key !== 'Enter') return
  const code = e.target.value.trim()
  if (!code) return

  const item = items.flatMap(sale => sale.items.map(si => ({
    ...si,
    sale_item: sale.id // используем ID продажи как ID позиции
  }))).find(i => i.code === code)

  if (!item) {
    alert('Позиция продажи с таким кодом не найдена')
    e.target.value = ''
    return
  }

  setCart(prev => {
    const ex = prev.find(p => p.sale_item === item.sale_item)
    return ex
      ? prev.map(p =>
          p.sale_item === item.sale_item
            ? { ...p, qty: Math.min(p.qty + 1, item.quantity) }
            : p)
      : [...prev, {
          sale_item: item.sale_item,
          name     : item.name,
          price    : item.price,
          quantity : item.quantity,
          qty      : 1
        }]
  })
  e.target.value = ''
}

  /* ---- изменение кол-ва ---- */
  const changeQty = (idx,d)=>
    setCart(p=>p.map((r,i)=> i===idx
      ? { ...r, qty: Math.max(1, Math.min(r.qty+d, r.quantity)) }
      : r))

  const manualQty = (idx,v)=>
    setCart(p=>p.map((r,i)=> i===idx
      ? { ...r, qty: Math.max(1, Math.min(parseInt(v)||1, r.quantity)) }
      : r))

  const remove = idx => setCart(p=>p.filter((_,i)=>i!==idx))

  /* ---- отправка ---- */
  const handleReturn = async () => {
    if (!cart.length) return alert('Корзина пуста')

    const payload = cart.map(i => ({
      sale_item : i.sale_item,
      quantity  : i.qty,
      reason
    }))

    try {
      await API.createReturn(payload) // POST список!
      alert('Возврат оформлен')
      setCart([])
      navigate('/returns-report')
    } catch (e) {
      console.error(e)
      alert('Ошибка при возврате')
    }
  }

  /* ---- UI ---- */
  return (
    <div style={{padding:24,maxWidth:900,margin:'0 auto',fontFamily:'sans-serif'}}>
      <h2>🔄 Возврат товара</h2>

      <input
        ref={inputRef}
        placeholder="Сканируйте штрихкод…"
        onKeyDown={handleScan}
        autoFocus
        style={{width:'100%',padding:12,fontSize:16,marginBottom:20}}
      />

      <div style={{marginBottom:20}}>
        <label>Причина:&nbsp;</label>
        <select value={reason} onChange={e=>setReason(e.target.value)}>
          <option value="customer">Покупатель вернул</option>
        </select>
      </div>

      <table style={{width:'100%',borderCollapse:'collapse',marginBottom:20}}>
        <thead style={{background:'#f0f0f0'}}>
          <tr>
            <th style={th}>Название</th>
            <th style={th}>Цена</th>
            <th style={th}>Кол-во</th>
            <th style={th}>Сумма</th>
            <th style={th}/>
          </tr>
        </thead>
        <tbody>
          {cart.map((it,idx)=>(
            <tr key={idx}>
              <td style={td}>{it.name}</td>
              <td style={td}>{(+it.price).toFixed(2)} сом</td>
              <td style={td}>
                <button onClick={()=>changeQty(idx,-1)} style={btn}>−</button>
                <input type="number" min={1} value={it.qty}
                       onChange={e=>manualQty(idx,e.target.value)}
                       style={{width:50,textAlign:'center'}}/>
                <button onClick={()=>changeQty(idx,1)} style={btn}>+</button>
                <div style={{fontSize:11,color:'#888'}}>Доступно: {it.quantity}</div>
              </td>
              <td style={td}>{(it.qty*+it.price).toFixed(2)} сом</td>
              <td style={td}>
                <button onClick={()=>remove(idx)}
                        style={{...btn,background:'#ff4d4f',color:'#fff'}}>×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{textAlign:'right'}}>К возврату: {total.toFixed(2)} сом</h3>

      <div style={{textAlign:'right',marginTop:20}}>
        <button onClick={handleReturn}
                style={{background:'#f39c12',color:'#fff',padding:'10px 20px',
                        border:'none',cursor:'pointer'}}>
          🛒 Оформить возврат
        </button>
      </div>
    </div>
  )
}

export default Return