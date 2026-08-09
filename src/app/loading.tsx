import { Card, CardContent } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'

export default function Loading() {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardContent className="px-0">
        <div className="relative aspect-3/4 w-full">
          <Skeleton className="absolute inset-0 rounded-none" />
          <Skeleton className="absolute top-3 left-3 h-3 w-20" />
          <Skeleton className="absolute top-3 right-3 h-5 w-14 rounded-md" />
          <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
