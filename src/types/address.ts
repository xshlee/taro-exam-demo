export type TagVariant = 'solid' | 'outline'

export interface AddressTag {
  text: string
  variant: TagVariant
}

export interface AddressItemData {
  id: string
  name: string
  phone: string
  address: string
  tags: AddressTag[]
  endTag?: string
  selected?: boolean
}
