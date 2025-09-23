import { Pages } from "../pages"

export const NavList = [
  {
    id: 1,
    title: 'Главная',
    route: '/'
  },
  {
    id: 3,
    title: 'Расходы',
    route: '/expenses'
  },
  {
    id: 4,
    title: 'Склад',
    route: '/stock'
  }
]


export const periods = [
  {
    id: 1,
    title: 'Неделя 1'
  },
  {
    id: 2,
    title: 'Неделя 2'
  },
  {
    id: 3,
    title: 'Неделя 3'
  },
  {
    id: 4,
    title: 'Неделя 4'
  },
  {
    id: 5,
    title: 'Месяц'
  },
]

export const PUBLIC_ROUTES = [
  {
    id: 1,
    page: <Pages.Main />,
    route: '/'
  },
  {
    id: 2,
    page: <Pages.Stocks />,
    route: '/stock'
  },
  {
    id: 3,
    page: <Pages.Finances />,
    route: '/finances'
  },
  {
    id: 4,
    page: <Pages.Expenses />,
    route: '/expenses'
  },
  {
    id: 5,
    page: <Pages.Finances />,
    route: '/purchases'
  },
]
