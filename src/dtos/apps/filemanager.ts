export interface FileListRecord {
  id: number
  image: string
  type: string
  documentName: string
  size: string
  lastEdit: string
}
export interface FolderListRecord {
  id: number
  name: string
  description: string
}
export interface RenameFilesPropsModal {
  closeModal: (key: string) => void
  filesList: FileListRecord[]
  editMode: boolean
  currentFile: FileListRecord | null
}
export interface AddNewFolderModal {
  modalState: { [key: string]: boolean }
  closeModal: (key: string) => void
  folderList: FolderListRecord[]
  editMode: boolean
  currentFolder: FolderListRecord | null
}
