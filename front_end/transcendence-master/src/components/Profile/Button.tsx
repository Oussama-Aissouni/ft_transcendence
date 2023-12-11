export default function Button(props:any) {

  return (
    <div className={`bg-[${props.color}] h-[30px] flex text-[10px] w-[70px] sm:w-[100px] sm:text-[15px] justify-center rounded-[10px] text-${props.text}`}>
      <button className='w-[100px]'>
        {props.value}
      </button>
    </div>
  )
}
