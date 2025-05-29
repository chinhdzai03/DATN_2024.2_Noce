import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='flex flex-row justify-center items-center mt-10 mr-40 animate-slide-in-left'>
      <div className=' w-[35%] h-auto z-0'>
        <img src="/img/a2.jpg" alt="img1" className="w-full h-full object-cover" />
      </div>
      <div className='z-20'><SignIn /></div>
    </div>
  )
}