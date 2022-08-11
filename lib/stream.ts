export interface Stream {
  active?: boolean
  title?: string
  scheduledStart?: string
  actualStart?: string
}

export interface GetStreamResponse {
  current: Stream
  next?: Stream
}
