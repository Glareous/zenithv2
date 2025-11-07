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

const TextAvatar = () => {
  return (
    <div className="col-span-6 card">
      <div className="card-header">
        <h6 className="card-title">Text Avatar</h6>
      </div>
      <div className="flex flex-wrap gap-3 card-body">
        {sizes.map((size) => (
          <div
            key={size}
            className={`flex items-center justify-center rounded-full bg-primary-100 text-primary-500 text-11 ${size}`}>
            {size.replace('size-', '')}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TextAvatar
