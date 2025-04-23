import { usePathname } from 'next/navigation'
import React, { Fragment } from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
  

function Breadcumbs() {
    const path = usePathname();
    const segments = path.split('/');
  return (
    <Breadcrumb>
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, index) => {
                    if(!segment) return null; 
                    const href = `/${segments.slice(0, index + 1).join('/')}`;
                    const isLast = index === segments.length - 1;
                    return (
                        <Fragment key={segment}>
                            <BreadcrumbSeparator></BreadcrumbSeparator>
                            <BreadcrumbItem key={segment}>
                            {isLast ? (
                                <BreadcrumbPage>{segment}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink href={href}>{segment}</BreadcrumbLink>
                            )}
                                
                            </BreadcrumbItem>
                        </Fragment>
                    )
            }
                
            )}
        </BreadcrumbList>
    </Breadcrumb>

  )
}

export default Breadcumbs
