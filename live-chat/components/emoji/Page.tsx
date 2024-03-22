import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export default function Page({onEmojiSelect}:any) {
  return (
    <Picker data={data} onEmojiSelect={onEmojiSelect} />
  )
}