import LiveBlockProvider from '@/components/Notion/LiveBlockProvider'


function Pagelayout({children} : {
  children: React.ReactNode
}) {
  return (
    <LiveBlockProvider>{children}</LiveBlockProvider>
  )
}

export default Pagelayout
