import axios from "axios";
import { get } from "react-hook-form";

export const API = {
  // getClients: () => axios.get('/clients/clients/'),
  // postClient: (data) => axios.post('/clients/clients/', data),
  // updateClient: (id, data) => axios.put(`/clients/clients/${id}/`, data),
  // getClientById: (id) => axios.get(`/clients/clients/${id}/`),
  // getExpenses: () => axios.get('/clients/expenses/'),
  // postExpenses: (data) => axios.post('/clients/expenses/', data),
  // postProfit: (data) => axios.post('/clients/profit/', data),
  // postStock: (data) => axios.post('/clients/stock/', data),
  // getDailyExpenses: () => axios.get('/clients/expenses/stats/daily/'),
  // getWorkers: () => axios.get('/clients/workers/'),
  // getDailyClients: () => axios.get('/clients/today/'),
  // getStocks: () => axios.get('/clients/stock/'),
  // getMonthlyData: () => axios.get('/clients/stats/monthly/'),
  // getStaffInfo: () => axios.get('/clients/stats/staff/'),
  // getStaffInfoWeek: (week) => axios.get(`/clients/stats/staff/?week=${week}`),
  // getCashInfo: () => axios.get('/clients/stats/cash-daily/')
  getTransactions: () => axios.get('/clinets/transactions/'),
  getTransactionsSummary: () => axios.get('/clinets/transactions/summary/'),
  postTransactions: (data) => axios.post('/clinets/transactions/', data),
  getTransactionById: (id) => axios.get(`/clinets/transactions/${id}/`),
  updateTransaction: (id, data) => axios.put(`/clinets/transactions/${id}/`, data),
  deleteTransaction: (id) => axios.delete(`/clinets/transactions/${id}/`),
  getStocks: () => axios.get('/clinets/stocks/'),
  putStocks: (id, value) => axios.put(`/clinets/stocks/${id}/`, value),
  deleteStocks: (id) => axios.delete(`/clinets/stocks/${id}/`),
  getCategories: () => axios.get('/categories/'),
  postStock: (data) => axios.post('/clinets/stocks/', data),
  putStock: (id, data) => axios.put(`/clinets/stocks/${id}/`, data),
  getStockByCode: (code) => axios.get(`/clinets/stocks/?code=${code}`), // или другой эндпоинт
  updateStockQuantity: (id, body) => axios.put(`/clinets/stocks/${id}/`, body), 
  createSale: (data) => axios.post('/sales/', data),
  getSales: () => axios.get('/sales/'), 
  createReturn: (data) => axios.post('/returns/', data),
  openKassa: (sum) => axios.post('/cash-sessions/open/', { opening_sum: sum }),
  closeKassa: (sessionId, sum) => axios.post(`/cash-sessions/${sessionId}/close/`, { closing_sum: sum }), 
  kassaItem: (id) => axios.get(`/cash-sessions/${id}/`),
  getStockById: (id) => axios.get(`/clinets/stocks/${id}/`),
  putStock: (id, data) => axios.put(`/clinets/stocks/${id}/`, data)
}
