import { StaticImageData } from 'next/image'

import user11 from '@assets/images/avatar/user-11.png'
import user13 from '@assets/images/avatar/user-13.png'
import user15 from '@assets/images/avatar/user-15.png'

export const appointmentData: AppointmentItem[] = [
  {
    name: 'Jerry Kizer',
    status: 'pending',
    time: '11:49 AM - 12 Jun, 2024',
    image: user15,
  },
  {
    name: 'Thomas Maloney',
    status: 'pending',
    time: '04:44 PM - 18 Jul, 2024',
    image: user11,
  },
  {
    name: 'Dawn Beebe',
    status: 'accepted',
    time: '01:24 PM - 12 Jun, 2024',
    image: user13,
  },
]

export interface AppointmentItem {
  image: StaticImageData // Correct type for imported images
  name: string
  time: string
  status: 'pending' | 'accepted' | 'rejected' // Status must match these exact strings
}
