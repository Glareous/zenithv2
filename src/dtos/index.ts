// -------- Layout type ------- :)
import { AppointmentList } from './apps/appointmentsList'
// calendar ======================
import { EventItem } from './apps/calendar'
// -------- Dashboard ------- :)
import { Campaign, Transaction } from './apps/campaignperformance'
// category list ======================

import { CategoryItems } from './apps/category'
// chat =======================
import {
  ContactChatRecord,
  GroupChatMember,
  GroupChatMemberRecord,
  GroupChatMessage,
  GroupChatRecord,
  MenuChatSidebarRecord,
  UserChatMessageRecord,
  UserChatRecord,
} from './apps/chat'
// checkout ================
import {
  // CheckoutProduct,
  CheckoutProductAddress,
  // CheckoutProductRecord,
} from './apps/checkout'
// crm =================
import { CrmContactItems } from './apps/crm'
import { DealItem, DealMessage } from './apps/crmdeal'
import { LeadItem } from './apps/crmlead'
// customer ======================
import { CustomerRecord } from './apps/customer'
//departments ================
import { departments } from './apps/departments'
//payroll==================
import { employeeSalary } from './apps/employeeSalary'
import { Contributor, EventGrid } from './apps/eventGrid'
//event list

import { EventList } from './apps/eventList'
import { ExamQuestion } from './apps/exam_question'
import { ExamSchedule } from './apps/exam_schedule'
import { Holidays } from './apps/holidays'
// Invoice ============================

import { InvoiceList, ProductInfo } from './apps/invoice'
//school
import { LibraryBook } from './apps/library_book'
// Email ==============================
import { Email, Replys } from './apps/mail'
// manage reviews =================
import { UserReviewRecord } from './apps/manage_reviews'
// order ==============================
import { OrderListItem } from './apps/orderlist'
//overview =================
import { Appointments, Medicine, Reports } from './apps/overview'
import { Parents } from './apps/parents'
//patient =================
import { Patients } from './apps/patients'
import { ProductGridItem } from './apps/productgrid'
// -------- Apps ------- :)
// ecommerce =====================
import { ProductCategory, ProductListItem } from './apps/products'
// projects ======================
import { ProjectList } from './apps/projects'
// shop cart ================
import { ShopCartProduct } from './apps/shop_cart'
import { Attendance } from './apps/staffattendance'
//staff attendance - leave ================

import { LeaveForm, Leaves } from './apps/staffleaveadd'
import { StaffLeaves } from './apps/staffleaves'
import { StaffList } from './apps/stafflists'
import { StudentList } from './apps/students_list'
import { TeacherListList } from './apps/teachers_list'
import { TeacherPayroll } from './apps/teachers_payroll'
//staff
import { TodayAppointments } from './apps/todayAppointments'
import {
  GroupKeyWordRecord,
  GroupVideoCallChatRecord,
  GroupVideoCallMemberRecord,
} from './apps/video'
// wishlist ================
import { WishListProduct } from './apps/wishlist'
import { Singer, Song } from './dashboards/musicdata'
import { Student } from './dashboards/studentdata'
// -------- Landing ------- :)
import {
  EcommerceLandingProduct,
  ExpertDoctorData,
  HealthServiceData,
  PatientData,
  StudentsReviewData,
} from './landing'
import {
  InterNationalization,
  MainMenu,
  MegaMenu,
  NextPageWithLayout,
  SubMenu,
} from './layout'
// User profile =======================
import {
  TypeOptionsDataRecord,
  UserDocumentFileRecord,
  UserDocumentsFolderRecord,
  UserDocumnentMediaRecord,
  UserFollowerRecord,
  UserProjectRecord,
} from './pages/userprofile'

export type {
  // dashboards
  Campaign,
  Transaction,
  Student,
  Song,
  Singer,

  // components type
  NextPageWithLayout,
  InterNationalization,
  MegaMenu,
  MainMenu,
  SubMenu,

  // landing
  HealthServiceData,
  ExpertDoctorData,
  PatientData,
  StudentsReviewData,
  EcommerceLandingProduct,

  // ecommerce
  ProductListItem,
  ProductCategory,
  ShopCartProduct,
  ProductGridItem,

  // customer
  CustomerRecord,

  // crm
  CrmContactItems,
  LeadItem,
  DealMessage,
  DealItem,

  // projects
  ProjectList,

  // calendar
  EventItem,

  // user profile
  TypeOptionsDataRecord,
  UserFollowerRecord,
  UserDocumnentMediaRecord,
  UserDocumentFileRecord,
  UserDocumentsFolderRecord,
  UserProjectRecord,

  //hostipal

  //payroll
  employeeSalary,

  //departments
  departments,

  // checkout
  // CheckoutProduct,
  // CheckoutProductAddress,
  // CheckoutProductRecord,

  // wishlist
  WishListProduct,

  //EventList
  EventList,

  //EventGrid
  EventGrid,
  Contributor,

  //hostipal patients
  Patients,
  Reports,
  Medicine,
  Appointments,

  //staff-leave-add
  LeaveForm,
  Leaves,

  //Holidays
  Holidays,
  Attendance,

  //orderlist
  OrderListItem,

  //LeaveForm
  StaffLeaves,
  StaffList,

  // Appointments
  TodayAppointments,
  AppointmentList,

  //scholl
  LibraryBook,
  ExamSchedule,
  Parents,
  TeacherPayroll,
  TeacherListList,
  StudentList,
  ExamQuestion,

  // manage reviews
  UserReviewRecord,

  // Email
  Email,
  Replys,

  // category list
  CategoryItems,

  // Invoice
  InvoiceList,
  ProductInfo,

  // checkout
  CheckoutProductAddress,

  // chat
  UserChatMessageRecord,
  UserChatRecord,
  GroupChatMember,
  MenuChatSidebarRecord,
  GroupChatMessage,
  GroupChatRecord,
  ContactChatRecord,
  GroupVideoCallMemberRecord,
  GroupKeyWordRecord,
  GroupVideoCallChatRecord,
  GroupChatMemberRecord,
}
