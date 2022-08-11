import React, { PropsWithChildren, useEffect } from "react"
import cn from "classnames"

export interface CarouselProps extends React.ComponentProps<"div"> {
  interval?: number
}

export const Carousel: React.FC<PropsWithChildren<CarouselProps>> = ({
  children,
  interval = 1 * 60 * 1000,
  className = "",
  ...props
}) => {
  const [active, setActive] = React.useState(0)
  const childrenArray = React.Children.toArray(children)

  useEffect(() => {
    const intervalHandle = setInterval(() => {
      setActive((active) => (active + 1) % childrenArray.length)
    }, interval)
    return () => clearInterval(intervalHandle)
  }, [childrenArray, interval])

  return (
    <div
      className={cn({ "absolute inset-0": true, [className]: className })}
      {...props}
    >
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className={cn({
            "absolute inset-0": true,
            invisible: active !== index,
          })}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
