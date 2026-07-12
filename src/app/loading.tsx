import { Card, CardContent, CardHeader } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'

export default function Loading() {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="gap-2 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Skeleton className="aspect-[3/4] w-full rounded-none" />
      </CardContent>
    </Card>
  )
}
