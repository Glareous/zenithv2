import { StaticImageData } from 'next/image'

// user chat
export interface UserChatMessageRecord {
  id: number
  sender: string
  time: string
  text?: string
  avatar?: string | StaticImageData
  avatarName?: string
  type: string
  images?: string | StaticImageData[]
  extraImagesCount?: number
  contentType?: string
  replyText?: string | StaticImageData[]
}
export interface UserChatBoardProps {
  currentChat: UserChatRecord
  handleAudioCallModal: () => void
  handleVideoCallModal: () => void
  contactList: ContactChatRecord[]
  onBack: () => void
}
export interface UserChatRecord {
  id: number
  roomId: number
  name: string
  receiverImage?: string | StaticImageData
  senderImage?: string | StaticImageData
  receiverName?: string
  status: 'online' | 'offline'
  lastMessage: string
  timestamp: string
  unread: number
  lastSeen: string
  messages: UserChatMessageRecord[]
}
export interface UserChatListProps {
  chatMessageList: UserChatRecord[]
  searchContact: (value: string) => void
  searchValue: string
  handleAddNewContact: () => void
  currentChat: UserChatRecord | null
  onSelectChat: (chat: UserChatRecord) => void
}

export interface MenuChatSidebarRecord {
  id: number
  roomId: number
  name?: string
  image?: string | StaticImageData
  isOpenCompanyChat: boolean
}

// group chat
export interface GroupChatMember {
  id: number
  name: string
  role: string
  avatar: string | StaticImageData
}

export interface GroupChatMessage {
  id: number
  user: {
    name: string
    avatar: string | StaticImageData
    status: 'online' | 'offline'
  }
  timestamp: string
  message: string
  type: 'sent' | 'received'
  images?: string | (string | StaticImageData)[] | undefined
  contentType?: string
  replyText?: string
}
export interface GroupChatBoardProps {
  handleAudioCallModal: () => void
  currentGroupChat: GroupChatRecord
  handleDeleteGroupModal: () => void
  onBack: () => void
}
export interface GroupChatRecord {
  id: number
  roomId: number
  name: string
  image: string | StaticImageData
  message: string
  time: string
  badge: number
  unread: boolean
  active: boolean
  members: GroupChatMember[]
  messages: GroupChatMessage[]
}

export interface GroupChatMemberRecord {
  id: number
  roomId: number
  avatar: string | StaticImageData
  name: string
  value: string
  role: string
}

// contact chat
export interface ContactChatRecord {
  id: number
  roomId: number
  name: string
  avatar: string | StaticImageData
}
export interface AddNewContactModalProps {
  open: boolean
  closeModal: () => void
  friendList: ContactChatRecord[]
  handleSearch: (val: string) => void
  searchFriend: string
  contactList: UserChatRecord[]
  defaultChat: UserChatRecord | null
}
export interface UserCallModalProps {
  open: boolean
  closeModal: () => void
  currentContact: UserChatRecord
  handleAudioVideoCall: () => void
}
export interface UserVideoCallModalProps {
  open: boolean
  closeModal: () => void
  currentContact: UserChatRecord
}
export interface AddNewGroupModalProps {
  open: boolean
  closeModal: () => void
  groupChatList: GroupChatRecord[]
}

export interface DeleteGroupModalProps {
  open: boolean
  closeModal: () => void
  deleteGroupChatRecord: () => void
}
export interface GroupChatListProps {
  groupChatList: GroupChatRecord[]
  handleSearchGroups: (value: string) => void
  searchGroup: string
  currentGroupChat: GroupChatRecord
  openAddNewGroupModal: () => void
  onSelectChat: (chat: GroupChatRecord) => void
}
