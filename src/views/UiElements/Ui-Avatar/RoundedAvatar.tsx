import Image from 'next/image'

import userImg from '@assets/images/avatar/user-44.png'

const sizes = [
  'size-5',
  'size-6',
  'size-7',
  'size-8',
  'size-9',
  'size-10',
  'size-12',
  'size-14',
  'size-16',
  'size-20',
  'size-24',
]

const RoundedAvatar = () => {
  return (
    <div className="col-span-6 card">
      <div className="card-header">
        <h6 className="card-title">Rounded Images</h6>
      </div>
      <div className="flex flex-wrap gap-3 card-body">
        {sizes.map((size) => (
          <Image
            key={size}
            src={userImg}
            alt="User Avatar"
            className={`rounded-full size-${size}`}
          />
        ))}
      </div>
    </div>
  )
}

export default RoundedAvatar
