import dynamic from 'next/dynamic'

export const Form = dynamic(() => import('./Form'))
export const Item = dynamic(() => import('./Item'))
