import LiveBlockProvider from '@/components/document/LiveBlockProvider'


function Pagelayout({children} : {
  children: React.ReactNode
}) {
  return (
    <LiveBlockProvider>{children}</LiveBlockProvider>
  )
}

export default Pagelayout
