import cn from "classnames"

export interface GridProps extends React.ComponentProps<"div"> {
  compact?: boolean
  topLeft?: React.ReactNode
  topCenter?: React.ReactNode
  topRight?: React.ReactNode
  centerLeft?: React.ReactNode
  center?: React.ReactNode
  centerRight?: React.ReactNode
  bottomLeft?: React.ReactNode
  bottomCenter?: React.ReactNode
  bottomRight?: React.ReactNode
}

export const Grid: React.FC<GridProps> = ({
  topLeft,
  topCenter,
  topRight,
  centerLeft,
  center,
  centerRight,
  bottomLeft,
  bottomCenter,
  bottomRight,
  compact = false,
  className = "",
  ...props
}) => {
  return (
    <div
      className={cn({
        "flex h-full w-full flex-col items-stretch p-[120px]": true,
        "space-y-20": !compact,
        "space-y-10": compact,
        [className]: !!className,
      })}
      {...props}
    >
      <div className="flex h-40 w-full space-x-20">
        <div className="relative w-40">{topLeft}</div>
        <div className="relative grow">{topCenter}</div>
        <div className="relative w-40">{topRight}</div>
      </div>
      <div className="flex w-full grow space-x-20">
        <div className="relative w-40">{centerLeft}</div>
        <div className="relative grow">{center}</div>
        <div className="relative w-40">{centerRight}</div>
      </div>
      <div className="flex h-40 w-full space-x-20">
        <div className="relative w-40">{bottomLeft}</div>
        <div className="relative grow">{bottomCenter}</div>
        <div className="relative w-40">{bottomRight}</div>
      </div>
    </div>
  )
}
