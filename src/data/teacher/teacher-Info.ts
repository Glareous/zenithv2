interface TeacherIcon {
  name: string
  color: string
  divColor: string
}

// Define the interface for the teacher
interface Teacher {
  name: string
  image: string
  icon: TeacherIcon
}

// Define the interface for each item in teacherInfo
interface TeacherInfoItem {
  subject: string
  teacher: Teacher
}

// Type assertion for the teacherInfo array
const teacherInfo: TeacherInfoItem[] = [
  {
    subject: 'English teacher of the month',
    teacher: {
      name: 'Ronnie Gunderson',
      image: '/assets/images/avatar/user-11.png',
      icon: {
        name: 'archive',
        color: 'text-yellow-500 fill-yellow-500/20',
        divColor: 'border-yellow-500/20 size-12 bg-yellow-500/10',
      },
    },
  },
  {
    subject: 'Physics teacher of the month',
    teacher: {
      name: 'April Lovell',
      image: '/assets/images/avatar/user-15.png',
      icon: {
        name: 'blend',
        color: 'text-sky-500 fill-sky-500/20',
        divColor: 'border-sky-500/20 size-12 bg-sky-500/10',
      },
    },
  },
  {
    subject: 'History teacher of the month',
    teacher: {
      name: 'Elisa Harris',
      image: '/assets/images/avatar/user-16.png',
      icon: {
        name: 'container',
        color: 'text-green-500 fill-green-500/20',
        divColor: 'border-green-500/20 size-12 bg-green-500/10',
      },
    },
  },
  {
    subject: 'Biology teacher of the month',
    teacher: {
      name: 'Jeanne Lane',
      image: '/assets/images/avatar/user-17.png',
      icon: {
        name: 'cross',
        color: 'text-red-500 fill-red-500/20',
        divColor: 'border-red-500/20 size-12 bg-red-500/10',
      },
    },
  },
]

export { teacherInfo }
