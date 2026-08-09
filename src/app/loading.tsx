import { Card, CardContent } from '~/components/ui/card'
import { ImageLoader } from '~/components/ui/loader'
import { Skeleton } from '~/components/ui/skeleton'

/** `index` is only passed when a whole grid of these is on screen at once. */
export default function Loading({ index = 0 }: { index?: number }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardContent className="px-0">
        <div className="relative aspect-3/4 w-full bg-muted/40">
          <ImageLoader phase={index * 260} />
          <Skeleton className="absolute top-3 left-3 h-5 w-24 rounded-full" />
          <Skeleton className="absolute top-3 right-3 h-5 w-14 rounded-md" />
          <div className="absolute inset-x-3 bottom-3 space-y-1.5 rounded-lg bg-background/90 px-2.5 py-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
