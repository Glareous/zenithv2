import { AnyAction, combineReducers, configureStore } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper'

import calendarReducer from './calendar/reducer'
import contactChatReducer from './chat/contact/reducer'
import defaultChatListReducer from './chat/default/reducer'
import groupChatListReducer from './chat/group/reducer'
import contactReducer from './crm/contact/reducer'
import dealReducer from './crm/deal/reducer'
import leadReducer from './crm/lead/reducer'
import categoryReducer from './ecommerce/category-list/reducer'
import checkoutReducer from './ecommerce/checkout/reducer'
import customerListReducer from './ecommerce/customer/list/reducer'
import manageReviewReducer from './ecommerce/manage-reviews/reducer'
import orderReducer from './ecommerce/order/reducer'
import productReducer from './ecommerce/products/list/reducer'
import shopCartReducer from './ecommerce/shop-cart/reducer'
import wishListReducer from './ecommerce/wishlist/reducer'
import mailReducer from './email/reducer'
import eventGrid from './events/grid/reducer'
import eventReducer from './events/list/reducer'
import fileListReducer from './file-manager/filelist/reducer'
import folderListReducer from './file-manager/folderlist/reducer'
import appointmentsReducers from './hospital/appointmentslists/reducer'
import departmentsReducers from './hospital/departments/reducer'
import employeeSalaryReducer from './hospital/employeeSalary/reducer'
import reportReducers from './hospital/overview/reducer'
import patientsReducers from './hospital/patients/reducer'
import attendanceReducers from './hospital/staffattendance/reducer'
import holidaysReducres from './hospital/staffholidays/reducer'
import staffLeaveReducers from './hospital/staffleaves/reducer'
import staffListReducers from './hospital/stafflists/reducer'
import invoiceReducer from './invoice/reducer'
// reducer files
import layoutReducer from './layout/reducer'
import projectReducer from './project/reducer'
import projectsgridReducer from './projects/grid/reducer'
import projectslistReducer from './projects/list/reducer'
import examQuestionReducers from './school/examquestion/reducer'
import exmaListReducers from './school/examschedule/reducer'
import libraryBookReducers from './school/librarybook/reducer'
import parentsReducers from './school/parents/reducer'
import teacherPayrollReducers from './school/payroll/reducer'
import studentListReducers from './school/student/reducer'
import teacherListReducers from './school/teachers/reducer'

const rootReducer = combineReducers({
  Layout: layoutReducer,
  Project: projectReducer,
  Contact: contactReducer,
  Deal: dealReducer,
  Lead: leadReducer,
  EventGrid: eventGrid,
  EventList: eventReducer,
  ProjectsList: projectslistReducer,
  ProjectsGrid: projectsgridReducer,
  ProductList: productReducer,
  CustomerList: customerListReducer,
  Departments: departmentsReducers,
  ShopCarts: shopCartReducer,
  Checkout: checkoutReducer,
  WishList: wishListReducer,
  Patients: patientsReducers,
  Reoprts: reportReducers,
  Holidays: holidaysReducres,
  Attendance: attendanceReducers,
  Calendar: calendarReducer,
  EmployeeSalary: employeeSalaryReducer,
  Mail: mailReducer,
  StaffLeave: staffLeaveReducers,
  StaffList: staffListReducers,
  Appointments: appointmentsReducers,
  ManageReview: manageReviewReducer,
  Order: orderReducer,
  LibraryBooks: libraryBookReducers,
  ExamList: exmaListReducers,
  Parents: parentsReducers,
  Category: categoryReducer,
  DefaultChat: defaultChatListReducer,
  ContactChat: contactChatReducer,
  GroupChat: groupChatListReducer,
  Invoice: invoiceReducer,
  FileList: fileListReducer,
  FolderList: folderListReducer,
  TeacherPayroll: teacherPayrollReducers,
  TeacherList: teacherListReducers,
  StudentList: studentListReducers,
  ExamQuestionList: examQuestionReducers,
})

const reducer = (
  state: ReturnType<typeof rootReducer> | undefined,
  action: AnyAction
) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    }
    return nextState
  } else {
    return rootReducer(state, action)
  }
}

export const makeStore = () =>
  configureStore({
    reducer,
  })

const store = makeStore()

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
