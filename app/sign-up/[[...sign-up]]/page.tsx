import {  SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='flex flex-row justify-center items-center mt-10 ml-40 z-10 animate-slide-in-right'>
      <div className='z-20'><SignUp /></div>
      <div className=' w-[35%] h-auto z-0'>
        <img src="/img/a1.jpg" alt="img1" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}