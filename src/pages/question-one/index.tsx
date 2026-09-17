import { View } from '@tarojs/components'
import AddressItem from '../../components/AddressItem'
import type { AddressItemData } from '../../types/address'
import './index.scss'

const MOCK_LIST: AddressItemData[] = [
  {
    id: '1',
    name: '张先生',
    phone: '112****3838',
    address: '地址未超过一行展示',
    tags: [
      { text: '常用', variant: 'solid' },
      { text: '公司', variant: 'outline' },
    ],
  },
  {
    id: '2',
    name: '张先生',
    phone: '11212343838',
    address: '地址未超过一行展示',
    tags: [
      { text: '上次下单', variant: 'solid' },
      { text: '学校', variant: 'outline' },
    ],
  },
  {
    id: '3',
    name: '张先生',
    phone: '112****3838',
    address: '城开YOYO联合办公 6楼超过固定长度折行3折行折行折行折行折行折行折行',
    tags: [
      { text: '距离最近', variant: 'solid' },
      { text: '父母家', variant: 'outline' },
    ],
    endTag: '04:59 后餐厅停止接单',
  },
  {
    id: '4',
    name: '张先生',
    phone: '112****3838',
    address: '一行固定宽度展示超出后折行超过固定长度折行折行折行折行折行折行折行折行折行折行',
    tags: [
      { text: '距离最近', variant: 'solid' },
      { text: '家', variant: 'outline' },
    ],
  },
  {
    id: '5',
    name: '张先生',
    phone: '112****3838',
    address: '城开YOYO联合办公 6楼',
    tags: [
      { text: '常用', variant: 'solid' },
      { text: '公司', variant: 'outline' },
    ],
    selected: true,
  },
  {
    id: '6',
    name: '张先生',
    phone: '112****3838',
    address: '一行固定宽度展示超出后折行文案文案文超过固定长度折行折行折行折行折行折行折行折行折行折行',
    tags: [],
  },
]

export default function Index() {
  return (
    <View className='question-one-page'>
      {MOCK_LIST.map((item) => (
        <AddressItem key={item.id} {...item} />
      ))}
    </View>
  )
}
