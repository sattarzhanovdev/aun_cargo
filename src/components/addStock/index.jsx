import React from 'react';
import * as XLSX from 'xlsx';
import { API } from '../../api';

const AddStock = ({ setActive }) => {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    try {
      // Отправка на backend — по одному или сразу массивом
      await Promise.all(jsonData.map(item => {
        const data = {
          "code": item['条码内容'],
          "client_id": item["代碼"],
          "weight": 0,
          "price": 0,
          "payment_status": "Не оплачен",
          "order_status": "Заказ принят"
        }
        API.postStock(data)
      }));
      alert('Успешно загружено!');
      setActive(false);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Ошибка при загрузке данных');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
        <h3>Загрузить товары из Excel</h3>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <br /><br />
        <button onClick={() => setActive(false)}>Закрыть</button>
      </div>
    </div>
  );
};

export default AddStock;